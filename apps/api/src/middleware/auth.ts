import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../lib/env.js";

export interface AuthUser { id: string; role: "ADMIN" | "ENGINEER" | "VIEWER" }
declare global { namespace Express { interface Request { user?: AuthUser } } }

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.header("authorization");
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Bearer token required" } });
  }
  try {
    req.user = jwt.verify(header.slice(7), env.JWT_SECRET) as AuthUser;
    next();
  } catch {
    return res.status(401).json({ error: { code: "INVALID_TOKEN", message: "Token is invalid or expired" } });
  }
}
export function allowRoles(...roles: AuthUser["role"][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: { code: "FORBIDDEN", message: "You do not have permission to perform this action" } });
    }
    next();
  };
}
