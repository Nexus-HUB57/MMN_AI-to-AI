import type { Request, Response } from 'express';

export interface Context {
  user?: {
    id: number;
    role: string;
    email?: string;
    name?: string;
    authMode?: "firebase" | "header" | "none";
  };
  db?: any;
  req?: Request;
  res?: Response;
}
