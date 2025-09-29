import type { Express } from "express";
import { createServer, type Server } from "http";
import { json } from "express";
import { corsHandler, securityHeaders, requestLogger, rateLimiter, errorHandler } from "./middleware";
import { exercisesRouter } from "./routes/exercises";
import { goalsRouter } from "./routes/goals";
import { workoutProgressRouter } from "./routes/workoutProgress";
import { healthRouter } from "./routes/health";
import { clientErrorsRouter } from "./routes/clientErrors";
import { metricsRouter } from "./routes/metrics";

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware setup
  app.use(securityHeaders); // Security headers first
  app.use(corsHandler);
  app.use(json());
  app.use('/api', requestLogger);
  app.use('/api', rateLimiter()); // Use config defaults

  // API Routes - all prefixed with /api
  app.use('/api/health', healthRouter);
  app.use('/api/exercises', exercisesRouter);
  app.use('/api/goals', goalsRouter);
  app.use('/api/workout-progress', workoutProgressRouter);
  app.use('/api', clientErrorsRouter);
  app.use('/api', metricsRouter);

  // API 404 handler
  app.use('/api/*', (req, res) => {
    res.status(404).json({ message: 'API endpoint not found' });
  });

  // Error handling middleware (must be last)
  app.use(errorHandler);

  const httpServer = createServer(app);
  return httpServer;
}
