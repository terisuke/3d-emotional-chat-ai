# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React TypeScript application that creates a 3D emotional chat AI using Google's Gemini API. The app features a VRM-based 3D character that displays realistic emotions while providing company-specific answers with real-time calendar integration and web search capabilities.

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

2. **VRM 3D Character System**:
   - **Real VRM Model**: Uses actual VRM files (`.vrm`) with proper bone structure and animations
   - **Character**: Cloudia (クラウディア.vrm) - a fully rigged 3D character model
   - **Bone Manipulation**: Direct manipulation of VRM bones for realistic expressions
   - **Emotion Mapping**: Advanced emotion system with multiple facial expressions
   - **Performance Optimization**: Ref-based updates bypass React re-renders for smooth animations

3. **State Management**: 
   - Language state is managed via React Context (`LanguageContext`)
   - Chat state and knowledge base are managed in the main `App.tsx` component
   - Emotion states are derived from AI responses and passed to the 3D character
   - Character state is managed outside React lifecycle for performance

4. **AI Integration with Enhanced Capabilities**:
   - `geminiService.ts` handles all Gemini API interactions with streaming responses
   - System prompt includes company knowledge base and calendar data
   - **Web Search Integration**: Automatic web search triggered by specific keywords
   - **Washington Proxy**: Uses Washington-based proxy for global web search access
   - Emotion detection and parsing from AI responses

5. **Calendar Integration**:
   - **Real-time Sync**: Connects to Google Calendar via public iCal URL
   - **Advanced Parsing**: Custom iCal parser with UTF-8 encoding support for Japanese
   - **Smart Filtering**: Displays upcoming events (next 30 days) with intelligent date handling
   - **Encoding Handling**: Advanced character encoding detection and correction

6. **Proxy Architecture**:
   - **Netlify Functions**: Server-side proxies for API calls (`/api/gemini`, `/api/calendar`)
   - **CORS Handling**: Seamless integration with external APIs
   - **Global Accessibility**: Washington proxy ensures international accessibility

### Component Communication Flow
1. User input → `ChatInput` → `App` state
2. `App` → `geminiService` → Gemini API (via `/api/gemini` proxy)
3. Response processing → Parse emotion + content → Update chat messages
4. Emotion extraction → `CharacterDisplay` → VRM character expression update
5. Calendar sync → `calendarService` → Parse iCal → Include in AI context
6. Web search triggers → `companyWebSearch` → Washington proxy → Search results

### 3D Character Technical Details

**VRM Model Integration**:
- Loads `.vrm` files using `@pixiv/three-vrm` library
- Validates bone structure on load (hips, spine, chest, arms, etc.)
- Applies initial pose to avoid T-pose display
- Supports complex facial expressions through bone manipulation

**Expression System**:
- **NEUTRAL**: Default relaxed expression
- **HAPPY**: Upward mouth movement, raised cheeks
- **SAD**: Downward mouth, drooped features
- **ANGRY**: Furrowed brow, tight expression
- **SURPRISED**: Wide eyes, open mouth
- **THINKING**: Tilted head, contemplative pose

**Performance Optimizations**:
- Direct bone manipulation without triggering React re-renders
- Cached bone references for fast updates
- Smooth transition animations between expressions

### Calendar System Architecture

**iCal Parsing**:
- Custom parser handles both YYYYMMDD and YYYYMMDDTHHMMSSZ formats
- Supports 15 and 16 character UTC date strings
- Automatic encoding detection for Japanese characters
- Robust error handling for invalid dates

**Event Processing**:
- Filters events to next 30 days
- Sorts by date for chronological display
- Limits to 10 most relevant events
- Formats for AI consumption with localized dates/times

**Encoding Handling**:
- UTF-8 decoder with fallback mechanisms
- Automatic detection of double-encoding issues
- Special handling for Japanese character sets

### TypeScript Configuration
- Strict mode enabled
- Path alias `@/*` maps to project root
- Target ES2020 with ESNext modules
- VRM type definitions included

## Important Implementation Details

### Environment & API Configuration
- The Gemini API key and calendar URL are loaded through Vite's define plugin
- All API calls are proxied through Netlify Functions for security and CORS handling
- Washington-based proxy server enables global web search access

### Internationalization
- All UI text supports i18n through the `translations.ts` file
- Company knowledge supports both Japanese and English content
- Calendar events display with proper locale formatting

### Data Management
- Company knowledge is loaded from `/company-info/company.md` at startup
- Calendar data is fetched and cached during app initialization
- Knowledge is included in AI system prompt for context-aware responses
- Chat history is not persisted between sessions (intentional design choice)

### 3D Character Assets
- VRM model located in `/public/assets/vrm/クラウディア.vrm`
- Additional animation files supported (`.vrma` format)
- Character assets are loaded asynchronously with proper error handling

### Search Integration
- Web search automatically triggered by keywords like "latest", "recent", "current"
- Search results are integrated into AI responses seamlessly
- Proxy ensures consistent access regardless of geographic location

### Production Considerations
- Development mode uses mock calendar data to avoid CORS issues
- Production mode uses real calendar API through Netlify Functions
- All console logging is removed in production builds
- Optimized for Netlify deployment with edge distribution

## Development Notes

### Testing Calendar Integration
- Use the mock data in development mode
- Test with real iCal URLs in production environment
- Verify Japanese character encoding works correctly

### 3D Character Development
- Character expressions can be tested by manually calling emotion functions
- VRM model can be replaced by updating the file path in `threeCharacter.ts`
- Bone structure validation helps ensure compatibility with different VRM models

### API Proxy Development
- Netlify Functions in `/api/` folder handle server-side operations
- Test proxies locally with `netlify dev` command
- Ensure environment variables are properly configured

### Performance Monitoring
- Monitor 3D character render performance
- Watch for memory leaks in VRM model loading
- Optimize calendar parsing for large calendars if needed