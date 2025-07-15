# replit.md

## Overview

This is a full-stack web application built with React (frontend) and Express.js (backend) that implements an Electoral Control System (Sistema de Control Electoral). The application manages electoral data including users, roles, geographic locations, voting centers, events, and community councils across Venezuela.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with local strategy and session-based auth
- **Session Storage**: PostgreSQL session store
- **Password Security**: Node.js crypto module with scrypt hashing
- **API Design**: RESTful endpoints with proper HTTP status codes

## Key Components

### Database Schema
The application uses a comprehensive PostgreSQL schema with the following main entities:
- **User Management**: `usuarios` (users) and `roles` tables
- **Geographic Hierarchy**: `estados` (states), `municipios` (municipalities), `parroquias` (parishes), `comunidades` (communities)
- **Electoral Infrastructure**: `centros_votacion` (voting centers), `eventos` (events), `afluencia` (voter turnout)
- **Community Organization**: `consejos_comunales` (community councils), `comunas` (communes), `proyectos` (projects)

### Authentication System
- Session-based authentication using Passport.js
- Secure password hashing with scrypt algorithm
- Protected routes with middleware
- Role-based access control

### Frontend Features
- Dashboard with statistics and data visualization
- Interactive map of Venezuela using Leaflet
- CRUD operations for all entities with modal forms
- Data tables with search and filtering capabilities
- Responsive design with mobile support
- Toast notifications for user feedback

### Backend API Structure
- RESTful endpoints for all entities (`/api/users`, `/api/roles`, `/api/estados`, etc.)
- Proper HTTP methods (GET, POST, PUT, DELETE)
- Input validation using Zod schemas
- Error handling with appropriate status codes
- Session management and authentication middleware

## Data Flow

1. **Authentication Flow**: User logs in → Passport validates credentials → Session created → User redirected to dashboard
2. **Data Fetching**: React Query manages API calls → Data cached and synchronized → Components re-render on updates
3. **Form Submissions**: User fills form → Zod validates input → API request sent → Database updated → UI updated via React Query
4. **Real-time Updates**: All CRUD operations trigger React Query cache invalidation → Automatic UI updates

## External Dependencies

### Frontend Dependencies
- **UI Components**: Radix UI primitives for accessibility and behavior
- **Icons**: Lucide React for consistent iconography
- **Date Handling**: date-fns for date manipulation
- **Map Functionality**: Leaflet for interactive maps (loaded dynamically)

### Backend Dependencies
- **Database**: Neon PostgreSQL serverless database
- **ORM**: Drizzle ORM for type-safe database operations
- **Session Store**: connect-pg-simple for PostgreSQL session storage
- **Password Hashing**: bcryptjs for secure password handling
- **WebSocket**: ws for Neon database connection

### Development Dependencies
- **Build Tools**: Vite, esbuild for fast builds
- **Development**: tsx for TypeScript execution
- **Replit Integration**: Replit-specific plugins for development environment

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite builds React app to `dist/public`
2. **Backend Build**: esbuild bundles Express server to `dist/index.js`
3. **Database**: Drizzle Kit handles schema migrations

### Environment Configuration
- **Development**: NODE_ENV=development, tsx for hot reloading
- **Production**: NODE_ENV=production, compiled JavaScript execution
- **Database**: DATABASE_URL environment variable for PostgreSQL connection
- **Sessions**: SESSION_SECRET for secure session management

### File Structure
```
├── client/          # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Route components
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities and configurations
├── server/          # Express backend
│   ├── routes.ts    # API route definitions
│   ├── storage.ts   # Database operations
│   ├── auth.ts      # Authentication logic
│   └── db.ts        # Database connection
├── shared/          # Shared types and schemas
│   └── schema.ts    # Drizzle schema definitions
└── migrations/      # Database migration files
```

The application follows a monorepo structure with clear separation between frontend, backend, and shared code, enabling efficient development and deployment.