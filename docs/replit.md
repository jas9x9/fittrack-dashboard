# FitTrack - Workout Progress Dashboard

## Overview

FitTrack is a comprehensive fitness tracking application built as a modern full-stack web application. It provides users with the ability to set fitness goals, track workout sessions, and monitor progress through visual dashboards and analytics. The application features a clean, motivational interface designed for both desktop and mobile use, making it accessible for gym environments.

The core functionality includes goal management (setting targets for various exercises), workout session logging, progress visualization through charts and progress rings, and comprehensive analytics to track fitness journey over time. The application is designed with a utility-focused approach that prioritizes data clarity and motivational progress visualization.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built using React 18 with TypeScript, leveraging Vite as the build tool and development server. The application uses a component-based architecture with shadcn/ui as the primary UI component library, providing a consistent design system built on top of Radix UI primitives and styled with Tailwind CSS.

**Key Frontend Decisions:**
- **Component Structure**: Modular component architecture with separate directories for UI components, custom components, pages, and examples
- **Styling Strategy**: Tailwind CSS with custom CSS variables for theming, supporting both light and dark modes
- **State Management**: React Query (TanStack Query) for server state management and caching
- **Routing**: Uses Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod for validation and type safety

### Backend Architecture
The backend follows a clean Express.js architecture with TypeScript, implementing a RESTful API pattern. The server uses a modular route structure with separate concerns for storage, routing, and server setup.

**Key Backend Decisions:**
- **Server Framework**: Express.js with TypeScript for type safety
- **API Design**: RESTful endpoints with `/api` prefix for clear separation
- **Storage Interface**: Abstract storage interface (IStorage) allowing for easy swapping between implementations (currently uses in-memory storage with plans for database integration)
- **Development Setup**: Integrated Vite development server for hot reload and development tooling

### Data Storage Solutions
The application uses a flexible data architecture designed to accommodate both development and production environments:

**Database Schema Design:**
- **Users**: Basic user management with username/password authentication
- **Exercises**: Catalog of exercises with categories (strength, cardio, flexibility) and units
- **Goals**: User-specific fitness targets with progress tracking
- **Workout Sessions**: Individual workout records linked to exercises and users

**Current Implementation:**
- Development: In-memory storage for rapid prototyping
- Production Ready: Drizzle ORM configured for PostgreSQL with proper migrations

### Authentication and Authorization
The application includes basic session-based authentication infrastructure:
- User registration and login system
- Session management using connect-pg-simple for PostgreSQL session store
- Password hashing and security best practices

### External Dependencies

**UI and Design:**
- **shadcn/ui**: Complete UI component library built on Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Icon library for consistent iconography
- **Recharts**: Data visualization library for workout progress charts

**Backend Infrastructure:**
- **Drizzle ORM**: Type-safe database toolkit with migration support
- **Zod**: Runtime type validation for API endpoints and forms
- **Express.js**: Web application framework with middleware support

**Database:**
- **PostgreSQL**: Primary database (configured via Neon serverless)
- **Database URL**: Environment-based configuration for database connections

**Development Tools:**
- **Vite**: Fast build tool and development server
- **TypeScript**: Type safety across the entire application
- **ESBuild**: Fast JavaScript bundler for production builds

**Third-party Services:**
- **Google Fonts**: Web fonts (Inter, JetBrains Mono) for typography
- **Replit Integration**: Development environment integration with error handling and debugging tools

The architecture emphasizes type safety, developer experience, and scalability while maintaining a clean separation of concerns between frontend and backend systems.

## Recent Changes

### 2024-12-25 - Session 2
- **Exercise Dropdown Consistency**: Updated both Add Goal and Edit Goal dialogs to use identical dropdown implementations
- **Text Color Fix**: Resolved exercise dropdown text color issues by applying `text-foreground` class directly to SelectItem components  
- **Background Consistency**: Made exercise dropdown background match dialog background using `bg-background`
- **Goal Completion UI**: Replaced "Goal Achieved!" text box with PartyPopper icon next to target value for completed goals
- **Code Cleanup**: Removed rejected "Add New Exercise" feature maintaining clean codebase

### 2024-12-25 - Session 1
- Initial project setup with React frontend and Express backend
- Created basic goal tracking interface with GoalCard components
- Implemented workout progress charts using Recharts
- Added mock data structure for goals and workouts
- Set up routing with wouter for dashboard navigation

## Current Status

- **Frontend**: Fully functional dashboard with goal cards, progress tracking, and charts
- **Backend**: Express server setup with mock data (TODO: implement real database)
- **UI/UX**: Modern design using shadcn/ui components with consistent styling
- **Data Flow**: Mock data structure established, ready for backend integration
- **Goal Management**: Add/Edit dialogs with consistent exercise dropdown implementation
- **Visual Feedback**: PartyPopper icon for completed goals, clean and minimal design
- **Exercise List**: Predefined exercises (Squats, Deadlift, Bench Press, Shoulder Press, Push Ups, Pull Ups, Running)

## Known Issues

- Mock data only - needs real backend integration
- No user authentication system
- Chart data is generated randomly for demo purposes
- Trend chart in Bench Press card may have rendering issues (needs investigation)

## Next Steps for Tomorrow

1. **Chart Issues**: Investigate and fix any missing trend charts in goal cards
2. **Backend Integration**: Consider implementing real database storage
3. **User Authentication**: Add user login/registration system
4. **Data Persistence**: Replace mock data with real API endpoints
5. **Testing**: Add comprehensive test coverage for components
6. **Deployment**: Prepare application for production deployment