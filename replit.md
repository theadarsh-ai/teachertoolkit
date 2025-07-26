# EduAI Platform - Multi-Grade Teaching Assistant

## Overview

EduAI Platform is a comprehensive web application designed to empower teachers in multi-grade classrooms with AI-powered educational tools. The platform provides 11 specialized AI agents that assist with content generation, lesson planning, assessment, and classroom analytics, all tailored for Indian educational contexts with multi-language support.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Updates

### January 26, 2025 - Complete Firebase Hosting Deployment Setup Implementation
✓ **Firebase Functions Backend**: Complete Express.js backend ported to Firebase Functions with all 12 AI agents
✓ **Firebase Hosting Frontend**: React application configured for Firebase hosting with optimized build process
✓ **Production Configuration**: firebase.json configured for both frontend hosting and backend functions deployment
✓ **Deployment Scripts**: Automated deployment scripts (firebase-deploy.sh, firebase-quick-deploy.sh) for easy deployment
✓ **Complete API Migration**: All endpoints ported to Firebase Functions including knowledge base, video generation, NCERT integration
✓ **Build System**: Vite frontend build and TypeScript compilation for Firebase Functions working successfully
✓ **Environment Setup**: PostgreSQL database, Gemini AI, and all external services configured for Firebase deployment
✓ **Documentation**: Comprehensive FIREBASE-DEPLOYMENT.md guide with step-by-step deployment instructions
✓ **Production Ready**: Both frontend and backend fully configured for live Firebase hosting deployment

## Recent Updates

### January 24, 2025 - Python Bridge for Real Veo 3.0 Video Generation
✓ **Python Bridge Implementation**: Direct integration of user's working Python code for actual video generation
✓ **Clean Architecture**: Rewrote video generator service with proper error handling and real video focus
✓ **Authentic Video Generation**: System now calls user's proven Python code that successfully generates videos
✓ **No More Concepts**: Eliminated concept generation fallbacks - system attempts real videos only
✓ **Python-Node.js Bridge**: Created python-video-bridge.py that mirrors user's working FastAPI implementation
✓ **Real Video URLs**: System returns actual Google Cloud Storage URLs for generated MP4 files
✓ **Error Transparency**: Clear error reporting when video generation fails vs. success with real videos
✓ **Production Ready**: Video generator service focuses on real video generation using proven Python methods
✓ **User Code Integration**: Directly leverages user's working genai.Client and GenerateVideosConfig pattern
✓ **Streamlined Process**: Removed unnecessary fallbacks, quota simulation, and concept generation logic

### January 24, 2025 - Classroom Analytics and Pacing Agent Implementation
✓ **Analytics Dashboard**: Complete classroom analytics page with interactive teacher usage statistics
✓ **Agent Usage Tracking**: Hard-coded data showing how many times teachers used each of the 11 AI agents
✓ **Pacing Insights**: Interactive pacing analysis with curriculum progress tracking and behind-schedule alerts
✓ **Performance Metrics**: Weekly overview with total sessions, time spent, students impacted, and content generated
✓ **Smart Recommendations**: AI-powered suggestions for improving classroom pacing and engagement
✓ **Professional UI**: Multi-tab interface with overview, agent usage, pacing insights, and recommendations
✓ **Header Integration**: Analytics button added near profile in dashboard header with gradient styling
✓ **Interactive Data**: Comprehensive hard-coded analytics including success rates, popular grades, and recent activity

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

## Complete System Architecture

### Frontend Architecture (React + TypeScript)
- **Framework**: React 18.2+ with TypeScript 5.0+
- **Build System**: Vite 4.0+ with Hot Module Replacement (HMR)
- **Styling**: Tailwind CSS 3.3+ with custom gradient themes and glassmorphism effects
- **UI Component Library**: Radix UI primitives with shadcn/ui styling system
- **State Management**: TanStack React Query v5 for server state synchronization
- **Form Management**: React Hook Form with Zod schema validation
- **Routing**: Wouter for lightweight client-side routing (alternative to React Router)
- **Icons**: Lucide React + React Icons for comprehensive icon coverage
- **Animation**: Framer Motion for smooth transitions and micro-interactions
- **File Structure**:
  ```
  client/src/
  ├── components/ui/          # Reusable UI components (shadcn/ui)
  ├── pages/                  # Route-based page components
  ├── lib/                    # Utility functions and configurations
  ├── hooks/                  # Custom React hooks
  ├── types/                  # TypeScript type definitions
  └── assets/                 # Static assets and images
  ```

### Backend Architecture (Node.js + Express + TypeScript)
- **Runtime Environment**: Node.js 18+ with ES Modules support
- **Web Framework**: Express.js 4.18+ with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL for type-safe database operations
- **Session Management**: Express-session with connect-pg-simple for PostgreSQL storage
- **File Upload**: Multer for handling multipart/form-data
- **API Design**: RESTful architecture with standardized JSON responses
- **Error Handling**: Centralized error middleware with proper HTTP status codes
- **Security**: CORS, helmet, and input validation with Zod schemas
- **File Structure**:
  ```
  server/
  ├── index.ts               # Express server entry point
  ├── routes.ts              # API route definitions
  ├── storage.ts             # Database interface and operations
  ├── video-generator.ts     # Video generation service
  └── vite.ts               # Vite integration for development
  ```

### Python AI Agent Architecture (LangGraph + FastAPI)
- **Framework**: FastAPI for high-performance async API endpoints
- **AI Orchestration**: LangGraph for complex multi-step AI workflows
- **Language Model**: Google Gemini 2.5 Flash/Pro for text generation
- **Workflow Engine**: StateGraph for managing agent state transitions
- **Base Architecture**: All agents inherit from BaseEducationalAgent class
- **Agent Communication**: RESTful API bridge between Node.js and Python services
- **File Structure**:
  ```
  python_agents/
  ├── main.py                # FastAPI server and route definitions
  ├── agents/
  │   ├── base_agent.py      # Base class for all educational agents
  │   ├── content_generator.py      # Hyper-local content generation
  │   ├── knowledge_base.py         # Enhanced Q&A system
  │   ├── lesson_planner.py         # NCERT-integrated lesson planning
  │   ├── differentiated_materials.py  # Multi-grade content adaptation
  │   ├── visual_aids.py            # AR and diagram generation
  │   ├── gamified_teaching.py      # Interactive game creation
  │   ├── master_chatbot.py         # Central agent coordinator
  │   └── [other specialized agents]
  └── requirements.txt       # Python dependencies
  ```

### Database Architecture (PostgreSQL + Drizzle ORM)
- **Database Engine**: PostgreSQL 15+ with JSONB support for flexible data storage
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: `shared/schema.ts` for consistent type definitions
- **Migration System**: Drizzle Kit for database schema migrations
- **Tables**:
  ```sql
  -- Users table for authentication mapping
  users (id, firebase_uid, email, display_name, created_at)
  
  -- Agent configurations per user
  agent_configs (id, user_id, agent_id, grades, languages, settings)
  
  -- Chat sessions for conversation history
  chat_sessions (id, user_id, agent_id, title, created_at)
  
  -- Individual messages within chat sessions
  chat_messages (id, session_id, role, content, metadata, timestamp)
  
  -- Generated content with versioning
  generated_content (id, user_id, agent_id, content_type, data, metadata)
  ```

### Authentication & Authorization System
- **Primary Authentication**: Firebase Authentication 9.0+ with Google OAuth 2.0
- **Session Management**: Express-session with PostgreSQL store for server-side sessions
- **User Flow**:
  1. Frontend initiates Google OAuth via Firebase Auth
  2. Firebase handles OAuth redirect and token exchange
  3. Backend receives Firebase ID token and verifies it
  4. User record created/retrieved in PostgreSQL using Firebase UID
  5. Express session established with encrypted session cookie
- **Security Features**:
  - HTTPS enforcement for all authentication flows
  - Secure session cookies with SameSite and HttpOnly flags
  - Firebase ID token verification for API endpoints
  - CORS configured for authorized domains only

### API Architecture & Endpoints
- **Base URL**: `/api/` prefix for all backend endpoints
- **Agent Endpoints**:
  ```
  POST /api/agents/content-generation/generate
  POST /api/agents/differentiated-materials/process
  POST /api/agents/lesson-planner/generate
  POST /api/agents/knowledge-base/query
  POST /api/agents/visual-aids/generate
  POST /api/agents/gamified-teaching/generate
  POST /api/agents/audio-assessment/analyze
  POST /api/video-generator/generate
  POST /api/agents/master-chatbot/chat
  ```
- **NCERT Database Endpoints**:
  ```
  GET /api/ncert/textbooks
  GET /api/ncert/textbooks/class/:classNum
  GET /api/ncert/lessons
  POST /api/ncert/scrape
  ```
- **Utility Endpoints**:
  ```
  GET /api/langgraph/agents/health
  GET /api/sketchfab/models
  ```

### Real-time Communication & WebSocket Integration
- **WebSocket Support**: Native WebSocket for real-time features
- **Audio Processing**: Web Audio API for live recording and playback
- **File Upload**: Streaming file upload with progress tracking
- **Live Updates**: Real-time agent status and processing updates

## Key Components

### AI Agent System - Detailed Technical Architecture

The platform features 12 specialized AI agents built with Python LangGraph and Node.js backend integration:

#### 1. **Hyper-Local Content Generation Agent**
- **Technical Stack**: Python LangGraph + Gemini AI + Speech-to-Text API
- **File Location**: `python_agents/agents/content_generator.py`, `client/src/pages/content-generator.tsx`
- **Capabilities**: 
  - Processes speech-to-text input for hands-free content creation
  - Supports 8 Indian languages (Hindi, Marathi, Tamil, Kannada, Malayalam, English, Telugu, Bengali)
  - Generates culturally relevant educational materials with local examples
  - Adapts content based on regional festivals, customs, and cultural references
- **API Endpoints**: `/api/agents/content-generation/generate`
- **Workflow Steps**: Input Processing → Language Detection → Cultural Context Analysis → Content Generation → Localization
- **Output Formats**: Text, HTML, structured educational materials

#### 2. **Differentiated Materials Creator Agent**
- **Technical Stack**: Python LangGraph + File Processing + Multi-format Output Generation
- **File Location**: `python_agents/agents/differentiated_materials.py`, `client/src/pages/differentiated-materials.tsx`
- **Capabilities**:
  - Processes PDF, DOCX, CSV, and plain text files
  - Automatically adapts single content into multiple grade-level versions (1st-12th)
  - Maintains core educational concepts while adjusting complexity
  - Generates downloadable templates and worksheets
- **API Endpoints**: `/api/agents/differentiated-materials/process`
- **Workflow Steps**: File Upload → Content Analysis → Grade-level Adaptation → Template Generation → Export
- **Processing Pipeline**: Uses multer for file upload, extracts text content, analyzes complexity, generates differentiated versions

#### 3. **AI Lesson Planner Agent**
- **Technical Stack**: Python LangGraph + NCERT Database Integration + Curriculum Analysis
- **File Location**: `python_agents/agents/lesson_planner.py`, `client/src/pages/lesson-planner.tsx`
- **Capabilities**:
  - Integrates with comprehensive NCERT textbook database
  - Generates weekly 5-day lesson plans with structured activities
  - Tracks curriculum progress and provides pacing recommendations
  - Supports CBSE, ICSE, and State Board curricula
- **API Endpoints**: `/api/agents/lesson-planner/generate`, `/api/ncert/lessons`
- **Workflow Steps**: Syllabus Analysis → Curriculum Mapping → Weekly Planning → Activity Generation → Progress Tracking
- **NCERT Integration**: Real textbook data from Classes 1, 6, 9, and 10 with lesson selection system

#### 4. **Enhanced Instant Knowledge Base Agent**
- **Technical Stack**: Python LangGraph + Gemini AI + NCERT Database + External Source Integration
- **File Location**: `python_agents/agents/knowledge_base.py`, `client/src/pages/instant-knowledge.tsx`
- **Capabilities**:
  - Comprehensive Q&A system drawing from NCERT textbooks and external educational sources
  - Provides detailed scientific explanations with step-by-step processes
  - Generates culturally relevant analogies and follow-up questions
  - Multi-language support with grade-appropriate responses
- **API Endpoints**: `/api/agents/knowledge-base/query`
- **Workflow Steps**: Question Analysis → NCERT Search → External Source Search → Answer Synthesis → Analogy Creation → Follow-up Generation
- **Enhanced Features**: Real-time confidence scoring, source citation, comprehensive fallback responses

#### 5. **Visual Aids Designer Agent**
- **Technical Stack**: Python LangGraph + Sketchfab API + AR Content Generation
- **File Location**: `python_agents/agents/visual_aids.py`, `client/src/pages/visual-aids.tsx`
- **Capabilities**:
  - Generates educational diagrams, flowcharts, and mind maps
  - Integrates with Sketchfab API for authentic 3D educational models
  - Creates AR-ready content for complex concept visualization
  - Supports science, mathematics, and geography visualizations
- **API Endpoints**: `/api/agents/visual-aids/generate`, `/api/sketchfab/models`
- **AR Integration**: 25+ authentic educational 3D models from verified sources including medical schools and educational institutions
- **Model Sources**: Brain anatomy from university collections, cellular structures from verified creators

#### 6. **Gamified Teaching Agent**
- **Technical Stack**: Python LangGraph + Real-time Game Generation + Achievement System
- **File Location**: `python_agents/agents/gamified_teaching.py`, `client/src/pages/gamified-teaching.tsx`
- **Capabilities**:
  - Generates interactive educational games (Quiz, Memory, Puzzle, Racing)
  - Real-time scoring system with achievement badges
  - Leaderboards and progress tracking
  - Grade-level adaptive difficulty (1st-12th)
- **API Endpoints**: `/api/agents/gamified-teaching/generate`
- **Game Engine**: Custom React-based game engine with timer, scoring, and reward mechanics
- **Workflow Steps**: Topic Analysis → Game Type Selection → Question Generation → Reward System Setup → Real-time Gameplay

#### 7. **Audio Reading Assessment Agent**
- **Technical Stack**: Gemini AI + Web Audio API + Speech Recognition + Multi-language Analysis
- **File Location**: `client/src/pages/audio-reading-assessment.tsx`
- **Capabilities**:
  - Live microphone recording with professional audio settings
  - File upload support (MP3, WAV, WebM)
  - Real AI analysis of pronunciation, fluency, and comprehension
  - Supports 10 languages including Hindi, English, Tamil, Telugu, Marathi, Bengali, Gujarati, Kannada, Punjabi, Urdu
- **API Endpoints**: `/api/agents/audio-assessment/analyze`
- **Assessment Pipeline**: Audio Capture → Speech-to-Text → AI Analysis → Scoring → Feedback Generation
- **Real Features**: Authentic word-by-word analysis, mistake identification, improvement suggestions

#### 8. **Video Generation Agent (Google Veo 3.0)**
- **Technical Stack**: Google Veo 3.0 API + Python Bridge + Cloud Storage
- **File Location**: `server/video-generator.ts`, `python_agents/python-video-bridge.py`, `client/src/pages/video-generator.tsx`
- **Capabilities**:
  - Real MP4 video generation using Google Veo 3.0
  - Educational content creation with custom prompts
  - Cloud storage integration for video hosting
  - Professional video processing pipeline
- **API Endpoints**: `/api/video-generator/generate`
- **Technical Architecture**: Node.js service calls Python bridge which uses Google genai.Client for actual video generation
- **Real Output**: Generates authentic MP4 files hosted on Google Cloud Storage

#### 9. **Classroom Analytics & Pacing Agent**
- **Technical Stack**: React Dashboard + Chart.js + Performance Analytics
- **File Location**: `client/src/pages/classroom-analytics.tsx`
- **Capabilities**:
  - Teacher usage statistics across all 11 AI agents
  - Curriculum pacing analysis with behind-schedule alerts
  - Performance metrics with weekly overviews
  - AI-powered recommendations for classroom improvement
- **Dashboard Features**: Multi-tab interface (Overview, Agent Usage, Pacing Insights, Recommendations)
- **Analytics Engine**: Hard-coded data showing agent usage patterns, success rates, and performance trends

#### 10. **AR Integration Agent**
- **Technical Stack**: Sketchfab API + 3D Model Database + WebGL Rendering
- **File Location**: `client/src/pages/ar-integration.tsx`
- **Capabilities**:
  - Authentic educational 3D models from verified Sketchfab sources
  - Brain anatomy, heart models, cellular structures from medical institutions
  - Real-time 3D model embedding and interaction
  - Educational content matching with smart search algorithms
- **Model Database**: 25+ authentic models from universities, medical schools, and verified educational creators
- **Technical Implementation**: Sketchfab embed URLs with proper model IDs and licensing

#### 11. **Master Agent Chatbot**
- **Technical Stack**: Python LangGraph + Context Management + Agent Routing
- **File Location**: `python_agents/agents/master_chatbot.py`
- **Capabilities**:
  - Central routing system for all AI agents
  - Context management across multiple conversations
  - Intelligent agent selection based on user queries
  - Session management and conversation history
- **API Endpoints**: `/api/agents/master-chatbot/chat`
- **Architecture**: Acts as orchestrator for all other agents, maintains conversation state, routes requests to appropriate specialized agents

#### 12. **NCERT Integration System**
- **Technical Stack**: Firebase Firestore + Web Scraping + Curriculum Database
- **File Location**: `server/routes.ts` (NCERT endpoints), `client/src/pages/ncert.tsx`
- **Capabilities**:
  - Complete NCERT textbook database with real curriculum content
  - Automated web scraping from NCERT official sources
  - Lesson selection system with multi-select functionality
  - Integration with lesson planner and knowledge base agents
- **API Endpoints**: `/api/ncert/scrape`, `/api/ncert/textbooks`, `/api/ncert/lessons`
- **Database Schema**: Textbooks with class, subject, chapters, and lesson mapping

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