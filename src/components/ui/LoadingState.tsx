'use client';

import { motion } from 'framer-motion';

interface Props {
  stage: 'transcript' | 'summary';
}

const STAGES = {
  transcript: {
    label: 'Fetching transcript…',
    sub: 'Extracting captions from YouTube',
    progress: 35,
  },
  summary: {
    label: 'Analyzing with AI…',
    sub: 'Generating summary, insights & key terms',
    progress: 75,
  },
};

export function LoadingState({ stage }: Props) {
  const info = STAGES[stage];

  return (
    <div className="card p-5">
      <div className="flex items-center gap-4">
        <div className="relative w-10 h-10 flex-shrink-0">
          <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18" cy="18" r="15"
              fill="none"
              stroke="var(--bg-secondary)"
              strokeWidth="3"
            />
            <motion.circle
              cx="18" cy="18" r="15"
              fill="none"
              stroke="var(--accent-primary)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 15}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 15 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 15 * (1 - info.progress / 100) }}
              transition={{ duration: 1.5, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }}
            />
          </svg>
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm mb-0.5" style={{ color: 'var(--text-primary)' }}>
            {info.label}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {info.sub}
          </p>
        </div>
      </div>

      {/* Skeleton lines */}
      <div className="mt-5 space-y-2.5">
        {[100, 90, 80, 70].map((w, i) => (
          <div
            key={i}
            className="skeleton h-3 rounded"
            style={{ width: `${w}%`, animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
