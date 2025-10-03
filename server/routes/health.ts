import { Router } from "express";
import { healthCheck } from "../storage/database.js";
import { logger } from "../utils/logger.js";

export const healthRouter = Router();

// GET /api/health - Basic health check
healthRouter.get('/', async (req, res, next) => {
  try {
    const dbHealthy = await healthCheck();
    const status = dbHealthy ? 200 : 503;

    res.status(status).json({
      status: dbHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      database: dbHealthy ? 'connected' : 'disconnected',
      version: '1.0.0'
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/health/detailed - Comprehensive health check
healthRouter.get('/detailed', async (req, res, next) => {
  try {
    const startTime = Date.now();

    // Check database connectivity and performance
    const dbStart = Date.now();
    const dbHealthy = await healthCheck();
    const dbResponseTime = Date.now() - dbStart;

    // Check memory usage
    const memoryUsage = process.memoryUsage();
    const memoryUsageMB = {
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024)
    };

    // System info
    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      uptime: Math.round(process.uptime()),
      environment: process.env.NODE_ENV || 'development'
    };

    // Overall health calculation
    const isHealthy = dbHealthy && dbResponseTime < 5000; // DB should respond within 5s
    const overallStatus = isHealthy ? 'healthy' : 'degraded';
    const httpStatus = isHealthy ? 200 : 503;

    const healthData = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      version: '1.0.0',
      database: {
        status: dbHealthy ? 'connected' : 'disconnected',
        responseTime: dbResponseTime
      },
      memory: memoryUsageMB,
      system: systemInfo,
      checks: {
        database: dbHealthy ? 'pass' : 'fail',
        memory: memoryUsageMB.heapUsed < 512 ? 'pass' : 'warn', // Warn if using >512MB
        uptime: systemInfo.uptime > 0 ? 'pass' : 'fail'
      }
    };

    // Log health check for monitoring
    logger.info('Health check performed', {
      ...healthData,
      type: 'health_check'
    });

    res.status(httpStatus).json(healthData);
  } catch (error) {
    logger.error('Health check failed', error as Error);
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/health/readiness - Kubernetes-style readiness probe
healthRouter.get('/readiness', async (req, res, next) => {
  try {
    const dbHealthy = await healthCheck();

    if (dbHealthy) {
      res.status(200).json({ ready: true });
    } else {
      res.status(503).json({ ready: false, reason: 'database_unavailable' });
    }
  } catch (error) {
    res.status(503).json({ ready: false, reason: 'health_check_error' });
  }
});

// GET /api/health/liveness - Kubernetes-style liveness probe
healthRouter.get('/liveness', (req, res) => {
  // Simple liveness check - if we can respond, we're alive
  res.status(200).json({ alive: true });
});