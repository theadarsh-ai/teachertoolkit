# EduAI Platform - Multi-Grade Teaching Assistant

## Overview

EduAI Platform is a comprehensive web application designed to empower teachers in multi-grade classrooms with AI-powered educational tools. The platform provides 11 specialized AI agents that assist with content generation, lesson planning, assessment, and classroom analytics, all tailored for Indian educational contexts with multi-language support.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Updates

### January 24, 2025 - Audio Reading Assessment with Real AI Analysis Implementation
✓ **Live Recording Capability**: Real-time audio recording with microphone access and professional audio settings
✓ **File Upload Support**: Upload audio files (MP3, WAV, WebM) with size validation and format checking
✓ **Multi-Language Analysis**: Support for 10 languages including Hindi, English, Tamil, Telugu, Marathi, Bengali, Gujarati, Kannada, Punjabi, and Urdu
✓ **Authentic AI Assessment**: Removed all mock/hardcoded data - now uses real Gemini AI analysis of actual audio recordings
✓ **Word-by-Word Analysis**: Real speech recognition comparing actual pronunciation to expected reading text
✓ **Grade-Level Adaptation**: Customized assessment criteria for grades 1-12 with appropriate expectations
✓ **Professional Interface**: Recording controls with timer, pause/resume functionality, and visual feedback
✓ **Detailed Reporting**: Authentic scoring, real mistake identification, and AI-generated improvement suggestions
✓ **File Management**: Proper disk storage for audio files with automatic cleanup after processing
✓ **Dashboard Integration**: Added to agent grid with direct navigation and proper routing

### January 24, 2025 - Logo Update for Sahayak Platform Dashboard
✓ **Brand Consistency**: Updated dashboard header logo with new professional blue square icon
✓ **Image Integration**: Implemented attached logo image (image_1753350466135.png) replacing previous gradient icon
✓ **Accessibility**: Added proper alt text and responsive styling for logo display
✓ **Visual Polish**: Maintained consistent branding across the Sahayak Platform interface

### January 23, 2025 - Enhanced AR Integration with Authentic Educational 3D Models Implementation  
✓ **Authentic Sketchfab Models**: Complete integration with curated authentic educational 3D models from verified sources
✓ **Real Educational Content**: Brain models from university medical collections, heart anatomy from St. George's University
✓ **Professional Model Sources**: Models from medical schools, verified creators like 3D4SCI, AVRcontent, and educational institutions
✓ **Smart Search Logic**: Enhanced matching algorithm for educational queries with subject-specific keywords
✓ **Data Integrity Fix**: Resolved React rendering errors with proper license object handling and data transformation
✓ **Working Embed URLs**: Authentic Sketchfab embed URLs with proper model IDs for real 3D viewer integration
✓ **Enhanced Model Database**: 25+ authentic educational models including brain anatomy, heart models, cellular structures
✓ **Error Resolution**: Fixed TypeScript interface issues and object-as-React-child rendering problems

### January 23, 2025 - Enhanced Visual Aids Designer UI Implementation
✓ **Navigation Enhancement**: Added back button to dashboard for seamless navigation between agents
✓ **Categorized Suggestions UI**: Reorganized suggestion prompts into subject-specific categories (Science & Biology, Mathematics, Geography & Social Studies, Chemistry & Physics)
✓ **Interactive Suggestion Selection**: Enhanced suggestions with hover effects, click-to-select functionality, and visual feedback
✓ **Professional Design**: Improved suggestions layout with color-coded categories, icons, and smooth transitions
✓ **User Experience**: Added toast notifications when suggestions are selected and pro tips for better results
✓ **Visual Polish**: Better spacing, typography, and responsive design for suggestion categories

### January 23, 2025 - NCERT Lesson Selection System Implementation
✓ **NCERT Lesson Database**: Comprehensive lesson database with authentic NCERT content for Classes 1, 6, 9, and 10
✓ **Lesson Selection Interface**: Multi-select checkboxes for choosing specific NCERT lessons from official textbooks
✓ **Backend API Integration**: Added `/api/ncert/lessons` endpoint for fetching lessons by subject and grade
✓ **Enhanced Lesson Planning**: AI prompts now incorporate selected NCERT lessons into weekly lesson plans
✓ **Professional PDF Generator**: Completely redesigned PDF generator with structured layout, proper typography, and educational content formatting
✓ **PDF Download Fix**: Resolved ES module import issues with proper fs module integration
✓ **Textbook API**: Added `/api/ncert/textbooks/class/:classNum` endpoint for fetching textbooks by grade
✓ **Error Handling**: Comprehensive error handling with detailed logging for debugging
✓ **Real NCERT Content**: Authentic lesson titles and chapter references from official NCERT textbooks

### January 23, 2025 - Comprehensive Weekly Lesson Planner Implementation
✓ **AI Lesson Planner Agent**: Complete weekly lesson planning system with comprehensive curriculum support
✓ **Multi-Subject Support**: All subjects (Math, Science, English, Hindi, Social Science, etc.) with CBSE/ICSE/State Board compatibility
✓ **Weekly Plan Generation**: Automated 5-day lesson plans with objectives, activities, materials, and assessments
✓ **Smart Configuration**: Grade levels 1-12, curriculum selection, focus areas, lesson duration, and class size customization
✓ **Cultural Relevance**: Indian education system integration with local examples and cultural context
✓ **Professional Interface**: Tabbed layout with Create Plan, My Plans, and Analytics sections
✓ **Gemini Integration**: Backend API using Gemini for culturally relevant lesson plan generation
✓ **No Upload Required**: Direct subject-based planning without file upload dependencies
✓ **Dashboard Integration**: Seamless navigation from main dashboard to lesson planner

### January 22, 2025 - On-the-Fly Educational Game Generation Implementation
✓ **Gamified Teaching Agent**: Complete interactive game generation page with real-time AI-powered game creation
✓ **Multiple Game Types**: Quiz, memory, puzzle, and racing game support with grade-level adaptation (1-12)
✓ **Smart Configuration**: Difficulty levels, duration settings, single/multiplayer modes, and topic customization
✓ **Real-time Gameplay**: Live timer, scoring system, question progression, and instant feedback mechanisms
✓ **Reward System**: Achievement badges, milestone rewards, progress tracking, and challenge objectives
✓ **Gemini Integration**: Backend API using Gemini 2.5 Flash for educational game content generation
✓ **Error Handling**: Robust fallback system with structured game templates for failed AI generation
✓ **Professional UI**: Modern gradient design with glassmorphism effects and smooth animations
✓ **Dashboard Navigation**: Seamless integration with main dashboard for easy agent access

### January 21, 2025 - Multi-Platform Compatibility Successfully Deployed  
✓ **Platform Detection System**: Automatic detection of deployment environment (Replit, Firebase, Vercel, Heroku, etc.)
✓ **Firebase Studio Deployment**: Successfully running on Firebase Cloud Workstations with full functionality
✓ **Firebase Emulators Integration**: Complete Firebase hosting and functions integration working
✓ **Cross-Platform Configuration**: Added platform-specific config files for all major platforms
✓ **Environment Variable Management**: Platform-agnostic environment variable handling
✓ **Live Deployment Verified**: Application accessible via Firebase Studio Cloud Workstations URL
✓ **Full Feature Compatibility**: All 11 AI agents, PDF generation, and image processing working on Firebase
✓ **Backward Compatibility**: All changes maintain existing Replit functionality

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