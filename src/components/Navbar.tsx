'use client';

import { motion } from 'framer-motion';
import { Sun, Moon, History, Key, RotateCcw } from 'lucide-react';
import { useAppStore } from '@/store';
import { useState } from 'react';
import { HistoryDrawer } from './HistoryDrawer';

export function Navbar() {
  const { theme, toggleTheme, summary, setCurrentUrl, setSummary, setTranscript, clearChat, apiKey } = useAppStore();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [showKeyHint, setShowKeyHint] = useState(false);

  const handleReset = () => {
    setCurrentUrl('');
    setSummary(null);
    setTranscript(null);
    clearChat();
  };

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button onClick={handleReset} className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-primary)' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1L9 5.5H13.5L9.75 8.5L11.5 13L7 10L2.5 13L4.25 8.5L0.5 5.5H5L7 1Z" fill="#13120e" />
                </svg>
              </div>
              <span className="font-display text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Luminous
              </span>
            </button>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {summary && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={handleReset}
                  className="btn-ghost text-xs gap-1.5"
                >
                  <RotateCcw size={13} />
                  New Video
                </motion.button>
              )}

              <button
                onClick={() => setHistoryOpen(true)}
                className="btn-ghost"
                title="History"
              >
                <History size={15} />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowKeyHint(!showKeyHint)}
                  className="btn-ghost"
                  title="API Key"
                >
                  <Key size={15} />
                  {apiKey && (
                    <span className="w-1.5 h-1.5 rounded-full absolute top-1.5 right-1.5" style={{ background: 'var(--accent-sage)' }} />
                  )}
                </button>
                {showKeyHint && (
                  <div className="absolute right-0 top-12 card p-3 text-xs w-56 z-50" style={{ color: 'var(--text-muted)' }}>
                    {apiKey
                      ? <span style={{ color: 'var(--accent-sage)' }}>✓ API key configured</span>
                      : 'No API key set. Enter a URL to be prompted.'}
                  </div>
                )}
              </div>

              <button
                onClick={toggleTheme}
                className="btn-ghost"
                title="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      <HistoryDrawer open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </>
  );
}
