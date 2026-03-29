# 🌟 Luminous — YouTube AI Summarizer

A production-ready Next.js 14+ application that transforms any YouTube video into an AI-powered summary and interactive Q&A experience.

![Luminous Screenshot](public/screenshot.png)

## ✨ Features

- **Transcript Extraction** — Fetches captions from any YouTube video (with graceful fallback)
- **AI Summary** — Structured title, overview, bullet-point summary, and key insights
- **Key Terms** — Highlighted concepts with ELI5 explanations and video context
- **Suggested Questions** — 3 auto-generated follow-up questions as clickable chips
- **Ask AI (Chat)** — Streaming chat grounded exclusively in the video transcript
- **History** — Saves last 20 analyzed videos locally
- **Copy Summary / Download PDF** — Export your summaries
- **Dark / Light Mode** — Persistent theme toggle
- **Responsive** — Mobile-first design

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| State | Zustand (with persistence) |
| AI | Ollama API (llama3.2) |
| Transcript | youtube-transcript |
| PDF | html2pdf.js |

## 🚀 Quick Start

### 1. Clone / Extract the project

```bash
cd yt-summarizer
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
OLLAMA_API_KEY=your_ollama_api_key_here
OLLAMA_BASE_URL=https://api.ollama.com
OLLAMA_MODEL=llama3.2
TRANSCRIPT_CACHE_TTL=3600
```

> **Note:** If `OLLAMA_API_KEY` is set server-side, users won't need to enter it. Without it, the app will prompt users to enter their own key.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Build for production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── transcript/route.ts   # Fetch YouTube transcript
│   │   ├── summary/route.ts      # Generate AI summary
│   │   └── chat/route.ts         # Streaming chat API
│   ├── globals.css               # Design system + CSS variables
│   ├── layout.tsx                # Root layout + fonts
│   └── page.tsx                  # Main page
├── components/
│   ├── ui/
│   │   ├── AmbientOrbs.tsx       # Background decoration
│   │   ├── LoadingState.tsx      # Animated loading skeleton
│   │   └── ErrorState.tsx        # Error display
│   ├── Navbar.tsx                # Top navigation
│   ├── Hero.tsx                  # URL input + landing
│   ├── ApiKeyModal.tsx           # API key entry modal
│   ├── ResultsPanel.tsx          # Tab container for results
│   ├── VideoHeader.tsx           # Video info + actions
│   ├── SummaryCard.tsx           # Overview + details + insights
│   ├── KeyTermsSection.tsx       # Expandable key terms
│   ├── SuggestedQuestions.tsx    # Question chips
│   ├── ChatPanel.tsx             # Streaming chat interface
│   ├── HistoryDrawer.tsx         # Slide-out history
│   └── ThemeProvider.tsx         # Dark/light mode
├── lib/
│   ├── ollama.ts                 # Ollama API client + prompts
│   └── youtube.ts                # URL parsing + utilities
├── store/
│   └── index.ts                  # Zustand global state
└── types/
    └── index.ts                  # TypeScript interfaces
```

## 🔑 API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/transcript` | POST | Fetch transcript from YouTube URL |
| `/api/summary` | POST | Generate structured summary via Ollama |
| `/api/chat` | POST | Streaming chat grounded in transcript |

## 🎨 Design System

The app uses CSS custom properties for theming, supporting both light and dark modes:

- **Background:** Warm parchment tones (`#f7f5f0` light / `#13120e` dark)
- **Accent:** Amber gold (`#f59e0b`)
- **Secondary accent:** Sage green (`#4d7d5e`)
- **Typography:** Playfair Display (headings) + DM Sans (body)
- **Effects:** Grain texture, ambient orbs, glassmorphism

## 🔧 Configuration

### Changing the AI Model

Edit `OLLAMA_MODEL` in `.env.local` to use any model available on your Ollama instance:
- `llama3.2` (default, recommended)
- `llama3.1`
- `mistral`
- `codellama`

### Transcript Caching

Transcripts are cached in-memory for 1 hour by default. Increase `TRANSCRIPT_CACHE_TTL` for longer caching, or implement Redis for production:

```typescript
// src/app/api/transcript/route.ts
// Replace transcriptCache Map with Redis client
```

### Long Videos

Videos with very long transcripts are automatically truncated to 15,000 characters for AI processing. The transcript is still stored in full. Adjust `truncateTranscript()` in `src/lib/youtube.ts` if needed.

## 🐛 Troubleshooting

**"No transcript available"**
- Video has captions disabled or is private
- Try a video that has auto-generated captions enabled

**"Invalid API key"**
- Verify your Ollama API key at https://ollama.com
- Ensure the key is correctly set in `.env.local`

**"Model not found"**
- Verify the model name in `OLLAMA_MODEL`
- Make sure the model is available on your Ollama instance

## 📄 License

MIT
