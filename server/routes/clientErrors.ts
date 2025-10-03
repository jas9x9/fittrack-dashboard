import express from 'express';
import { z } from 'zod';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Schema for client error reports
const ClientErrorSchema = z.object({
  errorId: z.string(),
  message: z.string(),
  stack: z.string().optional(),
  componentStack: z.string().optional(),
  context: z.string().optional(),
  timestamp: z.string(),
  userAgent: z.string(),
  url: z.string(),
  userId: z.string()
});

// POST /api/client-errors - Log client-side errors
router.post('/client-errors', async (req, res) => {
  try {
    const errorData = ClientErrorSchema.parse(req.body);

    // Log the client error using our server logger
    logger.error(`Client Error: ${errorData.message}`, undefined, {
      errorId: errorData.errorId,
      clientError: true,
      stack: errorData.stack,
      componentStack: errorData.componentStack,
      context: errorData.context,
      userAgent: errorData.userAgent,
      url: errorData.url,
      userId: errorData.userId,
      reportedAt: errorData.timestamp
    });

    res.status(200).json({
      success: true,
      errorId: errorData.errorId,
      message: 'Error logged successfully'
    });

  } catch (error) {
    logger.error('Failed to log client error', error as Error, {
      requestBody: req.body
    });

    res.status(400).json({
      success: false,
      message: 'Invalid error report format'
    });
  }
});

export { router as clientErrorsRouter };