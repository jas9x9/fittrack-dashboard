# FitTrack Dashboard 💪

A modern, single-user fitness tracking application built with React, TypeScript, and Node.js. Track your fitness goals, log workout progress, and visualize your journey with interactive charts.

![FitTrack Dashboard](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## ✨ Features

- **Goal Tracking**: Set fitness targets and track progress over time
- **Workout Logging**: Record workout sessions with detailed progress data
- **Interactive Charts**: Visualize your fitness journey with responsive charts
- **Real-time Updates**: Optimistic UI updates with React Query
- **Mobile Responsive**: Works seamlessly on desktop and mobile devices
- **Dark/Light Theme**: Toggle between light and dark modes
- **Production Ready**: Comprehensive error monitoring and logging

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database (we recommend [Neon](https://neon.tech) for cloud hosting)
- npm or yarn

### 1. Clone and Install

```bash
git clone <repository-url>
cd fittrack-dashboard
npm install
```

### 2. Environment Setup

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` with your database URL:

```env
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
NODE_ENV=development
PORT=3000
```

### 3. Database Setup

Run database migrations and seed data:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
fittrack-dashboard/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Main application pages
│   │   ├── hooks/          # React Query hooks
│   │   ├── api/            # API client and types
│   │   └── lib/            # Utilities and configuration
├── server/                 # Node.js backend
│   ├── routes/             # API route handlers
│   ├── storage/            # Database layer
│   ├── utils/              # Server utilities
│   ├── config/             # Configuration management
│   └── middleware/         # Express middleware
├── shared/                 # Shared types and schemas
└── dist/                   # Production build output
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | - | ✅ |
| `NODE_ENV` | Environment mode | `development` | ❌ |
| `PORT` | Server port | `3000` | ❌ |
| `LOG_LEVEL` | Logging level | `info` | ❌ |
| `CORS_ORIGIN` | Allowed CORS origins | `*` | ❌ |
| `RATE_LIMIT_MAX_REQUESTS` | Rate limit per window | `100` | ❌ |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (ms) | `60000` | ❌ |

### Development vs Production

**Development Mode** (`NODE_ENV=development`):
- Relaxed security headers
- No rate limiting
- Detailed error messages
- Flexible CORS policy

**Production Mode** (`NODE_ENV=production`):
- Full security headers (CSP, HSTS, etc.)
- Rate limiting enabled
- Minimal error disclosure
- Strict CORS policy

## 🎯 Usage

### Creating Goals

1. Click "Add Goal" button
2. Select an exercise from the dropdown
3. Set your current and target values
4. Choose a target date
5. Save your goal

### Logging Workouts

1. Click "Add Progress" on any goal card
2. Select the exercise (pre-filled if coming from a goal)
3. Enter your workout value
4. Add optional notes
5. Save the progress

Goals automatically update their current values based on your latest workout progress.

### Viewing Progress

- **Goal Cards**: See progress bars and days remaining
- **Charts**: Interactive progress charts show your workout history
- **Statistics**: Track completion rates and trends

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run dev:client       # Start client only
npm run dev:server       # Start server only

# Production
npm run build           # Build for production
npm run start           # Start production server
npm run preview         # Preview production build

# Database
npm run db:generate     # Generate database schema
npm run db:migrate      # Run database migrations
npm run db:seed         # Seed database with sample data
npm run db:studio       # Open database studio

# Testing
npm run test           # Run tests
npm run test:watch     # Run tests in watch mode
npm run type-check     # TypeScript type checking
```

### API Endpoints

The application provides a RESTful API:

- `GET /api/health` - Health check
- `GET /api/exercises` - List all exercises
- `GET /api/goals` - List all goals with exercises
- `POST /api/goals` - Create a new goal
- `PUT /api/goals/:id` - Update a goal
- `DELETE /api/goals/:id` - Delete a goal
- `GET /api/workout-progress` - List workout progress
- `POST /api/workout-progress` - Log workout progress

See [API Documentation](./docs/API.md) for detailed endpoint specifications.

### Technology Stack

**Frontend:**
- React 18 with TypeScript
- TanStack React Query for state management
- Tailwind CSS for styling
- Radix UI for accessible components
- Recharts for data visualization
- Lucide React for icons

**Backend:**
- Node.js with Express
- TypeScript for type safety
- Drizzle ORM for database operations
- Zod for validation
- PostgreSQL database

## 🚢 Deployment

### Prerequisites

- Node.js 18+ runtime
- PostgreSQL database
- Domain with SSL certificate (recommended)

### Build and Deploy

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Set production environment variables:**
   ```bash
   export NODE_ENV=production
   export DATABASE_URL=your_production_database_url
   export PORT=3000
   export CORS_ORIGIN=https://yourdomain.com
   ```

3. **Start the production server:**
   ```bash
   npm start
   ```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Platform-Specific Deployments

- **Railway**: Connect your GitHub repo, set environment variables
- **Vercel**: Use the Node.js preset with build command `npm run build`
- **DigitalOcean**: Use App Platform with Node.js buildpack
- **AWS**: Deploy using Elastic Beanstalk or ECS

## 🔍 Monitoring & Health Checks

### Health Endpoints

- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Comprehensive system status
- `GET /api/health/readiness` - Kubernetes readiness probe
- `GET /api/health/liveness` - Kubernetes liveness probe

### Error Monitoring

The application includes comprehensive error monitoring:

- **Server-side logging** with structured logs
- **Client-side error boundaries** with automatic reporting
- **API performance monitoring** with request/response metrics
- **Database operation tracking** with query performance

### Security Features

- **Content Security Policy** (production only)
- **Rate limiting** with configurable thresholds
- **CORS protection** with environment-aware origins
- **Security headers** (HSTS, X-Frame-Options, etc.)
- **Input validation** with Zod schemas

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

**Database Connection Failed:**
- Verify your `DATABASE_URL` is correct
- Ensure your database server is running
- Check firewall settings

**Port Already in Use:**
- Change the `PORT` environment variable
- Kill the process using the port: `lsof -ti:3000 | xargs kill`

**Build Failures:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear build cache: `rm -rf dist && npm run build`

**CORS Errors:**
- Update `CORS_ORIGIN` in your environment variables
- Ensure your frontend URL is included in allowed origins

### Getting Help

- Check the [Issues](../../issues) page for known problems
- Review the [API Documentation](./docs/API.md)
- Examine the application logs for error details

---

**Built with ❤️ for fitness enthusiasts**