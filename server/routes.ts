import type { Express } from "express";
import { createServer, type Server } from "http";
import { json } from "express";
import { corsHandler, requestLogger, rateLimiter, errorHandler } from "./middleware";
import { exercisesRouter } from "./routes/exercises";
import { goalsRouter } from "./routes/goals";
import { workoutProgressRouter } from "./routes/workoutProgress";
import { healthRouter } from "./routes/health";

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware setup
  app.use(corsHandler);
  app.use(json());
  app.use('/api', requestLogger);
  app.use('/api', rateLimiter(60000, 100)); // 100 requests per minute

  // API Routes - all prefixed with /api
  app.use('/api/health', healthRouter);
  app.use('/api/exercises', exercisesRouter);
  app.use('/api/goals', goalsRouter);
  app.use('/api/workout-progress', workoutProgressRouter);

  // API 404 handler
  app.use('/api/*', (req, res) => {
    res.status(404).json({ message: 'API endpoint not found' });
  });

  // Error handling middleware (must be last)
  app.use(errorHandler);

  const httpServer = createServer(app);
  return httpServer;
}
