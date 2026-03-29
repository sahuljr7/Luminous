'use client';

import { motion } from 'framer-motion';
import { Lightbulb, AlignLeft, CheckCircle2 } from 'lucide-react';
import type { SummaryData } from '@/types';

interface Props {
  summary: SummaryData;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export function SummaryCard({ summary }: Props) {
  return (
    <div id="summary-content">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4"
      >
        {/* Overview */}
        <motion.div variants={item} className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-glow)' }}>
              <AlignLeft size={14} style={{ color: 'var(--accent-primary)' }} />
            </div>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Overview</h3>
          </div>
          <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {summary.overview}
          </p>
        </motion.div>

        {/* Detailed Summary */}
        <motion.div variants={item} className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-glow)' }}>
              <CheckCircle2 size={14} style={{ color: 'var(--accent-primary)' }} />
            </div>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Detailed Summary</h3>
          </div>
          <ul className="space-y-3">
            {summary.detailedSummary.map((point, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="flex gap-3 text-sm leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}
              >
                <span
                  className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
                  style={{ background: 'var(--accent-glow)', color: 'var(--accent-primary)' }}
                >
                  {i + 1}
                </span>
                {point}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Key Insights */}
        <motion.div variants={item} className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(107, 154, 123, 0.15)' }}>
              <Lightbulb size={14} style={{ color: 'var(--accent-sage)' }} />
            </div>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Key Insights</h3>
          </div>
          <div className="grid gap-2.5">
            {summary.keyInsights.map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="flex gap-3 p-3 rounded-xl text-sm"
                style={{
                  background: 'rgba(107, 154, 123, 0.07)',
                  border: '1px solid rgba(107, 154, 123, 0.15)',
                  color: 'var(--text-secondary)',
                }}
              >
                <span style={{ color: 'var(--accent-sage)' }}>✦</span>
                {insight}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
