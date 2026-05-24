import { Request, Response } from 'express';

export interface Context {
  user?: {
    id: number;
    role: string;
  };
  req?: Request;
  res?: Response;
}
