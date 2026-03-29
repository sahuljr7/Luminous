'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Youtube, ArrowRight, Sparkles, Zap, MessageSquare } from 'lucide-react';
import { useAppStore } from '@/store';
import { isValidYouTubeUrl, extractVideoId } from '@/lib/youtube';
import { LoadingState } from './ui/LoadingState';
import { ErrorState } from './ui/ErrorState';

const EXAMPLE_URLS = [
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://youtu.be/jNQXAC9IVRw',
  'https://www.youtube.com/watch?v=9bZkp7q19f0',
];

const FEATURES = [
  { icon: Sparkles, label: 'AI Summary', desc: 'Structured insights in seconds' },
  { icon: Zap, label: 'Key Terms', desc: 'Highlighted with ELI5 explanations' },
  { icon: MessageSquare, label: 'Ask Anything', desc: 'Chat grounded in the transcript' },
];

export function Hero() {
  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    apiKey,
    transcriptLoading,
    summaryLoading,
    transcriptError,
    summaryError,
    setCurrentUrl,
    setTranscript,
    setTranscriptLoading,
    setTranscriptError,
    setSummary,
    setSummaryLoading,
    setSummaryError,
    addToHistory,
  } = useAppStore();

  const isLoading = transcriptLoading || summaryLoading;
  const error = transcriptError || summaryError;

  const handleSubmit = async (inputUrl: string = url) => {
    const trimmed = inputUrl.trim();
    setUrlError('');
    setTranscriptError(null);
    setSummaryError(null);

    if (!trimmed) {
      setUrlError('Please enter a YouTube URL');
      inputRef.current?.focus();
      return;
    }

    if (!isValidYouTubeUrl(trimmed)) {
      setUrlError('Please enter a valid YouTube URL');
      return;
    }

    if (!apiKey) {
      // Dispatch event — ApiKeyModal will catch this and call back via window.__processVideo
      window.dispatchEvent(new CustomEvent('request-api-key', { detail: { url: trimmed } }));
      return;
    }

    setCurrentUrl(trimmed);
    await processVideo(trimmed, apiKey);
  };

  const processVideo = async (videoUrl: string, key: string) => {
    // Step 1: Fetch transcript
    setTranscriptLoading(true);
    setTranscript(null);
    setSummary(null);

    let transcriptData;
    try {
      const res = await fetch('/api/transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: videoUrl }),
      });
      const data = await res.json();

      if (!data.success) {
        setTranscriptError(data.error || 'Failed to fetch transcript');
        setTranscriptLoading(false);
        return;
      }

      transcriptData = data.data;
      setTranscript(transcriptData);
    } catch {
      setTranscriptError('Network error while fetching transcript. Please check your connection.');
      setTranscriptLoading(false);
      return;
    } finally {
      setTranscriptLoading(false);
    }

    // Step 2: Generate summary
    setSummaryLoading(true);
    try {
      const videoId = extractVideoId(videoUrl);
      const res = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: transcriptData.transcript,
          videoId,
          apiKey: key,
        }),
      });
      const data = await res.json();

      if (!data.success) {
        setSummaryError(data.error || 'Failed to generate summary');
        return;
      }

      setSummary(data.data);

      // Add to history
      addToHistory({
        videoId: transcriptData.videoId,
        url: videoUrl,
        title: data.data.title,
        savedAt: Date.now(),
        summary: data.data,
      });
    } catch {
      setSummaryError('Network error while generating summary. Please try again.');
    } finally {
      setSummaryLoading(false);
    }
  };

  // Expose processVideo so ApiKeyModal can trigger it after key is entered
  useEffect(() => {
    const windowWithCustom = window as unknown as Record<string, (videoUrl: string, key: string) => Promise<void>>;
    windowWithCustom.__processVideo = processVideo;
    return () => { delete windowWithCustom.__processVideo; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-16">
      {/* Headline */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl mx-auto mb-12"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="inline-flex items-center gap-2 tag mb-6 text-xs"
        >
          <Sparkles size={11} />
          Powered by Ollama · llama3.2
        </motion.div>

        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.08] mb-6" style={{ color: 'var(--text-primary)' }}>
          Understand any
          <br />
          <span className="gradient-text">YouTube video</span>
          <br />
          instantly.
        </h1>

        <p className="text-lg sm:text-xl leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Paste a link. Get a structured summary, key insights,<br className="hidden sm:block" />
          highlighted terms — and ask anything about the video.
        </p>
      </motion.div>

      {/* URL Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="w-full max-w-2xl mb-4"
      >
        <div
          className="relative rounded-2xl p-1.5"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div className="flex items-center gap-3 px-4 py-2">
            <Youtube size={20} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
            <input
              ref={inputRef}
              type="url"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setUrlError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSubmit()}
              placeholder="Paste a YouTube URL…"
              disabled={isLoading}
              className="flex-1 bg-transparent outline-none text-base"
              style={{ color: 'var(--text-primary)' }}
            />
            <button
              onClick={() => handleSubmit()}
              disabled={isLoading || !url.trim()}
              className="btn-primary flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  {transcriptLoading ? 'Fetching…' : 'Analyzing…'}
                </span>
              ) : (
                <>
                  Analyze
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>
        </div>

        {urlError && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm mt-2 ml-2"
            style={{ color: '#ef4444' }}
          >
            {urlError}
          </motion.p>
        )}
      </motion.div>

      {/* Loading state */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl mb-4"
        >
          <LoadingState
            stage={transcriptLoading ? 'transcript' : 'summary'}
          />
        </motion.div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl mb-4"
        >
          <ErrorState message={error} onRetry={() => handleSubmit()} />
        </motion.div>
      )}

      {/* Example URLs */}
      {!isLoading && !error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-2 mb-16"
        >
          <span className="text-xs" style={{ color: 'var(--text-placeholder)' }}>Try:</span>
          {EXAMPLE_URLS.map((exUrl, i) => (
            <button
              key={i}
              onClick={() => { setUrl(exUrl); handleSubmit(exUrl); }}
              className="text-xs px-3 py-1.5 rounded-full transition-all duration-150"
              style={{
                background: 'var(--bg-secondary)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              Example {i + 1}
            </button>
          ))}
        </motion.div>
      )}

      {/* Feature pills */}
      {!isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-4"
        >
          {FEATURES.map(({ icon: Icon, label, desc }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="card flex items-center gap-3 px-5 py-3.5"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--accent-glow)' }}
              >
                <Icon size={15} style={{ color: 'var(--accent-primary)' }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}
