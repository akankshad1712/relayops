import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middleware/auth.js";
export const servicesRouter = Router();
servicesRouter.use(authenticate);
servicesRouter.get("/", async (_req, res, next) => {
  try {
    const services = await prisma.service.findMany({
      orderBy: { name: "asc" },
      include: { incidents: { where: { status: { not: "RESOLVED" } }, select: { id: true, severity: true, status: true } } }
    });
    res.json({ data: services });
  } catch (err) { next(err); }
});
