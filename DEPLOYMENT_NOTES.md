# Vercel Deployment Troubleshooting Notes

**Date**: October 2, 2025
**Status**: In Progress - Deployment builds but doesn't serve correctly

## Problem Summary

The FitTrack app builds successfully on Vercel but fails to serve properly. Instead of showing the rendered React application, the browser displays raw JavaScript source code.

## Architecture

- **Frontend**: React + Vite (builds to `dist/client`)
- **Backend**: Express.js server (builds to `dist/index.js`)
- **Database**: Neon PostgreSQL (serverless)
- **Current Issue**: Vercel architecture mismatch with traditional Node.js server pattern

## Approaches Tried (Chronologically)

### 1. Initial Simple Configuration ❌
**File**: `vercel.json`
```json
{
  "version": 2,
  "routes": [...]
}
```
- **Result**: 404 errors
- **Lesson**: Vercel needs proper build configuration, not just routing

### 2. Build Dependencies Fix ✅
**File**: `package.json`
- **Action**: Moved vite, esbuild, tailwindcss, postcss, autoprefixer from devDependencies to dependencies
- **Result**: Fixed "vite: command not found" error
- **Lesson**: Vercel doesn't install devDependencies in production

### 3. Rollup Native Bindings Fix ✅
**File**: `package.json`
- **Action**: Added `@rollup/rollup-linux-x64-gnu` to optionalDependencies
- **Result**: Fixed Rollup missing binding error
- **Lesson**: Platform-specific native modules need explicit declaration

### 4. Replit Plugins Conditional Loading ✅
**File**: `vite.config.ts`
```typescript
plugins: [
  react(),
  ...(process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined
    ? [
        (await import("@replit/vite-plugin-runtime-error-modal")).default(),
        (await import("@replit/vite-plugin-cartographer")).cartographer(),
      ]
    : []),
]
```
- **Result**: Build succeeded, but showed raw JavaScript in browser
- **Lesson**: Build completing ≠ deployment working

### 5. Legacy Builds Configuration ❌
**File**: `vercel.json`
```json
{
  "version": 2,
  "builds": [{
    "src": "package.json",
    "use": "@vercel/node"
  }],
  "routes": [...]
}
```
- **Result**: 404 errors, warning about builds overriding project settings
- **Lesson**: Legacy `builds` API conflicts with modern Vercel build system

### 6. Serverless Function Wrapper ❌
**Files**: `vercel.json`, `api/index.ts`
- **Action**: Created serverless function wrapper for Express app, used rewrites
- **Result**: Back to showing raw JavaScript code
- **Lesson**: Serverless function approach doesn't work well with pre-built Express apps

## Key Problems Identified

1. **Architecture Mismatch**:
   - App designed as traditional Node.js server (Express + static files)
   - Vercel specializes in serverless functions and static sites

2. **Build Output Confusion**:
   - Build creates `dist/client` (frontend) and `dist/index.js` (backend)
   - Vercel expects either serverless functions OR static files, not mixed

3. **Dual Nature**:
   - App serves both API routes AND static frontend files
   - Tricky pattern in serverless environments

## What Works ✅

- Local development (`npm run dev`)
- Build process completes on Vercel
- All dependencies install correctly
- Files build to `dist/` directory
- Build command: `vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist`

## What Doesn't Work ❌

- Serving the built application in production
- Routing requests to the Express server
- Static file serving on Vercel
- Currently shows raw source code instead of rendered app

## Current File States

### package.json (relevant sections)
```json
{
  "scripts": {
    "dev": "tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js"
  }
}
```

### vercel.json (current)
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/api/index"
    }
  ]
}
```

### api/index.ts (current - not working)
Serverless function wrapper that initializes Express app

## Recommended Next Steps

### Option 1: Research Vercel Express Patterns
- Look for official Vercel examples of Express + Vite apps
- Check if Vercel has updated documentation for full-stack Express apps
- Search for similar app architectures successfully deployed on Vercel

### Option 2: Consider Alternative Platforms
More Express-friendly platforms:
- **Railway**: Built for traditional Node.js apps, simple deployment
- **Render**: Good free tier, native Express support
- **Fly.io**: Excellent for full-stack apps, container-based
- All support PostgreSQL and have free tiers

### Option 3: Restructure for Vercel
- Separate API endpoints into individual serverless functions (`/api/*.ts`)
- Serve frontend as pure static site
- Requires significant refactoring

### Option 4: Debug Current Setup
- Check what Vercel is actually outputting in build
- Verify the `dist/` contents on Vercel
- Check if Vercel is trying to run the server or just serve files
- Review Vercel function logs if available

## Questions to Answer Tomorrow

1. What does Vercel's file browser show in the deployed output?
2. Are there any Vercel function logs available?
3. Is the Express server actually starting on Vercel?
4. What's in the Network tab when accessing the deployed URL?
5. Should we pivot to a different platform instead?

## Environment Variables Set on Vercel

- `DATABASE_URL` - Neon PostgreSQL connection string
- (Add others as configured)

## Git Commits Related to Deployment

- Initial Vercel configuration
- Move build dependencies to dependencies
- Add Rollup native bindings
- Fix Replit plugins conditional loading
- Configure Vercel Node.js builds (reverted)
- Convert to serverless function architecture (current state)

## Notes

- The app is a single-user fitness tracker with no authentication
- Database is already set up on Neon (serverless PostgreSQL)
- Local development works perfectly - issue is Vercel-specific
- Build succeeds, serving fails - this is the core problem
