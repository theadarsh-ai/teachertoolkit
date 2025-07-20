# EduAI Platform - Multi-Grade Teaching Assistant

## Overview

EduAI Platform is a comprehensive web application designed to empower teachers in multi-grade classrooms with AI-powered educational tools. The platform provides 11 specialized AI agents that assist with content generation, lesson planning, assessment, and classroom analytics, all tailored for Indian educational contexts with multi-language support.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom gradient themes and technology-focused design
- **UI Components**: Radix UI components styled with shadcn/ui
- **State Management**: TanStack React Query for server state
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js REST API
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Session Management**: PostgreSQL-based session storage
- **API Design**: RESTful endpoints with standardized JSON responses

### Authentication & Authorization
- **Primary Auth**: Firebase Authentication with Google OAuth
- **Session Handling**: Express sessions with PostgreSQL store
- **User Management**: Firebase UID mapping to internal user records

## Key Components

### AI Agent System
The platform features 11 specialized AI agents built with LangGraph:

1. **Hyper-Local Content Generation**: Creates culturally relevant materials in 8+ Indian languages
2. **Differentiated Materials**: Adapts content across multiple grade levels (1-12)
3. **AI Lesson Planner**: Automated curriculum scheduling and progress tracking
4. **Instant Knowledge Base**: Bilingual Q&A system with analogy-rich responses
5. **Visual Aids Designer**: Generates diagrams, flowcharts, and AR content
6. **Gamified Teaching**: Interactive elements with badges and leaderboards
7. **Classroom Analytics**: Real-time performance monitoring and pacing recommendations
8. **Audio Reading Assessment**: Speech analysis for pronunciation and fluency
9. **Master Agent Chatbot**: Central routing and context management
10. **Performance Analysis**: Personalized learning path recommendations
11. **AR Integration**: Sketchfab-powered augmented reality features

### Database Schema
- **Users**: Firebase UID mapping, profile information
- **Agent Configurations**: Per-user agent settings, grade selections, language preferences
- **Chat Sessions**: Conversation history and context
- **Chat Messages**: Individual message storage with metadata
- **Generated Content**: AI-produced materials with versioning and metadata

### UI/UX Design
- **Design System**: Technology-themed with advanced gradients and modern aesthetics
- **Responsive**: Mobile-first design with breakpoint optimization
- **Accessibility**: ARIA compliance and keyboard navigation
- **Color Scheme**: Custom CSS variables supporting light/dark themes

## Data Flow

### Authentication Flow
1. User initiates Google OAuth through Firebase
2. Firebase redirects handle user authentication
3. Backend creates/retrieves user record using Firebase UID
4. Session established with PostgreSQL storage

### Agent Interaction Flow
1. User selects agent from dashboard grid
2. Configuration modal captures grade levels and preferences
3. Agent-specific parameters stored in database
4. Requests routed through Master Agent for context management
5. Responses cached and stored for future reference

### Content Generation Pipeline
1. User input processed through speech-to-text (planned)
2. LangGraph orchestrates agent workflows
3. Content filtered for toxicity and bias
4. Results adapted for selected grade levels and languages
5. Generated content stored with metadata for reuse

## External Dependencies

### Core Infrastructure
- **Firebase**: Authentication, user management
- **Neon Database**: PostgreSQL hosting for production
- **Google Cloud**: Speech-to-text, translation services (planned)
- **LangGraph**: AI agent orchestration framework

### Frontend Libraries
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **TanStack React Query**: Server state synchronization
- **React Hook Form**: Form validation and management
- **Zod**: Schema validation library

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety and developer experience
- **ESLint/Prettier**: Code quality and formatting
- **Drizzle Kit**: Database migrations and schema management

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with HMR
- **Database**: Local PostgreSQL or Neon development instance
- **Environment Variables**: Firebase config, database URLs
- **Asset Serving**: Vite handles static assets and bundling

### Production Build
- **Frontend**: Static asset generation via Vite build
- **Backend**: Node.js bundle via esbuild
- **Database**: Drizzle migrations applied automatically
- **Environment**: Production Firebase project configuration

### Infrastructure Requirements
- **Node.js Runtime**: ES module support required
- **PostgreSQL Database**: Compatible with Drizzle ORM
- **File Storage**: Static asset hosting capability
- **Session Storage**: PostgreSQL-based session management

### Scalability Considerations
- **Database**: Connection pooling with PostgreSQL
- **Caching**: React Query provides client-side caching
- **API Rate Limiting**: Express middleware for request throttling
- **Asset Optimization**: Vite handles code splitting and tree shaking

### Security Measures
- **HTTPS Enforcement**: SSL/TLS for all communications
- **Firebase Security**: OAuth 2.0 with Google provider
- **Input Validation**: Zod schemas for all API endpoints
- **Session Security**: Secure session cookies with PostgreSQL storage
- **Content Filtering**: Toxicity detection for AI-generated content