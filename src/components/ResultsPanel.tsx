'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/store';
import { SummaryCard } from './SummaryCard';
import { KeyTermsSection } from './KeyTermsSection';
import { ChatPanel } from './ChatPanel';
import { VideoHeader } from './VideoHeader';
import { SuggestedQuestions } from './SuggestedQuestions';
import { FileText, BookOpen, MessageSquare } from 'lucide-react';

const TABS = [
  { id: 'summary' as const, label: 'Summary', icon: FileText },
  { id: 'terms' as const, label: 'Key Terms', icon: BookOpen },
  { id: 'chat' as const, label: 'Ask AI', icon: MessageSquare },
];

export function ResultsPanel() {
  const { activeTab, setActiveTab, summary, transcript } = useAppStore();

  if (!summary || !transcript) return null;

  return (
    <div className="min-h-screen pt-20 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Video header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <VideoHeader />
        </motion.div>

        {/* Suggested questions */}
        {summary.suggestedQuestions?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="mt-4"
          >
            <SuggestedQuestions questions={summary.suggestedQuestions} />
          </motion.div>
        )}

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex gap-1 mt-6 p-1 rounded-2xl w-fit"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}
        >
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
              style={{ color: activeTab === id ? 'var(--text-primary)' : 'var(--text-muted)' }}
            >
              {activeTab === id && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-sm)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Icon size={14} />
                {label}
              </span>
            </button>
          ))}
        </motion.div>

        {/* Tab content */}
        <div className="mt-5">
          {activeTab === 'summary' && <SummaryCard summary={summary} />}
          {activeTab === 'terms' && <KeyTermsSection terms={summary.keyTerms} />}
          {activeTab === 'chat' && <ChatPanel transcript={transcript.transcript} />}
        </div>
      </div>
    </div>
  );
}
