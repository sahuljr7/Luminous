// Core types for the YT Summarizer application

export interface VideoInfo {
  videoId: string;
  url: string;
}

export interface TranscriptSegment {
  text: string;
  duration: number;
  offset: number;
}

export interface TranscriptData {
  videoId: string;
  transcript: string;
  segments: TranscriptSegment[];
  fetchedAt: number;
}

export interface KeyTerm {
  term: string;
  explanation: string;
  context: string;
}

export interface SummaryData {
  title: string;
  overview: string;
  detailedSummary: string[];
  keyInsights: string[];
  keyTerms: KeyTerm[];
  suggestedQuestions: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface AppState {
  // API Key
  apiKey: string | null;
  setApiKey: (key: string) => void;

  // Video
  currentUrl: string;
  currentVideoId: string | null;
  setCurrentUrl: (url: string) => void;

  // Transcript
  transcript: TranscriptData | null;
  transcriptLoading: boolean;
  transcriptError: string | null;
  setTranscript: (data: TranscriptData | null) => void;
  setTranscriptLoading: (loading: boolean) => void;
  setTranscriptError: (error: string | null) => void;

  // Summary
  summary: SummaryData | null;
  summaryLoading: boolean;
  summaryError: string | null;
  setSummary: (data: SummaryData | null) => void;
  setSummaryLoading: (loading: boolean) => void;
  setSummaryError: (error: string | null) => void;

  // Chat
  chatMessages: ChatMessage[];
  chatLoading: boolean;
  addChatMessage: (message: ChatMessage) => void;
  setChatLoading: (loading: boolean) => void;
  clearChat: () => void;

  // UI
  activeTab: 'summary' | 'terms' | 'chat';
  theme: 'light' | 'dark';
  setActiveTab: (tab: 'summary' | 'terms' | 'chat') => void;
  toggleTheme: () => void;

  // History
  history: HistoryItem[];
  addToHistory: (item: HistoryItem) => void;
  clearHistory: () => void;
}

export interface HistoryItem {
  videoId: string;
  url: string;
  title: string;
  savedAt: number;
  summary: SummaryData;
}

// API Request/Response types
export interface TranscriptRequest {
  url: string;
}

export interface TranscriptResponse {
  success: boolean;
  data?: TranscriptData;
  error?: string;
}

export interface SummaryRequest {
  transcript: string;
  videoId: string;
  apiKey: string;
}

export interface SummaryResponse {
  success: boolean;
  data?: SummaryData;
  error?: string;
}

export interface ChatRequest {
  transcript: string;
  messages: ChatMessage[];
  question: string;
  apiKey: string;
}

export interface ChatResponse {
  success: boolean;
  answer?: string;
  error?: string;
}

export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OllamaChatRequest {
  model: string;
  messages: OllamaMessage[];
  stream?: boolean;
}
