import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./server/routes";
import { serveStatic } from "./server/vite";
import { requestLogger, errorLogger } from "./server/utils/logger";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add comprehensive request logging
app.use(requestLogger);

// Initialize the app for Vercel (async initialization)
let isInitialized = false;

async function initializeApp() {
  if (isInitialized) return app;

  // Register all routes
  await registerRoutes(app);

  // Add error logging middleware
  app.use(errorLogger);

  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  // Serve static files in production
  // Vercel automatically sets NODE_ENV=production
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  }

  isInitialized = true;
  return app;
}

// Initialize the app immediately
await initializeApp();

// Export the Express app for Vercel
export default app;
