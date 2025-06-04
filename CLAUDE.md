# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React TypeScript application that creates a 3D emotional chat AI using Google's Gemini API. The app features a 3D character that displays emotions while providing company-specific answers.

## Commands

### Development
- `npm install` - Install dependencies
- `npm run dev` - Start development server (runs Vite)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Environment Setup
Create a `.env.local` file with:
```
GEMINI_API_KEY=your_actual_gemini_api_key
GOOGLE_CALENDAR_ICAL_URL=your_google_calendar_ical_url
```

### Company Configuration
1. **Company Information**: Edit `/company-info/company.md` with your company details in Markdown format
2. **Calendar Integration**: Set the `GOOGLE_CALENDAR_ICAL_URL` environment variable to your Google Calendar's public iCal URL

## Architecture

### Key Design Decisions
1. **ES Modules with Import Maps**: The app uses native ES modules loaded from esm.sh CDN instead of bundling dependencies. This is configured in `index.html`.

2. **State Management**: 
   - Language state is managed via React Context (`LanguageContext`)
   - Chat state and knowledge base are managed in the main `App.tsx` component
   - Emotion states are derived from AI responses and passed to the 3D character

3. **3D Character System**:
   - `threeCharacter.ts` creates a Three.js scene with a character that changes expressions
   - Emotions (NEUTRAL, HAPPY, SAD, ANGRY, SURPRISED, THINKING) are determined by the Gemini AI
   - Character updates are handled through a ref-based API to avoid React re-renders

4. **AI Integration**:
   - `geminiService.ts` handles all Gemini API interactions
   - System prompt includes company knowledge base and instructions for emotion detection
   - Web search capability is triggered by specific keywords in responses

### Component Communication Flow
1. User input → `ChatInput` → `App` state
2. `App` → `geminiService` → Gemini API
3. Response → Parse emotion → Update both chat messages and 3D character
4. Knowledge updates → Stored in localStorage → Included in system prompt

### TypeScript Configuration
- Strict mode enabled
- Path alias `@/*` maps to project root
- Target ES2020 with ESNext modules

## Important Implementation Details

- The Gemini API key and calendar URL are loaded through Vite's define plugin
- All UI text supports i18n through the `translations.ts` file
- The 3D character uses a simple sphere with vertex manipulation for expressions
- Company knowledge is loaded from `/company-info/company.md` and Google Calendar iCal URL at startup
- Calendar data is fetched and parsed to show upcoming events (next 30 days)
- The right panel now displays company knowledge in read-only format (no longer editable via UI)
- Chat history is not persisted between sessions