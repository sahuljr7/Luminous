'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store';
import { Hero } from '@/components/Hero';
import { ApiKeyModal } from '@/components/ApiKeyModal';
import { ResultsPanel } from '@/components/ResultsPanel';
import { Navbar } from '@/components/Navbar';
import { AmbientOrbs } from '@/components/ui/AmbientOrbs';

export default function Home() {
  const { summary, transcript, theme } = useAppStore();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [theme]);

  const hasResults = !!(summary && transcript);

  return (
    <main className="relative min-h-screen grain overflow-x-hidden">
      <AmbientOrbs />
      <Navbar />
      <ApiKeyModal />

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {!hasResults ? (
            <motion.div
              key="hero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <Hero />
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ResultsPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
