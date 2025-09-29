import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { config } from "./config/config";
import { logger } from "./utils/logger";

// Error handling middleware
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('API Error:', err);

  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation error",
      errors: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }))
    });
  }

  // Database errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    return res.status(503).json({
      message: "Database connection failed"
    });
  }

  // Default error
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ message });
}

// Request logging middleware
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLine = `${req.method} ${req.path} ${res.statusCode} - ${duration}ms`;
    console.log(`[API] ${logLine}`);
  });

  next();
}

// Security headers middleware - configurable based on environment
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Skip security headers for local development
  if (config.nodeEnv === 'development') {
    return next();
  }

  // Production security headers
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "media-src 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ];

  res.setHeader('Content-Security-Policy', cspDirectives.join('; '));
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // HSTS for HTTPS
  if (config.enableHttps) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  // Cache control for API endpoints
  if (req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  }

  next();
}

// CORS middleware - environment aware
export function corsHandler(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin;

  // Development: Allow all localhost origins
  if (config.nodeEnv === 'development') {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
  } else {
    // Production: Use configured origins
    const allowedOrigins = Array.isArray(config.corsOrigin) ? config.corsOrigin : [config.corsOrigin];

    if (config.corsOrigin === '*' || (origin && allowedOrigins.includes(origin))) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
    }
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Request-ID'
  );

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
}

// Rate limiting - environment aware
const requestCounts = new Map<string, { count: number; resetTime: number }>();

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestCounts.entries()) {
    if (now > data.resetTime) {
      requestCounts.delete(key);
    }
  }
}, 60000); // Cleanup every minute

export function rateLimiter(windowMs?: number, maxRequests?: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip rate limiting in development for single user
    if (config.nodeEnv === 'development') {
      return next();
    }

    // Use config defaults if not provided
    const window = windowMs || config.rateLimitWindowMs;
    const maxReqs = maxRequests || config.rateLimitMaxRequests;

    const clientId = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const now = Date.now();

    const clientData = requestCounts.get(clientId as string);

    if (!clientData || now > clientData.resetTime) {
      requestCounts.set(clientId as string, {
        count: 1,
        resetTime: now + window
      });
      return next();
    }

    if (clientData.count >= maxReqs) {
      const resetTimeSeconds = Math.ceil((clientData.resetTime - now) / 1000);

      logger.warn(`Rate limit exceeded for IP: ${clientId}`, {
        ip: clientId,
        path: req.path,
        method: req.method,
        resetIn: resetTimeSeconds
      });

      return res.status(429).json({
        message: "Too many requests",
        retryAfter: resetTimeSeconds,
        limit: maxReqs,
        window: window / 1000
      });
    }

    clientData.count++;

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', maxReqs);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxReqs - clientData.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(clientData.resetTime / 1000));

    next();
  };
}