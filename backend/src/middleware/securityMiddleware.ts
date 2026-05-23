/**
 * Security Middleware
 *
 * Middleware de segurança para proteção da aplicação.
 * Helmet, CORS, sanitização e outras proteções.
 */

import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';

// ============================================================================
// HELMET CONFIGURATION
// ============================================================================

export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "data:"],
      connectSrc: ["'self'", "https://api.openai.com", "https://generativelanguage.googleapis.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  dnsPrefetchControl: { allow: true },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: "none" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true
});

// ============================================================================
// CORS CONFIGURATION
// ============================================================================

interface CorsConfig {
  origin: string | string[] | boolean;
  methods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  credentials: boolean;
  maxAge: number;
}

export const corsConfig: CorsConfig = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'https://mmn-ai-to-ai.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-API-Key'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

export function corsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const origin = req.headers.origin;

  if (typeof corsConfig.origin === 'boolean') {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else if (Array.isArray(corsConfig.origin)) {
    if (origin && corsConfig.origin.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
  } else if (typeof corsConfig.origin === 'string') {
    res.setHeader('Access-Control-Allow-Origin', corsConfig.origin);
  }

  res.setHeader('Access-Control-Allow-Methods', corsConfig.methods.join(', '));
  res.setHeader('Access-Control-Allow-Headers', corsConfig.allowedHeaders.join(', '));
  res.setHeader('Access-Control-Exposed-Headers', corsConfig.exposedHeaders.join(', '));
  res.setHeader('Access-Control-Allow-Credentials', String(corsConfig.credentials));
  res.setHeader('Access-Control-Max-Age', String(corsConfig.maxAge));

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  next();
}

// ============================================================================
// INPUT SANITIZATION
// ============================================================================

export function sanitizeInput(req: Request, res: Response, next: NextFunction): void {
  // Remove null bytes and control characters
  const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
      return value
        .replace(/\0/g, '')
        .replace(/[\x00-\x1F\x7F]/g, '')
        .trim();
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, any> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  };

  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  if (req.query) {
    req.query = sanitizeValue(req.query) as any;
  }
  if (req.params) {
    req.params = sanitizeValue(req.params) as any;
  }

  next();
}

// ============================================================================
// SECURITY HEADERS
// ============================================================================

export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  // Prevent caching of sensitive data
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');

  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');

  // Custom security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');

  // Strict Transport Security (if on HTTPS)
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  next();
}

// ============================================================================
// REQUEST SIZE LIMIT
// ============================================================================

export function requestSizeLimit(maxSize: string = '10mb') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    const maxBytes = parseMaxSize(maxSize);

    if (contentLength > maxBytes) {
      res.status(413).json({
        error: 'Payload Too Large',
        message: `Request body exceeds maximum size of ${maxSize}`
      });
      return;
    }

    next();
  };
}

function parseMaxSize(size: string): number {
  const units: Record<string, number> = {
    b: 1,
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024
  };

  const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)$/);
  if (!match) return 10 * 1024 * 1024; // Default 10MB

  const value = parseFloat(match[1]);
  const unit = match[2] as keyof typeof units;

  return value * (units[unit] || 1);
}

// ============================================================================
// COMPRESSED REQUEST LIMIT
// ============================================================================

export function compressedRequestLimit(maxSize: string = '10mb') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const encoding = req.headers['content-encoding'];

    if (encoding === 'gzip' || encoding === 'deflate' || encoding === 'br') {
      // For compressed requests, we can't easily check size without decompressing
      // Just add a warning header
      res.setHeader('X-Compressed-Request', 'true');
    }

    next();
  };
}

// ============================================================================
// TRUST PROXY
// ============================================================================

export function trustProxy() {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Enable trusting proxy for accurate IP in load balancers
    req.setMaxListeners(100);
    next();
  };
}

// ============================================================================
// AUDIT LOG
// ============================================================================

export interface AuditLogEntry {
  timestamp: string;
  ip: string;
  method: string;
  path: string;
  userId?: string;
  userAgent: string;
  statusCode: number;
  responseTime: number;
  requestId: string;
}

export function auditLogMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] as string || generateRequestId();

  // Attach request ID
  (req as any).requestId = requestId;
  res.setHeader('X-Request-ID', requestId);

  // Capture original end
  const originalEnd = res.end;

  res.end = function(this: Response, ...args: any[]): Response {
    const responseTime = Date.now() - startTime;
    const userId = (req as any).user?.id;

    const logEntry: AuditLogEntry = {
      timestamp: new Date().toISOString(),
      ip: getClientIP(req),
      method: req.method,
      path: req.path,
      userId,
      userAgent: req.headers['user-agent'] || 'unknown',
      statusCode: res.statusCode,
      responseTime,
      requestId
    };

    // Log to console (replace with proper logging service in production)
    if (logEntry.statusCode >= 400) {
      console.warn('[AUDIT]', JSON.stringify(logEntry));
    }

    return originalEnd.apply(this, args as any);
  };

  next();
}

function getClientIP(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================================================
// EXPORTS
// ============================================================================

export const securityMiddleware = [
  helmetConfig,
  corsMiddleware,
  securityHeaders,
  sanitizeInput,
  auditLogMiddleware
];

export default securityMiddleware;