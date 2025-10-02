# FitTrack Dashboard - Vercel Deployment Guide

## Prerequisites
- ✅ Vercel account (sign up at https://vercel.com/signup with GitHub)
- ✅ Neon database connection string
- ✅ GitHub repository

## Step-by-Step Deployment

### 1. Push Configuration to GitHub

The configuration files have been created:
- `vercel.json` - Vercel deployment configuration
- Updated `vite.config.ts` - Build output paths

Make sure these are committed and pushed to your main branch.

### 2. Connect to Vercel

1. Go to https://vercel.com/new
2. Click "Import Project"
3. Select your `fittrack-dashboard` repository from GitHub
4. Vercel will auto-detect the framework settings

### 3. Configure Build Settings

Vercel should auto-detect these, but verify:

**Framework Preset:** Other (or Vite)

**Build Command:**
```
npm run build
```

**Output Directory:**
```
dist
```

**Install Command:**
```
npm install
```

### 4. Add Environment Variables

Click "Environment Variables" and add:

| Name | Value | Environment |
|------|-------|-------------|
| `DATABASE_URL` | Your Neon connection string | Production |
| `NODE_ENV` | `production` | Production |

**Your DATABASE_URL should look like:**
```
postgresql://username:password@ep-xxxxx.us-east-2.aws.neon.tech/fittrack?sslmode=require
```

### 5. Deploy!

1. Click **"Deploy"**
2. Vercel will:
   - Install dependencies
   - Build the frontend (Vite)
   - Build the backend (esbuild)
   - Deploy everything

**Deployment takes 2-3 minutes**

### 6. Access Your App

Once deployed, you'll get a URL like:
```
https://fittrack-dashboard-xxxxx.vercel.app
```

Bookmark this URL - your app is now live!

---

## Post-Deployment

### Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain (e.g., `fittrack.yourdomain.com`)
3. Follow DNS instructions
4. SSL certificate auto-generated

### Environment Variables

To update environment variables:
1. Go to Project Settings → Environment Variables
2. Edit or add variables
3. Redeploy for changes to take effect

### Automatic Deployments

Every push to `main` branch automatically deploys!

**Preview Deployments:**
- Push to any other branch creates a preview URL
- Test features before merging to main

---

## Troubleshooting

### Build Fails

**Check:**
1. All dependencies in `package.json`
2. Environment variables are set
3. DATABASE_URL is correct

**View build logs** in Vercel dashboard

### Database Connection Errors

**Verify:**
1. DATABASE_URL includes `?sslmode=require`
2. Neon database is active
3. IP allowlist in Neon (if configured)

### 404 Errors

Check `vercel.json` routing configuration - should redirect all non-API routes to client.

---

## Maintenance

### View Logs
- Real-time logs: Vercel Dashboard → Deployments → [Your Deployment] → Logs
- Runtime logs available for debugging

### Rollback
- Go to Deployments
- Click on previous working deployment
- Click "Promote to Production"

### Database Migrations

Run migrations locally then let Vercel use existing database:
```bash
npm run db:push
```

---

## Performance

Vercel automatically provides:
- ✅ Global CDN
- ✅ Edge caching
- ✅ HTTP/2 & HTTP/3
- ✅ Automatic SSL/TLS
- ✅ DDoS protection
- ✅ Automatic compression

---

## Cost

**Free Tier includes:**
- 100GB bandwidth/month
- Unlimited deployments
- Unlimited team members
- Custom domains
- SSL certificates

Perfect for personal use!

---

## Support

- Vercel Docs: https://vercel.com/docs
- Vercel Community: https://github.com/vercel/vercel/discussions
- FitTrack Issues: https://github.com/jas9x9/fittrack-dashboard/issues
