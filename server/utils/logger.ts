import { Request, Response } from 'express';

// Logger levels
export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

// Log entry interface
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  requestId?: string;
  userId?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  responseTime?: number;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  metadata?: Record<string, any>;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatLog(entry: LogEntry): string {
    const timestamp = entry.timestamp;
    const level = entry.level.padEnd(5);
    const message = entry.message;

    let logString = `[${timestamp}] ${level} ${message}`;

    if (entry.requestId) {
      logString += ` | RequestID: ${entry.requestId}`;
    }

    if (entry.endpoint) {
      logString += ` | ${entry.method} ${entry.endpoint}`;
    }

    if (entry.statusCode) {
      logString += ` | Status: ${entry.statusCode}`;
    }

    if (entry.responseTime) {
      logString += ` | ${entry.responseTime}ms`;
    }

    return logString;
  }

  private writeLog(entry: LogEntry): void {
    const formattedLog = this.formatLog(entry);

    // In development, log to console with colors
    if (this.isDevelopment) {
      switch (entry.level) {
        case LogLevel.ERROR:
          console.error(`\x1b[31m${formattedLog}\x1b[0m`);
          if (entry.error?.stack) {
            console.error(`\x1b[31m${entry.error.stack}\x1b[0m`);
          }
          break;
        case LogLevel.WARN:
          console.warn(`\x1b[33m${formattedLog}\x1b[0m`);
          break;
        case LogLevel.INFO:
          console.info(`\x1b[36m${formattedLog}\x1b[0m`);
          break;
        case LogLevel.DEBUG:
          console.debug(`\x1b[37m${formattedLog}\x1b[0m`);
          break;
      }
    } else {
      // In production, log JSON format for structured logging
      console.log(JSON.stringify(entry));
    }
  }

  error(message: string, error?: Error, metadata?: Record<string, any>): void {
    const entry: LogEntry = {
      level: LogLevel.ERROR,
      message,
      timestamp: new Date().toISOString(),
      metadata
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack
      };
    }

    this.writeLog(entry);
  }

  warn(message: string, metadata?: Record<string, any>): void {
    this.writeLog({
      level: LogLevel.WARN,
      message,
      timestamp: new Date().toISOString(),
      metadata
    });
  }

  info(message: string, metadata?: Record<string, any>): void {
    this.writeLog({
      level: LogLevel.INFO,
      message,
      timestamp: new Date().toISOString(),
      metadata
    });
  }

  debug(message: string, metadata?: Record<string, any>): void {
    if (this.isDevelopment) {
      this.writeLog({
        level: LogLevel.DEBUG,
        message,
        timestamp: new Date().toISOString(),
        metadata
      });
    }
  }

  // Log API request/response
  logRequest(req: Request, res: Response, responseTime: number): void {
    const entry: LogEntry = {
      level: res.statusCode >= 400 ? LogLevel.ERROR : LogLevel.INFO,
      message: `API Request ${res.statusCode >= 400 ? 'Failed' : 'Completed'}`,
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] as string,
      endpoint: req.path,
      method: req.method,
      statusCode: res.statusCode,
      responseTime
    };

    this.writeLog(entry);
  }

  // Log database operations
  logDatabase(operation: string, table: string, success: boolean, duration?: number, error?: Error): void {
    const message = `Database ${operation} on ${table} ${success ? 'succeeded' : 'failed'}`;

    if (success) {
      this.info(message, { operation, table, duration });
    } else {
      this.error(message, error, { operation, table });
    }
  }
}

// Export singleton logger instance
export const logger = new Logger();

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: Function) => {
  const startTime = Date.now();

  // Generate request ID if not present
  if (!req.headers['x-request-id']) {
    req.headers['x-request-id'] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Log incoming request
  logger.debug(`Incoming ${req.method} ${req.path}`, {
    requestId: req.headers['x-request-id'],
    userAgent: req.headers['user-agent'],
    ip: req.ip
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const responseTime = Date.now() - startTime;
    logger.logRequest(req, res, responseTime);
    return originalEnd.call(res, chunk, encoding);
  } as any;

  next();
};

// Error logging middleware
export const errorLogger = (error: Error, req: Request, res: Response, next: Function) => {
  logger.error(`Unhandled error in ${req.method} ${req.path}`, error, {
    requestId: req.headers['x-request-id'],
    body: req.body,
    params: req.params,
    query: req.query
  });

  next(error);
};