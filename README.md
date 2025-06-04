# 3D Emotional Chat AI

An innovative React TypeScript application that creates an immersive 3D emotional chat AI experience using Google's Gemini API, featuring a 3D VRM character that displays emotions while providing company-specific answers.

## ✨ Features

### 🎭 3D Character with Emotions
- **VRM Model Integration**: Loads and displays 3D VRM characters (currently featuring Cloudia)
- **Emotional Expressions**: Character changes expressions based on AI responses (NEUTRAL, HAPPY, SAD, ANGRY, SURPRISED, THINKING)
- **Real-time Animation**: Smooth transitions between emotional states during conversations

### 🤖 AI-Powered Conversations
- **Gemini Integration**: Powered by Google's Gemini API for intelligent responses
- **Company Knowledge Base**: Integrated with company information and real-time calendar data
- **Web Search Capability**: Enhanced with web search functionality via Washington proxy for global accessibility
- **Emotion Detection**: AI automatically determines appropriate emotions for responses

### 📅 Calendar Integration
- **Real-time Sync**: Connects to Google Calendar via iCal URL
- **Event Display**: Shows upcoming events in chat responses
- **Japanese Support**: Full UTF-8 encoding support for Japanese calendar events
- **Smart Filtering**: Displays relevant upcoming events (next 30 days)

### 🌐 Internationalization
- **Multi-language Support**: Japanese and English interface
- **Dynamic Language Switching**: Real-time language toggling
- **Localized Content**: Company information and UI elements support multiple languages

## 🚀 Architecture Highlights

### Modern Tech Stack
- **Frontend**: React 18 with TypeScript and Vite
- **3D Graphics**: Three.js with VRM model support
- **AI Integration**: Google Gemini API with streaming responses
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React Context for language and app state

### Innovative Design Decisions
- **ES Modules with Import Maps**: Native ES modules loaded from esm.sh CDN instead of bundling
- **Ref-based 3D Updates**: Character expression updates bypass React re-renders for performance
- **Proxy Architecture**: Washington-based proxy server for global web search access
- **Character Encoding**: Advanced UTF-8 handling for Japanese calendar integration

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **Gemini API Key** from Google AI Studio
- **Google Calendar** with public iCal URL (optional)

## 🛠 Setup & Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env.local` file with the following variables:

```env
GEMINI_API_KEY=your_actual_gemini_api_key
GOOGLE_CALENDAR_ICAL_URL=your_google_calendar_ical_url
```

**Getting Your API Key:**
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Copy the key to your `.env.local` file

**Calendar Setup (Optional):**
1. Open Google Calendar
2. Go to Settings > Calendar Settings
3. Find "Integrate calendar" section
4. Copy the public iCal URL

### 3. Company Configuration
Edit `/company-info/company.md` with your company details in Markdown format. This content will be used by the AI for company-specific responses.

### 4. Run Development Server
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
```

### 6. Preview Production Build
```bash
npm run preview
```

## 🏗 Project Structure

```
src/
├── components/          # React components
│   ├── CharacterDisplay.tsx    # 3D VRM character renderer
│   ├── ChatInput.tsx           # User input component
│   ├── ChatMessage.tsx         # Message display component
│   └── KnowledgeInput.tsx      # Knowledge base editor
├── services/            # Core services
│   ├── geminiService.ts        # Gemini API integration
│   ├── threeCharacter.ts       # 3D character management
│   ├── calendarService.ts      # Calendar integration
│   ├── companyWebSearch.ts     # Web search functionality
│   └── knowledgeLoader.ts      # Company knowledge loader
├── contexts/            # React contexts
│   └── LanguageContext.tsx     # Language management
├── api/                 # Netlify Functions
│   ├── gemini.ts               # Gemini API proxy
│   └── calendar.ts             # Calendar API proxy
└── company-info/        # Company knowledge base
    └── company.md              # Company information in Markdown
```

## 🎮 Usage

1. **Start Chatting**: Type your questions in the chat input
2. **Watch Emotions**: Observe how the 3D character's expression changes based on responses
3. **Language Toggle**: Switch between Japanese and English using the language selector
4. **Company Queries**: Ask about company information, events, or schedules
5. **Web Search**: Ask questions that trigger web searches for current information

## 🔧 Technical Details

### 3D Character System
- **VRM Loading**: Loads `.vrm` files with bone structure validation
- **Expression Mapping**: Maps AI emotions to 3D character expressions
- **Performance Optimization**: Direct bone manipulation without React re-renders

### AI Integration
- **Streaming Responses**: Real-time response streaming from Gemini
- **Context Management**: Maintains conversation history and company knowledge
- **Emotion Parsing**: Extracts emotion indicators from AI responses

### Calendar Integration
- **iCal Parsing**: Custom parser for Google Calendar iCal format
- **Encoding Handling**: Advanced UTF-8 support for Japanese content
- **Date Filtering**: Smart filtering for relevant upcoming events

### Web Search Proxy
- **Global Access**: Washington-based proxy for international search access
- **CORS Handling**: Seamless integration with client-side application
- **Search Integration**: Automatic web search triggered by specific keywords

## 🌍 Deployment

The application is configured for deployment on Netlify with:
- **Netlify Functions**: Server-side API proxies for Gemini and Calendar
- **Edge Network**: Global CDN distribution
- **Environment Variables**: Secure API key management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

© 2025 Cor.inc. All rights reserved.

## 🆘 Support

For issues or questions:
- Create an issue in the repository
- Contact: [Cor.inc Support](https://cor-jp.com/contact)
- Email: Contact via company website

---

*Last updated: June 2025*

## 🔗 Language Links

- [日本語版README](README_ja.md)
- [Company Website](https://cor-jp.com)