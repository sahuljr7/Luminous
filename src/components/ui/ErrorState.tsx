'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card p-5"
      style={{ borderColor: 'rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.04)' }}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(239,68,68,0.1)' }}>
          <AlertTriangle size={16} style={{ color: '#ef4444' }} />
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
            Something went wrong
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {message}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 flex items-center gap-1.5 text-xs font-medium transition-colors"
              style={{ color: '#ef4444' }}
            >
              <RefreshCw size={12} />
              Try again
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
