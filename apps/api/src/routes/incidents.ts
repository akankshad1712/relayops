import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate, allowRoles } from "../middleware/auth.js";
export const incidentsRouter = Router();
incidentsRouter.use(authenticate);

const createSchema = z.object({
  title: z.string().trim().min(5).max(160),
  summary: z.string().trim().min(10).max(4000),
  severity: z.enum(["SEV1", "SEV2", "SEV3", "SEV4"]),
  serviceId: z.string().min(1),
  ownerId: z.string().min(1).optional()
});
const updateSchema = z.object({
  status: z.enum(["INVESTIGATING", "IDENTIFIED", "MONITORING", "RESOLVED"]).optional(),
  severity: z.enum(["SEV1", "SEV2", "SEV3", "SEV4"]).optional(),
  summary: z.string().trim().min(10).max(4000).optional()
}).refine(value => Object.keys(value).length > 0);

incidentsRouter.get("/", async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const severity = typeof req.query.severity === "string" ? req.query.severity : undefined;
    const q = typeof req.query.q === "string" ? req.query.q.trim().slice(0, 120) : undefined;
    const where: any = {};
    if (status && ["INVESTIGATING", "IDENTIFIED", "MONITORING", "RESOLVED"].includes(status)) where.status = status;
    if (severity && ["SEV1", "SEV2", "SEV3", "SEV4"].includes(severity)) where.severity = severity;
    if (q) where.OR = [{ title: { contains: q, mode: "insensitive" } }, { summary: { contains: q, mode: "insensitive" } }];
    const [items, total] = await Promise.all([
      prisma.incident.findMany({ where, include: { service: true, owner: { select: { id: true, name: true, email: true } } }, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit }),
      prisma.incident.count({ where })
    ]);
    res.json({ data: items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
});

incidentsRouter.post("/", allowRoles("ADMIN", "ENGINEER"), async (req, res, next) => {
  try {
    const input = createSchema.parse(req.body);
    const ownerId = input.ownerId || req.user!.id;
    const [service, owner] = await Promise.all([
      prisma.service.findUnique({ where: { id: input.serviceId } }),
      prisma.user.findUnique({ where: { id: ownerId } })
    ]);
    if (!service || !owner) return res.status(400).json({ error: { code: "INVALID_REFERENCE", message: "Service or owner does not exist" } });
    const incident = await prisma.$transaction(async (tx) => {
      const created = await tx.incident.create({ data: { ...input, ownerId }, include: { service: true, owner: { select: { id: true, name: true } } } });
      await tx.incidentEvent.create({ data: { incidentId: created.id, actorId: req.user!.id, type: "INCIDENT_CREATED", message: `Incident created with severity ${created.severity}.`, metadata: { severity: created.severity, serviceId: created.serviceId } } });
      return created;
    });
    res.status(201).json({ data: incident });
  } catch (err) { next(err); }
});

incidentsRouter.patch("/:id", allowRoles("ADMIN", "ENGINEER"), async (req, res, next) => {
  try {
    const input = updateSchema.parse(req.body);
    const existing = await prisma.incident.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: { code: "INCIDENT_NOT_FOUND", message: "Incident not found" } });
    const data: any = { ...input };
    if (input.status === "RESOLVED" && existing.status !== "RESOLVED") data.resolvedAt = new Date();
    if (input.status && input.status !== "RESOLVED") data.resolvedAt = null;
    const incident = await prisma.$transaction(async (tx) => {
      const updated = await tx.incident.update({ where: { id: req.params.id }, data, include: { service: true, owner: { select: { id: true, name: true } } } });
      const changes = Object.entries(input).map(([key, value]) => `${key} changed to ${String(value)}`).join("; ");
      await tx.incidentEvent.create({ data: { incidentId: updated.id, actorId: req.user!.id, type: "INCIDENT_UPDATED", message: changes.slice(0, 1000), metadata: { before: { status: existing.status, severity: existing.severity }, after: { status: updated.status, severity: updated.severity } } } });
      return updated;
    });
    res.json({ data: incident });
  } catch (err) { next(err); }
});


// Timeline is read-only for every authenticated role and ordered chronologically.
incidentsRouter.get("/:id/events", async (req, res, next) => {
  try {
    const incident = await prisma.incident.findUnique({ where: { id: req.params.id }, select: { id: true } });
    if (!incident) return res.status(404).json({ error: { code: "INCIDENT_NOT_FOUND", message: "Incident not found" } });
    const events = await prisma.incidentEvent.findMany({
      where: { incidentId: incident.id },
      include: { actor: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: "asc" }, take: 250
    });
    res.json({ data: events });
  } catch (err) { next(err); }
});
