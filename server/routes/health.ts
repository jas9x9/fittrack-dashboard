import { Router } from "express";
import { healthCheck } from "../storage/database";

export const healthRouter = Router();

// GET /api/health - API health check
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