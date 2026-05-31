import jwt from "jsonwebtoken";
import type { Request } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "dev-jwt-secret-change-in-production";
const JWT_EXPIRES_IN = "15m";

export interface JWTPayload {
  sub: number;
  role: string;
  iat?: number;
  exp?: number;
}

export function signAccessToken(userId: number, role: string): string {
  return jwt.sign({ sub: userId, role } as JWTPayload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function extractTokenFromRequest(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return null;
}

export function getUserFromRequest(req: Request): { id: number; role: string } | undefined {
  const token = extractTokenFromRequest(req);
  if (!token) return undefined;

  const payload = verifyAccessToken(token);
  if (!payload) return undefined;

  return { id: payload.sub, role: payload.role };
}
