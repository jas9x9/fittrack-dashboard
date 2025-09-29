import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration interface
export interface Config {
  // Environment
  nodeEnv: 'development' | 'production' | 'test';
  port: number;

  // Database
  databaseUrl: string;

  // API
  apiBaseUrl: string;

  // Logging
  logLevel: 'error' | 'warn' | 'info' | 'debug';

  // Rate Limiting
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;

  // CORS
  corsOrigin: string | string[];

  // Security
  sessionSecret: string;
  apiKey?: string;

  // Production Features
  enableHttps: boolean;
  sslCertPath?: string;
  sslKeyPath?: string;
  redisUrl?: string;
  sentryDsn?: string;
}

// Environment validation
function validateRequiredEnvVars(): void {
  const required = ['DATABASE_URL'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Parse CORS origins
function parseCorsOrigin(origin?: string): string | string[] {
  if (!origin) return '*';

  // Split by comma and trim whitespace
  const origins = origin.split(',').map(o => o.trim());
  return origins.length === 1 ? origins[0] : origins;
}

// Load and validate configuration
function loadConfig(): Config {
  // Validate required environment variables
  validateRequiredEnvVars();

  const nodeEnv = (process.env.NODE_ENV || 'development') as Config['nodeEnv'];

  return {
    // Environment
    nodeEnv,
    port: parseInt(process.env.PORT || '3000', 10),

    // Database
    databaseUrl: process.env.DATABASE_URL!,

    // API
    apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000/api',

    // Logging
    logLevel: (process.env.LOG_LEVEL || 'info') as Config['logLevel'],

    // Rate Limiting
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),

    // CORS
    corsOrigin: parseCorsOrigin(process.env.CORS_ORIGIN),

    // Security
    sessionSecret: process.env.SESSION_SECRET || 'default-dev-secret-change-in-production',
    apiKey: process.env.API_KEY,

    // Production Features
    enableHttps: process.env.ENABLE_HTTPS === 'true',
    sslCertPath: process.env.SSL_CERT_PATH,
    sslKeyPath: process.env.SSL_KEY_PATH,
    redisUrl: process.env.REDIS_URL,
    sentryDsn: process.env.SENTRY_DSN
  };
}

// Export singleton configuration
export const config = loadConfig();

// Development vs Production configurations
export const isDevelopment = config.nodeEnv === 'development';
export const isProduction = config.nodeEnv === 'production';
export const isTest = config.nodeEnv === 'test';

// Configuration validation warnings
if (isProduction) {
  if (config.sessionSecret === 'default-dev-secret-change-in-production') {
    console.warn('⚠️  WARNING: Using default session secret in production! Set SESSION_SECRET environment variable.');
  }

  if (!config.apiKey) {
    console.warn('⚠️  WARNING: No API key configured for production. Set API_KEY environment variable.');
  }

  if (config.corsOrigin === '*') {
    console.warn('⚠️  WARNING: CORS is configured to allow all origins. Set CORS_ORIGIN for production.');
  }
}

// Log configuration summary
console.log(`🔧 Configuration loaded for ${config.nodeEnv} environment`);
console.log(`📡 Server will run on port ${config.port}`);
console.log(`🔗 API base URL: ${config.apiBaseUrl}`);
console.log(`📊 Log level: ${config.logLevel}`);
console.log(`🛡️  CORS origins: ${Array.isArray(config.corsOrigin) ? config.corsOrigin.join(', ') : config.corsOrigin}`);