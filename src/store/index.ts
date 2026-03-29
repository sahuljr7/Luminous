import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AppState,
  TranscriptData,
  SummaryData,
  ChatMessage,
  HistoryItem,
} from '@/types';

export const useAppStore = create<AppState>()(
  persist(
    (set, _get) => ({
      // API Key
      apiKey: null,
      setApiKey: (key: string) => set({ apiKey: key }),

      // Video
      currentUrl: '',
      currentVideoId: null,
      setCurrentUrl: (url: string) => {
        const videoId = extractVideoId(url);
        set({ currentUrl: url, currentVideoId: videoId });
      },

      // Transcript
      transcript: null,
      transcriptLoading: false,
      transcriptError: null,
      setTranscript: (data: TranscriptData | null) => set({ transcript: data }),
      setTranscriptLoading: (loading: boolean) => set({ transcriptLoading: loading }),
      setTranscriptError: (error: string | null) => set({ transcriptError: error }),

      // Summary
      summary: null,
      summaryLoading: false,
      summaryError: null,
      setSummary: (data: SummaryData | null) => set({ summary: data }),
      setSummaryLoading: (loading: boolean) => set({ summaryLoading: loading }),
      setSummaryError: (error: string | null) => set({ summaryError: error }),

      // Chat
      chatMessages: [],
      chatLoading: false,
      addChatMessage: (message: ChatMessage) =>
        set((state) => ({ chatMessages: [...state.chatMessages, message] })),
      setChatLoading: (loading: boolean) => set({ chatLoading: loading }),
      clearChat: () => set({ chatMessages: [] }),

      // UI
      activeTab: 'summary',
      theme: 'dark',
      setActiveTab: (tab) => set({ activeTab: tab }),
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

      // History
      history: [],
      addToHistory: (item: HistoryItem) =>
        set((state) => {
          const filtered = state.history.filter((h) => h.videoId !== item.videoId);
          return { history: [item, ...filtered].slice(0, 20) };
        }),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'yt-summarizer-store',
      partialize: (state) => ({
        apiKey: state.apiKey,
        history: state.history,
        theme: state.theme,
      }),
    }
  )
);

function extractVideoId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}
