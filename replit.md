# MathTunis - Educational Math Assistant

## Overview

MathTunis is an AI-powered educational platform designed for Tunisian students from middle school to high school (baccalauréat). The application provides an intelligent chatbot that can solve mathematical problems using multiple input methods (text, image, PDF, audio) and supports multiple languages (French, Arabic, Tunisian dialect). The platform offers 2 free questions for anonymous users and unlimited access for registered users.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a modern full-stack architecture with a clear separation between client and server components:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack React Query for server state, React hooks for local state
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured route handling
- **Error Handling**: Centralized error handling middleware

## Key Components

### Authentication System
- **Primary Auth**: Firebase Authentication for user management
- **Backend Integration**: Custom user storage with Firebase UID mapping
- **User Types**: Regular users and admin users with role-based access

### Database Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL with Neon serverless integration (ACTIVE)
- **Schema**: Comprehensive schema covering users, conversations, messages, math solutions, and admin content
- **Migration**: Drizzle Kit for schema management
- **Storage**: DatabaseStorage class providing full CRUD operations for all entities
- **Connection**: Configured with DATABASE_URL environment variable and connection pooling

### AI Math Solver
- **Primary Engine**: HuggingFace Transformers API
- **Fallback Strategy**: Web scraping from mathematical websites (Wolfram Alpha, Mathway, Symbolab)
- **Input Processing**: Multiple format support (text, images via Tesseract.js, PDF via pdf.js, audio via Web Speech API)
- **Language Support**: French, Arabic, and Tunisian dialect processing

### UI/UX Components
- **Design System**: shadcn/ui components with custom theming
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Accessibility**: ARIA compliant components from Radix UI
- **Interactive Elements**: Real-time chat interface, file upload, audio recording

## Data Flow

1. **User Authentication**: Firebase handles initial auth, backend validates and stores user data
2. **Question Submission**: Multiple input modes process user questions into standardized text format
3. **AI Processing**: Questions are sent to HuggingFace models, with fallback to web scraping if needed
4. **Response Generation**: Structured math solutions with step-by-step explanations
5. **Storage**: All conversations and solutions are persisted in PostgreSQL
6. **Real-time Updates**: React Query manages cache invalidation and real-time UI updates

## External Dependencies

### Required Services
- **Neon Database**: PostgreSQL hosting (configured via DATABASE_URL)
- **Firebase**: Authentication and user management
- **HuggingFace**: AI model API for math problem solving

### Optional Integrations
- **Web Scraping**: Puppeteer/Playwright for fallback math solutions
- **File Processing**: Browser-native APIs for image, PDF, and audio processing
- **Replit**: Development environment integration with hot reload and error overlay

## Deployment Strategy

### Development
- **Hot Reload**: Vite development server with React Fast Refresh
- **Database**: Drizzle schema push for rapid development
- **Environment**: Node.js with tsx for TypeScript execution

### Production
- **Build Process**: Vite for frontend bundling, esbuild for backend compilation
- **Static Assets**: Served from dist/public directory
- **Server**: Express.js serving both API and static content
- **Database**: PostgreSQL with connection pooling via Neon serverless
- **Data Persistence**: Full database integration with user accounts, conversations, messages, math solutions, and admin content

## Recent Changes

### 2025-01-29: Database Integration Complete
- **Added PostgreSQL database** with Neon serverless connection
- **Implemented DatabaseStorage** replacing in-memory storage for full persistence
- **Configured database schema** with users, conversations, messages, math_solutions, and admin_content tables
- **Tested database operations** - user registration, conversation creation, message persistence all working
- **Updated storage system** to use Drizzle ORM with proper error handling and type safety

### Configuration
- **Environment Variables**: Firebase config, database URL, HuggingFace API key
- **TypeScript**: Shared types between client and server via shared directory
- **Path Aliases**: Configured for clean imports (@/, @shared/, @assets/)

The architecture prioritizes developer experience with TypeScript throughout, modern tooling, and a clear separation of concerns while maintaining the flexibility to add features like advanced AI models or additional input processing capabilities.