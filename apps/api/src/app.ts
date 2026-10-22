import express from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttpModule from "pino-http";
import { randomUUID } from "node:crypto";
import { env } from "./lib/env.js";
import { authRouter } from "./routes/auth.js";
import { servicesRouter } from "./routes/services.js";
import { incidentsRouter } from "./routes/incidents.js";
import { authenticate } from "./middleware/auth.js";
import { errorHandler, notFound } from "./middleware/errors.js";
import { prisma } from "./lib/prisma.js";

export const app = express();
app.disable("x-powered-by");
app.use((req, res, next) => { const id = req.header("x-request-id") || randomUUID(); (req as any).id = id; res.setHeader("x-request-id", id); next(); });
app.use(helmet());
app.use(cors({ origin: env.WEB_ORIGIN, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(pinoHttpModule.default({ redact: ["req.headers.authorization", "req.headers.cookie"] }));

app.get("/health", async (_req, res) => {
  try { await prisma.$queryRaw`SELECT 1`; res.json({ status: "ok", service: "relayops-api", database: "ok" }); }
  catch { res.status(503).json({ status: "degraded", service: "relayops-api", database: "unavailable" }); }
});
app.use("/api/v1/auth", authRouter);
app.get("/api/v1/overview", authenticate, async (_req, res, next) => {
  try {
    const [serviceCount, openCount, resolvedCount, sev1Count, recent] = await Promise.all([
      prisma.service.count(),
      prisma.incident.count({ where: { status: { not: "RESOLVED" } } }),
      prisma.incident.count({ where: { status: "RESOLVED" } }),
      prisma.incident.count({ where: { severity: "SEV1", status: { not: "RESOLVED" } } }),
      prisma.incident.findMany({ take: 6, orderBy: { createdAt: "desc" }, include: { service: true, owner: { select: { name: true } } } })
    ]);
    res.json({ data: { serviceCount, openCount, resolvedCount, sev1Count, recent } });
  } catch (err) { next(err); }
});
app.use("/api/v1/services", servicesRouter);
app.use("/api/v1/incidents", incidentsRouter);
app.use(notFound);
app.use(errorHandler);


