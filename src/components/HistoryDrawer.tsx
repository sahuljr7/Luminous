'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Trash2 } from 'lucide-react';
import { useAppStore } from '@/store';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function HistoryDrawer({ open, onClose }: Props) {
  const { history, clearHistory, setCurrentUrl, setTranscript, setSummary, clearChat } =
    useAppStore();

  const handleLoad = (item: (typeof history)[0]) => {
    setCurrentUrl(item.url);
    setTranscript({
      videoId: item.videoId,
      transcript: '',
      segments: [],
      fetchedAt: item.savedAt,
    });
    setSummary(item.summary);
    clearChat();
    onClose();
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.4)' }}
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-80 flex flex-col"
            style={{
              background: 'var(--bg-card)',
              borderLeft: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-5"
              style={{ borderBottom: '1px solid var(--border-subtle)' }}
            >
              <div className="flex items-center gap-2">
                <Clock size={16} style={{ color: 'var(--accent-primary)' }} />
                <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  History
                </span>
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{ background: 'var(--accent-glow)', color: 'var(--accent-primary)' }}
                >
                  {history.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {history.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="text-xs flex items-center gap-1 transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <Trash2 size={12} />
                    Clear
                  </button>
                )}
                <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {history.length === 0 ? (
                <div className="text-center py-12">
                  <Clock size={28} className="mx-auto mb-3" style={{ color: 'var(--text-placeholder)' }} />
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    No videos analyzed yet
                  </p>
                </div>
              ) : (
                history.map((item) => (
                  <motion.div
                    key={`${item.videoId}-${item.savedAt}`}
                    whileHover={{ scale: 1.01 }}
                    className="card card-hover p-3 cursor-pointer"
                    onClick={() => handleLoad(item)}
                  >
                    <div className="flex gap-3">
                      <img
                        src={`https://img.youtube.com/vi/${item.videoId}/mqdefault.jpg`}
                        alt=""
                        className="w-20 h-12 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-xs font-medium line-clamp-2 mb-1 leading-snug"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {item.title}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {formatDate(item.savedAt)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
