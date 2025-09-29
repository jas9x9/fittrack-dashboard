# FitTrack Dashboard Deployment Guide

This guide covers various deployment options for the FitTrack Dashboard, from local hosting to cloud platforms.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Local Production Deployment](#local-production-deployment)
- [Cloud Platforms](#cloud-platforms)
- [Docker Deployment](#docker-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Database Setup](#database-setup)
- [SSL/HTTPS Configuration](#sslhttps-configuration)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

- **Node.js**: Version 18 or higher
- **PostgreSQL**: Version 12 or higher
- **Memory**: Minimum 512MB RAM
- **Storage**: 1GB available disk space
- **Network**: Port 3000 (or custom port) accessible

### Development Tools

- Git (for source code)
- npm or yarn (package manager)
- PostgreSQL client (for database setup)

## Environment Configuration

### Production Environment Variables

Create a `.env` file with the following variables:

```env
# Environment
NODE_ENV=production

# Server Configuration
PORT=3000
API_BASE_URL=https://yourdomain.com/api

# Database
DATABASE_URL=postgresql://username:password@host:5432/database?sslmode=require

# Security
CORS_ORIGIN=https://yourdomain.com
SESSION_SECRET=your-secure-random-string-here
API_KEY=your-api-key-here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info

# SSL (if using HTTPS)
ENABLE_HTTPS=true
SSL_CERT_PATH=/path/to/certificate.pem
SSL_KEY_PATH=/path/to/private-key.pem

# Optional: External Services
SENTRY_DSN=your-sentry-dsn-here
REDIS_URL=redis://localhost:6379
```

### Security Considerations

⚠️ **Important Security Notes:**

1. **Never use default secrets in production**
2. **Generate strong random strings for SESSION_SECRET**
3. **Use environment-specific CORS_ORIGIN (not `*`)**
4. **Enable HTTPS in production**
5. **Use SSL-enabled database connections**

### Generating Secure Secrets

```bash
# Generate a secure session secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate an API key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Local Production Deployment

### Option 1: Direct Node.js Deployment

1. **Prepare the application:**
   ```bash
   git clone <repository-url>
   cd fittrack-dashboard
   npm ci --only=production
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your production values
   ```

3. **Build the application:**
   ```bash
   npm run build
   ```

4. **Run database migrations:**
   ```bash
   npm run db:migrate
   npm run db:seed  # Optional: for sample data
   ```

5. **Start the production server:**
   ```bash
   npm start
   ```

### Option 2: PM2 Process Manager

PM2 provides process management, auto-restart, and monitoring.

1. **Install PM2 globally:**
   ```bash
   npm install -g pm2
   ```

2. **Create PM2 ecosystem file:**
   ```javascript
   // ecosystem.config.js
   module.exports = {
     apps: [{
       name: 'fittrack-dashboard',
       script: 'npm',
       args: 'start',
       instances: 1,
       autorestart: true,
       watch: false,
       max_memory_restart: '1G',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       },
       error_file: './logs/err.log',
       out_file: './logs/out.log',
       log_file: './logs/combined.log',
       time: true
     }]
   };
   ```

3. **Start with PM2:**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

4. **Monitor the application:**
   ```bash
   pm2 status
   pm2 logs fittrack-dashboard
   pm2 monit
   ```

## Cloud Platforms

### Railway

Railway offers simple Git-based deployments.

1. **Connect your repository:**
   - Sign up at [railway.app](https://railway.app)
   - Connect your GitHub repository
   - Select the FitTrack Dashboard repository

2. **Configure environment variables:**
   ```
   NODE_ENV=production
   DATABASE_URL=<railway-provided-postgres-url>
   CORS_ORIGIN=https://your-app.railway.app
   SESSION_SECRET=<your-secure-secret>
   ```

3. **Deploy:**
   - Railway automatically builds and deploys on every push
   - Monitor logs in the Railway dashboard

### Vercel

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Configure for Node.js:**
   ```json
   // vercel.json
   {
     "version": 2,
     "builds": [
       {
         "src": "server/index.ts",
         "use": "@vercel/node"
       },
       {
         "src": "client/package.json",
         "use": "@vercel/static-build",
         "config": {
           "distDir": "../dist/public"
         }
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "/server/index.ts"
       },
       {
         "src": "/(.*)",
         "dest": "/client/$1"
       }
     ]
   }
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

### DigitalOcean App Platform

1. **Create app via DigitalOcean dashboard**
2. **Configure build settings:**
   - Build Command: `npm run build`
   - Run Command: `npm start`
   - Environment Variables: Add all production variables

3. **Add database component:**
   - Add a managed PostgreSQL database
   - Use the connection string in DATABASE_URL

### AWS Elastic Beanstalk

1. **Install EB CLI:**
   ```bash
   pip install awsebcli
   ```

2. **Initialize Elastic Beanstalk:**
   ```bash
   eb init fittrack-dashboard
   eb create production
   ```

3. **Configure environment:**
   ```bash
   eb setenv NODE_ENV=production DATABASE_URL=<your-db-url>
   ```

4. **Deploy:**
   ```bash
   eb deploy
   ```

## Docker Deployment

### Dockerfile

```dockerfile
# Multi-stage build for optimal image size
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S fittrack -u 1001

# Copy built application and dependencies
COPY --from=builder --chown=fittrack:nodejs /app/dist ./dist
COPY --from=builder --chown=fittrack:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=fittrack:nodejs /app/package*.json ./

# Switch to non-root user
USER fittrack

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://fittrack:password@db:5432/fittrack
      - CORS_ORIGIN=http://localhost:3000
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=fittrack
      - POSTGRES_USER=fittrack
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

volumes:
  postgres_data:
```

### Build and Run

```bash
# Build the image
docker build -t fittrack-dashboard .

# Run with Docker Compose
docker-compose up -d

# Check logs
docker-compose logs -f app

# Scale the application
docker-compose up -d --scale app=3
```

## Kubernetes Deployment

### Namespace and ConfigMap

```yaml
# kubernetes/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: fittrack

---
# kubernetes/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: fittrack-config
  namespace: fittrack
data:
  NODE_ENV: "production"
  PORT: "3000"
  LOG_LEVEL: "info"
```

### Secret

```yaml
# kubernetes/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: fittrack-secrets
  namespace: fittrack
type: Opaque
data:
  DATABASE_URL: <base64-encoded-database-url>
  SESSION_SECRET: <base64-encoded-session-secret>
```

### Deployment

```yaml
# kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fittrack-dashboard
  namespace: fittrack
spec:
  replicas: 3
  selector:
    matchLabels:
      app: fittrack-dashboard
  template:
    metadata:
      labels:
        app: fittrack-dashboard
    spec:
      containers:
      - name: fittrack-dashboard
        image: fittrack-dashboard:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          valueFrom:
            configMapKeyRef:
              name: fittrack-config
              key: NODE_ENV
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: fittrack-secrets
              key: DATABASE_URL
        livenessProbe:
          httpGet:
            path: /api/health/liveness
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health/readiness
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

### Service and Ingress

```yaml
# kubernetes/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: fittrack-dashboard-service
  namespace: fittrack
spec:
  selector:
    app: fittrack-dashboard
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP

---
# kubernetes/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: fittrack-dashboard-ingress
  namespace: fittrack
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - fittrack.yourdomain.com
    secretName: fittrack-tls
  rules:
  - host: fittrack.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: fittrack-dashboard-service
            port:
              number: 80
```

### Deploy to Kubernetes

```bash
# Apply all configurations
kubectl apply -f kubernetes/

# Check deployment status
kubectl get pods -n fittrack
kubectl get services -n fittrack
kubectl get ingress -n fittrack

# Monitor logs
kubectl logs -f deployment/fittrack-dashboard -n fittrack
```

## Database Setup

### Neon (Recommended for Cloud)

1. **Create account at [neon.tech](https://neon.tech)**
2. **Create a new project and database**
3. **Copy the connection string:**
   ```
   postgresql://username:password@host/database?sslmode=require
   ```
4. **Set in environment variables:**
   ```env
   DATABASE_URL=postgresql://username:password@host/database?sslmode=require
   ```

### Self-Hosted PostgreSQL

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE fittrack;
CREATE USER fittrack WITH ENCRYPTED PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE fittrack TO fittrack;
\q

# Configure PostgreSQL
sudo nano /etc/postgresql/13/main/postgresql.conf
# Uncomment and modify:
# listen_addresses = '*'

sudo nano /etc/postgresql/13/main/pg_hba.conf
# Add line:
# host fittrack fittrack 0.0.0.0/0 md5

sudo systemctl restart postgresql
```

### Database Migrations

```bash
# Run migrations
npm run db:migrate

# Seed with sample data (optional)
npm run db:seed

# Verify database structure
npm run db:studio
```

## SSL/HTTPS Configuration

### Using Let's Encrypt with Certbot

```bash
# Install Certbot
sudo apt install certbot

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com

# Certificates will be at:
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

### Configure HTTPS in Environment

```env
ENABLE_HTTPS=true
SSL_CERT_PATH=/etc/letsencrypt/live/yourdomain.com/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/yourdomain.com/privkey.pem
```

### Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/fittrack
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Monitoring and Maintenance

### Application Monitoring

```bash
# Check application health
curl https://yourdomain.com/api/health/detailed

# Monitor logs
tail -f logs/combined.log

# Check database connectivity
npm run db:check
```

### Performance Monitoring

```bash
# Monitor CPU and memory usage
htop

# Check disk usage
df -h

# Monitor network connections
netstat -tulpn | grep :3000
```

### Backup Strategy

```bash
# Database backup
pg_dump -h host -U username -d fittrack > backup_$(date +%Y%m%d_%H%M%S).sql

# Automated daily backups
echo "0 2 * * * pg_dump -h host -U username -d fittrack > /backups/fittrack_$(date +\%Y\%m\%d).sql" | crontab -
```

### Log Rotation

```bash
# Configure logrotate
sudo nano /etc/logrotate.d/fittrack

/path/to/fittrack/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    postrotate
        pm2 reload fittrack-dashboard
    endscript
}
```

## Troubleshooting

### Common Issues

**Database Connection Failed:**
```bash
# Check database status
pg_isready -h host -p 5432

# Test connection manually
psql -h host -U username -d fittrack
```

**Port Already in Use:**
```bash
# Find process using port
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>
```

**SSL Certificate Issues:**
```bash
# Check certificate validity
openssl x509 -in /path/to/cert.pem -text -noout

# Verify certificate chain
openssl verify -CApath /etc/ssl/certs /path/to/cert.pem
```

**Memory Issues:**
```bash
# Check memory usage
free -h

# Check Node.js memory usage
node --max-old-space-size=1024 server/index.js
```

### Health Check Endpoints

Use these endpoints to monitor application health:

- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Comprehensive system info
- `GET /api/health/readiness` - Kubernetes readiness probe
- `GET /api/health/liveness` - Kubernetes liveness probe

### Log Analysis

```bash
# Check for errors in logs
grep -i error logs/combined.log

# Monitor API response times
grep "API Request" logs/combined.log | awk '{print $NF}' | sort -n

# Check rate limiting
grep "Rate limit exceeded" logs/combined.log
```

### Performance Tuning

```bash
# Optimize PostgreSQL
sudo nano /etc/postgresql/13/main/postgresql.conf

# Key settings to adjust:
# shared_buffers = 256MB
# effective_cache_size = 1GB
# maintenance_work_mem = 64MB
# checkpoint_completion_target = 0.9
```

### Scaling Considerations

**Horizontal Scaling:**
- Use load balancer (nginx, HAProxy)
- Deploy multiple application instances
- Use shared database
- Consider Redis for session storage

**Vertical Scaling:**
- Increase server resources (CPU, RAM)
- Optimize database queries
- Enable database connection pooling
- Implement caching strategies

## Support

For deployment-related issues:

1. **Check application logs** for specific error messages
2. **Verify environment variables** are properly set
3. **Test database connectivity** independently
4. **Confirm network accessibility** and firewall settings
5. **Review health check endpoints** for system status

For additional help, refer to the [main README](../README.md) or open an issue in the repository.