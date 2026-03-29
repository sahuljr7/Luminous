'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, BookOpen } from 'lucide-react';
import type { KeyTerm } from '@/types';

interface Props {
  terms: KeyTerm[];
}

function TermCard({ term, index }: { term: KeyTerm; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="card card-hover overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span
            className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold font-mono"
            style={{
              background: 'var(--accent-glow)',
              color: 'var(--accent-primary)',
              border: '1px solid rgba(217, 119, 6, 0.2)',
            }}
          >
            {term.term}
          </span>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
        </motion.div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div
              className="px-4 pb-4 pt-0 space-y-3"
              style={{ borderTop: '1px solid var(--border-subtle)' }}
            >
              <div className="pt-3">
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                  Simple Explanation
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {term.explanation}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                  In this video
                </p>
                <p
                  className="text-sm leading-relaxed p-3 rounded-lg"
                  style={{
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-secondary)',
                    borderLeft: '3px solid var(--accent-primary)',
                  }}
                >
                  {term.context}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function KeyTermsSection({ terms }: Props) {
  if (!terms || terms.length === 0) {
    return (
      <div className="card p-12 text-center">
        <BookOpen size={32} className="mx-auto mb-3" style={{ color: 'var(--text-placeholder)' }} />
        <p style={{ color: 'var(--text-muted)' }}>No key terms were identified for this video.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {terms.length} terms identified · Click to expand
        </p>
      </div>
      <div className="grid gap-2.5">
        {terms.map((term, i) => (
          <TermCard key={term.term} term={term} index={i} />
        ))}
      </div>
    </div>
  );
}
