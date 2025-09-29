import express from 'express';
import { z } from 'zod';
import { logger } from '../utils/logger';

const router = express.Router();

// Schema for API metrics
const ApiMetricsSchema = z.object({
  endpoint: z.string(),
  method: z.string(),
  status: z.number(),
  duration: z.number(),
  timestamp: z.string(),
  success: z.boolean(),
  error: z.string().optional()
});

// POST /api/metrics - Log API performance metrics
router.post('/metrics', async (req, res) => {
  try {
    const metrics = ApiMetricsSchema.parse(req.body);

    // Log the API metrics
    if (metrics.success) {
      logger.info(`API Performance: ${metrics.method} ${metrics.endpoint}`, {
        ...metrics,
        type: 'api_performance'
      });
    } else {
      logger.warn(`API Error: ${metrics.method} ${metrics.endpoint}`, {
        ...metrics,
        type: 'api_error'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Metrics logged successfully'
    });

  } catch (error) {
    logger.error('Failed to log API metrics', error as Error, {
      requestBody: req.body
    });

    res.status(400).json({
      success: false,
      message: 'Invalid metrics format'
    });
  }
});

export { router as metricsRouter };