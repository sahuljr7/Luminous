'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, X, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { useAppStore } from '@/store';

export function ApiKeyModal() {
  const { apiKey, setApiKey } = useAppStore();
  const [open, setOpen] = useState(false);
  const [inputKey, setInputKey] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [pendingUrl, setPendingUrl] = useState('');

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setPendingUrl(detail?.url || '');
      setOpen(true);
    };
    window.addEventListener('request-api-key', handler);
    return () => window.removeEventListener('request-api-key', handler);
  }, []);

  // Pre-fill if key exists
  useEffect(() => {
    if (apiKey) setInputKey(apiKey);
  }, [apiKey]);

  const handleSave = async () => {
    const trimmed = inputKey.trim();
    if (!trimmed) {
      setError('Please enter your API key');
      return;
    }
    setError('');
    setApiKey(trimmed);
    setOpen(false);

    // Trigger video processing if there was a pending URL
    if (pendingUrl && (window as any).__processVideo) {
      await (window as any).__processVideo(pendingUrl, trimmed);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
            onClick={(e) => e.target === e.currentTarget && setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2 }}
              className="card w-full max-w-md p-6"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-glow)' }}>
                    <Key size={18} style={{ color: 'var(--accent-primary)' }} />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Ollama API Key
                    </h2>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Required to generate summaries
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Input */}
              <div className="relative mb-3">
                <input
                  type={show ? 'text' : 'password'}
                  value={inputKey}
                  onChange={(e) => { setInputKey(e.target.value); setError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  placeholder="Enter your Ollama API key…"
                  className="input-base pr-12"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {error && (
                <p className="text-xs mb-3" style={{ color: '#ef4444' }}>{error}</p>
              )}

              <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>
                Your key is stored locally in your browser and never sent to any server except Ollama's API.{' '}
                <a
                  href="https://ollama.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  Get a key <ExternalLink size={10} />
                </a>
              </p>

              {/* Actions */}
              <div className="flex gap-2">
                <button onClick={() => setOpen(false)} className="btn-ghost flex-1">
                  Cancel
                </button>
                <button onClick={handleSave} className="btn-primary flex-1 justify-center">
                  Save & Continue
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
