import { CookieOptions } from "express";

export function getSessionCookieOptions(req: any): CookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };
}
