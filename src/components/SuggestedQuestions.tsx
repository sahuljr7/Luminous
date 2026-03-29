'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useAppStore } from '@/store';

interface Props {
  questions: string[];
}

export function SuggestedQuestions({ questions }: Props) {
  const { setActiveTab, addChatMessage, transcript, apiKey, chatMessages, setChatLoading } =
    useAppStore();

  const handleQuestion = async (q: string) => {
    if (!transcript || !apiKey) return;

    setActiveTab('chat');

    const userMsg = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: q,
      timestamp: Date.now(),
    };
    addChatMessage(userMsg);
    setChatLoading(true);

    const aiMsgId = (Date.now() + 1).toString();
    // Add empty AI message placeholder
    addChatMessage({
      id: aiMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    });

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: transcript.transcript,
          messages: chatMessages,
          question: q,
          apiKey,
        }),
      });

      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let answer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n').filter(Boolean);

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.chunk) {
              answer += parsed.chunk;
              // Update the AI message in place
              useAppStore.getState().chatMessages; // read
              useAppStore.setState((state) => ({
                chatMessages: state.chatMessages.map((m) =>
                  m.id === aiMsgId ? { ...m, content: answer } : m
                ),
              }));
            }
          } catch {
            // skip
          }
        }
      }
    } catch (err) {
      console.error(err);
      useAppStore.setState((state) => ({
        chatMessages: state.chatMessages.map((m) =>
          m.id === aiMsgId ? { ...m, content: 'Sorry, something went wrong.' } : m
        ),
      }));
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
        <Sparkles size={11} />
        Suggested:
      </span>
      {questions.map((q, i) => (
        <motion.button
          key={i}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 + i * 0.07 }}
          onClick={() => handleQuestion(q)}
          className="text-xs px-3 py-1.5 rounded-full transition-all duration-150 text-left"
          style={{
            background: 'var(--bg-card)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-subtle)',
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {q}
        </motion.button>
      ))}
    </div>
  );
}
