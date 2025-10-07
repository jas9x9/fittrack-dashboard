# Vercel Deployment Notes

**Date**: October 2-3, 2025
**Status**: ✅ Successfully Deployed
**Live URL**: https://fittrackv20.vercel.app

## Final Working Solution

The FitTrack app is successfully deployed on Vercel using a serverless function wrapper for the Express backend and static build for the frontend.

### Architecture

- **Frontend**: React + Vite → builds to `dist/client` (static files)
- **Backend**: Express.js API → serverless function at `/api/index.ts`
- **Database**: Neon PostgreSQL (serverless)
- **Deployment Platform**: Vercel

## Key Issues Resolved

### 1. ES Module Import Resolution ✅
**Problem**: Node.js ES modules require explicit `.js` extensions, even in TypeScript
**Solution**: Added `.js` extensions to all local imports across the codebase

**Files Modified**:
- `server/routes.ts` - All middleware and route imports
- `server/index.ts` - Route and vite imports
- `server/vite.ts` - Vite config import
- `server/middleware.ts` - Config and logger imports
- `server/storage.ts` - Database and schema imports
- `server/storage/database.ts` - Schema import path
- `server/routes/*.ts` - Logger imports in all route files
- `server/storage/seed.ts` - Database import

**Example**:
```typescript
// Before (doesn't work in Vercel)
import { registerRoutes } from "./routes";

// After (works)
import { registerRoutes } from "./routes.js";
```

### 2. TypeScript Path Alias Resolution ✅
**Problem**: TypeScript path aliases (`@shared`, `@/`) don't work in Vercel's serverless runtime
**Solution**: Replaced all path aliases with relative imports

**Files Modified**:
- `server/routes/exercises.ts`
- `server/routes/goals.ts`
- `server/routes/workoutProgress.ts`
- `server/storage.ts`
- `server/storage/database.ts`

**Example**:
```typescript
// Before (doesn't work in Vercel)
import { insertExerciseSchema } from "@shared/schema";

// After (works)
import { insertExerciseSchema } from "../../shared/schema.js";
```

### 3. Database Connection String Format ✅
**Problem**: DATABASE_URL had shell command wrapper (`psql '...'`)
**Solution**: Use clean PostgreSQL connection string

**Before**:
```
psql 'postgresql://user:pass@host/db?sslmode=require'
```

**After**:
```
postgresql://user:pass@host/db?sslmode=require
```

## Final Configuration Files

### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.ts",
      "use": "@vercel/node"
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist/client"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### api/index.ts (Serverless Handler)
```typescript
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let isInitialized = false;

async function initializeApp() {
  if (isInitialized) return app;

  await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  isInitialized = true;
  return app;
}

export default async function handler(req: any, res: any) {
  const expressApp = await initializeApp();
  return expressApp(req, res);
}
```

### package.json (Build Scripts)
```json
{
  "scripts": {
    "dev": "tsx server/index.ts",
    "build": "vite build",
    "vercel-build": "vite build",
    "start": "NODE_ENV=production node dist/index.js"
  }
}
```

## Environment Variables on Vercel

Required:
- `DATABASE_URL` - Neon PostgreSQL connection string (clean format, no wrapper)
- `NODE_ENV` - Set to "production" (configured in vercel.json)

Optional (will show warnings if not set):
- `API_KEY` - API authentication key
- `CORS_ORIGIN` - CORS allowed origins (defaults to `*`)

## Deployment Steps

1. **Push to GitHub**: Code automatically deploys from `main` branch
2. **Vercel Auto-Deploy**: Triggered on every push
3. **Build Process**:
   - Frontend: `vite build` → outputs to `dist/client`
   - Backend: TypeScript compiled by `@vercel/node` → serverless function
4. **Routing**:
   - `/api/*` → Serverless function at `api/index.ts`
   - `/*` → Static files from `dist/client`

## Verified Working Endpoints

- ✅ Frontend: https://fittrackv20.vercel.app/
- ✅ Health Check: https://fittrackv20.vercel.app/api/health
- ✅ Exercises API: https://fittrackv20.vercel.app/api/exercises
- ✅ Goals API: https://fittrackv20.vercel.app/api/goals
- ✅ Workout Progress API: https://fittrackv20.vercel.app/api/workout-progress

## Key Lessons Learned

1. **ES Modules in TypeScript**: Must write `.js` in imports even though source files are `.ts`
2. **Path Aliases Don't Work in Runtime**: TypeScript path mapping only works during compilation
3. **Vercel Serverless Functions**: Use `@vercel/node` for TypeScript API routes
4. **Environment Variables**: Must be clean strings without shell command wrappers
5. **Two Separate Builds**: Frontend (static) and backend (serverless) are built independently
6. **Don't Modify What Works**: The original serverless handler works correctly as-is

## Troubleshooting History

### Issues Encountered (Chronologically)

1. **Build Dependencies Missing** → Moved dev dependencies to dependencies
2. **Rollup Native Bindings** → Added platform-specific optional dependency
3. **Replit Plugins in Production** → Conditional loading based on environment
4. **ERR_MODULE_NOT_FOUND** → Added `.js` extensions to all imports
5. **Cannot find module '@shared'** → Replaced with relative imports
6. **TypeScript Build Error** → Fixed relative path depths (`../` vs `../../`)
7. **Database Connection Error** → Removed `psql '...'` wrapper from DATABASE_URL
8. **API Routing 404s** → Reverted incorrect handler modifications

### What NOT to Do

❌ Don't strip `/api` prefix in the handler - routes expect it
❌ Don't use TypeScript path aliases in server code
❌ Don't omit `.js` extensions from local imports
❌ Don't use shell command wrappers in environment variables

## Notes

- The app is a single-user fitness tracker with no authentication
- Database is hosted on Neon (serverless PostgreSQL)
- Local development works with `npm run dev`
- Production uses serverless architecture on Vercel
- All API routes are prefixed with `/api`
