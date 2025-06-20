# Animation Studio - Intelligent Character Animation Engine

## Overview

This is an intelligent 2D character animation engine that combines computer vision, AI analysis, and physics simulation to automatically create realistic character animations. The application allows users to upload character images, analyze their structure, and generate various types of animations (walk, run, attack, idle) using advanced skeletal tracking and physics-based movement.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with Shadcn/ui components
- **State Management**: React hooks with TanStack Query for server state
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for development and production builds
- **UI Framework**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for RESTful API
- **Database**: PostgreSQL with Drizzle ORM
- **File Storage**: Local file system with multer for uploads
- **AI Integration**: OpenAI API for character analysis

## Key Components

### Character Analysis System
- **Computer Vision Pipeline**: Analyzes uploaded character images to detect body parts
- **Skeletal Generation**: Creates bone structures and joint mappings automatically
- **Depth Analysis**: Determines layering and 3D positioning of character elements
- **Part Confidence Scoring**: Assigns reliability scores to detected body parts

### Animation Engine
- **Physics Simulation**: Realistic movement with gravity, damping, and momentum
- **Keyframe Generation**: Automatic creation of smooth animation sequences
- **Multiple Animation Types**: Support for walk, run, attack, idle, and custom animations
- **Real-time Preview**: Live animation playback with adjustable parameters

### Video Processing
- **Game Video Analysis**: Extracts character movements from existing game footage
- **Motion Tracking**: Identifies and captures character animation patterns
- **Animation Extraction**: Converts video sequences into reusable animation data

### User Interface
- **RTL Support**: Right-to-left interface design (Arabic)
- **Dark Theme**: Professional dark color scheme optimized for animation work
- **Responsive Panels**: Resizable workspace with analysis, viewport, controls, and timeline
- **Real-time Feedback**: Live progress indicators and interactive controls

## Data Flow

1. **Character Upload**: User uploads character image through drag-and-drop interface
2. **AI Analysis**: Image processed through computer vision pipeline to detect body parts
3. **Skeleton Generation**: Automatic creation of bone structure and joint connections
4. **Animation Generation**: User selects animation type and parameters
5. **Physics Simulation**: Real-time calculation of realistic movement patterns
6. **Preview & Export**: Live preview with export capabilities for game integration

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **multer**: File upload handling
- **openai**: AI-powered character analysis

### Development Tools
- **vite**: Fast build tool and development server
- **typescript**: Type safety and developer experience
- **tailwindcss**: Utility-first CSS framework
- **eslint**: Code quality and consistency

### AI & Computer Vision
- **OpenAI API**: Character analysis and skeletal structure generation
- **Custom CV Pipeline**: Body part detection and confidence scoring
- **Physics Engine**: Custom implementation for realistic movement simulation

## Deployment Strategy

### Development Environment
- **Replit Integration**: Full development environment with hot reloading
- **Database**: PostgreSQL 16 with automatic provisioning
- **File Storage**: Local uploads directory with static serving
- **Port Configuration**: Development server on port 5000

### Production Deployment
- **Build Process**: Vite production build with Express server bundling
- **Static Assets**: Optimized client bundle with asset optimization
- **Database**: Production PostgreSQL with connection pooling
- **File Handling**: Scalable file storage with size limits (100MB max)

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string
- **OPENAI_API_KEY**: AI analysis service authentication
- **NODE_ENV**: Environment-specific configuration
- **File Upload Limits**: Configurable size and type restrictions

## Changelog

```
Changelog:
- June 20, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```