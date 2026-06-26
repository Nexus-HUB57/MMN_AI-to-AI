import type { Request, Response } from 'express';

export interface Context {
  user?: {
    id: number;
    role: string;
  };
  db?: any;
  req?: Request;
  res?: Response;
}
