import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
export function notFound(_req: Request, res: Response) {
  res.status(404).json({ error: { code: "NOT_FOUND", message: "Route not found" } });
}
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Request validation failed", details: err.flatten() } });
  console.error(JSON.stringify({ level: "error", requestId: req.id, message: err instanceof Error ? err.message : "Unknown error" }));
  return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred", requestId: req.id } });
}
