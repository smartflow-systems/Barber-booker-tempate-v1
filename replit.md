# Barbershop Booking System

## Overview

This is a comprehensive barbershop booking system built with a modern full-stack architecture. The application provides an intuitive interface for customers to book appointments, while offering powerful administrative tools for barbershop owners to manage their business operations, staff, and customer relationships.

## System Architecture

The application follows a modern web application architecture with clear separation between frontend and backend:

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom theming and time-based background changes
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM for type-safe database interactions
- **Authentication**: Express sessions with bcrypt for password hashing
- **External Integrations**: Google Calendar API, Stripe for payments, multiple email providers

## Key Components

### Database Schema
- **Sessions**: Secure session storage for authentication
- **Admin Users**: Barber and admin authentication system
- **Barbers**: Staff profiles with specialties, ratings, and contact information
- **Services**: Available services with pricing and duration
- **Clients**: Customer profiles with contact details and preferences
- **Bookings**: Appointment scheduling with Google Calendar integration
- **Google Tokens**: OAuth tokens for calendar synchronization

### Core Features
1. **Customer Booking Flow**: Multi-step booking process with barber selection, service selection, and calendar integration
2. **Admin Dashboard**: Comprehensive management interface for bookings, customers, and analytics
3. **Google Calendar Integration**: Automatic synchronization of appointments with barbers' Google calendars
4. **Payment Processing**: Stripe integration for secure payment handling
5. **Email Notifications**: Multi-provider email system (Gmail, Outlook, SendGrid) for confirmations and reminders
6. **Customer Management**: Detailed customer profiles with booking history and loyalty tracking
7. **Analytics Dashboard**: Business intelligence with revenue tracking and performance metrics

### UI/UX Features
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Time-based Theming**: Dynamic background changes based on time of day
- **Interactive Components**: Drag-and-drop dashboard widgets, calendar views, and booking assistant
- **Accessibility**: ARIA compliant components with keyboard navigation support

## Data Flow

1. **Customer Booking Process**:
   - Customer selects barber and service
   - Calendar displays available time slots
   - Booking form captures customer details
   - Payment processing through Stripe (optional)
   - Google Calendar event creation
   - Email confirmation sent to customer

2. **Admin Operations**:
   - Authentication through admin login system
   - Real-time dashboard updates via React Query
   - CRUD operations on bookings, customers, and services
   - Analytics data aggregation and visualization

3. **External Integrations**:
   - Google OAuth flow for calendar permissions
   - Webhook handling for calendar synchronization
   - Email delivery through configured providers
   - Payment intent creation and confirmation via Stripe

## External Dependencies

### Core Infrastructure
- **Database**: PostgreSQL (configured for Neon serverless)
- **Session Storage**: PostgreSQL-backed session store
- **Build Tools**: Vite for frontend, esbuild for backend compilation

### Third-party Services
- **Google Calendar API**: Appointment synchronization
- **Stripe**: Payment processing and subscription management
- **Email Services**: Gmail, Outlook, or SendGrid for notifications
- **OpenAI**: AI-powered booking assistant and message generation

### Frontend Libraries
- **React Ecosystem**: React 18 with hooks and context
- **UI Components**: Radix UI primitives with shadcn/ui styling
- **Charts**: Recharts for analytics visualization
- **Drag & Drop**: @dnd-kit for dashboard customization
- **Date Handling**: Native Date API with custom formatting utilities

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with HMR on port 5000
- **Database**: PostgreSQL connection via environment variables
- **Environment Variables**: Managed through Replit secrets for sensitive data

### Production Deployment
- **Build Process**: Vite builds frontend to `dist/public`, esbuild compiles backend
- **Server**: Node.js Express server serving static files and API routes
- **Database**: PostgreSQL with connection pooling for production scale
- **Environment**: Autoscale deployment target for dynamic scaling

### Configuration Management
- **Database Migrations**: Drizzle Kit for schema management
- **Environment Variables**: Comprehensive configuration for all external services
- **Security**: Proper secret management for API keys and OAuth credentials

## Changelog

- June 24, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.