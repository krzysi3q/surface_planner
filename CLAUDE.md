# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HandyLay is a multilingual floor and wall planner application built with Next.js 15, TypeScript, and React. It allows users to create interactive tile and panel layouts with real-time visual feedback, custom texture uploads, and pattern planning capabilities.

## Development Commands

```bash
# Development
npm run dev          # Start development server with turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# The application runs on http://localhost:3000
```

## Architecture Overview

### Core Technologies
- **Next.js 15** with App Router and dynamic routing (`/app/[lang]/`)
- **React 19** with TypeScript
- **Konva.js** via react-konva for canvas-based planner interface
- **Tailwind CSS 4** for styling
- **i18next** for internationalization (English, Polish, Spanish, Chinese)

### Key Components Structure

**Planner System** (`/src/components/Planner/`):
- `Planner.tsx` - Main canvas-based planning interface using react-konva
- `PatternEditor/` - Tile pattern creation and texture management
- `Surface.tsx` - Individual surface rendering with pattern application
- `usePlannerReducer.ts` - Complex state management for planner operations
- `types.ts` - Core data structures (Point, SurfaceType, Pattern, TileType)

**Internationalization** (`/src/i18n/`):
- URL-based language routing with `/[lang]/` prefix
- Custom `useTranslation` hook and `I18nProvider`
- Translation files in `/src/i18n/locales/` (en.json, pl.json, es.json, zh.json)
- `SmartPlannerLink` component for language-aware navigation

**Texture System** (`/src/components/Planner/PatternEditor/`):
- `TextureLibraryContext.tsx` - Global texture management
- `TextureUpload.tsx` - Custom image upload (JPEG, PNG, WebP up to 10MB)
- Images processed to 512x512 and stored as base64 in JSON

### Data Flow & State Management

The planner uses a reducer pattern (`usePlannerReducer`) for complex geometric operations:
- Surface creation, union, and subtraction operations using `@doodle3d/clipper-js`
- Wall editing with real-time dimension updates
- Pattern application with texture positioning
- History state management for undo/redo functionality

### Key Utilities

**Geometric Operations** (`/src/components/Planner/utils.ts`):
- `unionSurfaces()`, `subtractSurfaces()` - Boolean operations on polygons
- `getSurfaceArea()`, `getAngles()` - Surface calculations
- `toClockwise()` - Polygon orientation normalization

**Image Processing** (`/src/utils/imageUtils.ts`):
- Automatic image resizing and base64 conversion for texture storage

## Critical Development Guidelines

### Internationalization Requirements
**MANDATORY**: All user-facing strings must use the translation system. Follow `/AI_I18N_GUIDELINES.md`:

```tsx
// Import translation hook
import { useTranslation } from '@/hooks/useTranslation';

// Use in components
const { t } = useTranslation();
return <button>{t('ui.save')}</button>;

// Add keys to ALL language files:
// /src/i18n/locales/en.json, pl.json, es.json, zh.json
```

**Never use hard-coded strings** - all text must go through `t()` function including alt text, aria-labels, and tooltips.

### Navigation
Use `SmartPlannerLink` for internal navigation to maintain language routing:
```tsx
import { SmartPlannerLink } from '@/components/SmartPlannerLink';
<SmartPlannerLink href="/planner">{t('nav.planner')}</SmartPlannerLink>
```

### Planner State Management
When modifying planner functionality:
- Use `usePlannerReducer` for state updates
- Geometric operations should use the utility functions in `utils.ts`
- Always maintain polygon clockwise orientation with `toClockwise()`
- Test surface intersection operations thoroughly

### Texture System
Custom textures are stored as base64 within project JSON:
- Use `TextureLibraryProvider` for texture management
- Upload processing happens in `TextureUpload.tsx`
- Textures are automatically resized to 512x512 pixels

### Component Patterns
- Use the `classMerge` utility for conditional Tailwind classes
- Canvas interactions are handled through Konva event system
- Touch device detection available via `useTouchDevice` hook
- Notification system available via `useNotification` hook

## File Organization

```
src/
├── app/[lang]/              # Next.js App Router with language routing
├── components/
│   ├── Planner/             # Main planning interface
│   │   ├── PatternEditor/   # Tile pattern creation
│   │   └── components/      # Planner UI components
│   ├── Notification/        # Toast notification system
│   └── [various UI components]
├── i18n/                    # Internationalization setup
├── hooks/                   # Custom React hooks
└── utils/                   # Utility functions
```

## Testing & Quality
Run `npm run lint` after changes to ensure code quality. The project uses ESLint with Next.js configuration.

## Data Storage
Projects are saved to localStorage with embedded textures as base64. The `saveToLocalStorage` and `loadFromLocalStorage` functions handle project persistence with texture management.