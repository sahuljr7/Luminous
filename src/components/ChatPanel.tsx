'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Trash2, Bot, User, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store';
import type { ChatMessage } from '@/types';

interface Props {
  transcript: string;
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: 'var(--accent-glow)' }}
        >
          <Bot size={14} style={{ color: 'var(--accent-primary)' }} />
        </div>
      )}
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser ? 'rounded-tr-sm' : 'rounded-tl-sm'
        }`}
        style={
          isUser
            ? {
                background: 'var(--accent-primary)',
                color: '#13120e',
              }
            : {
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
              }
        }
      >
        {msg.content || (
          <span className="flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
            <Loader2 size={12} className="animate-spin" />
            Thinking…
          </span>
        )}
        {!msg.content && msg.role === 'assistant' && (
          <span className="typing-cursor" />
        )}
      </div>
      {isUser && (
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}
        >
          <User size={14} style={{ color: 'var(--text-muted)' }} />
        </div>
      )}
    </motion.div>
  );
}

export function ChatPanel({ transcript }: Props) {
  const { chatMessages, chatLoading, addChatMessage, setChatLoading, clearChat, apiKey } =
    useAppStore();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  const sendMessage = async () => {
    const q = input.trim();
    if (!q || chatLoading || !apiKey) return;

    setInput('');

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: q,
      timestamp: Date.now(),
    };
    addChatMessage(userMsg);
    setChatLoading(true);

    const aiMsgId = (Date.now() + 1).toString();
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
          transcript,
          messages: chatMessages.filter((m) => m.content),
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
              useAppStore.setState((state) => ({
                chatMessages: state.chatMessages.map((m) =>
                  m.id === aiMsgId ? { ...m, content: answer } : m
                ),
              }));
            }
            if (parsed.error) {
              useAppStore.setState((state) => ({
                chatMessages: state.chatMessages.map((m) =>
                  m.id === aiMsgId
                    ? { ...m, content: `Error: ${parsed.error}` }
                    : m
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
          m.id === aiMsgId
            ? { ...m, content: 'Sorry, something went wrong. Please try again.' }
            : m
        ),
      }));
    } finally {
      setChatLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 320px)', minHeight: '400px' }}>
      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto rounded-2xl p-4 space-y-4"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {chatMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--accent-glow)' }}
            >
              <Bot size={22} style={{ color: 'var(--accent-primary)' }} />
            </div>
            <div className="text-center">
              <p className="font-medium text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
                Ask anything about this video
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                All answers are grounded in the transcript
              </p>
            </div>
          </div>
        ) : (
          <>
            <AnimatePresence initial={false}>
              {chatMessages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} />
              ))}
            </AnimatePresence>
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input bar */}
      <div
        className="mt-3 flex gap-2 items-center rounded-2xl p-2"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Ask something about this video…"
          disabled={chatLoading}
          className="flex-1 bg-transparent outline-none text-sm px-3 py-2"
          style={{ color: 'var(--text-primary)' }}
        />
        {chatMessages.length > 0 && (
          <button
            onClick={clearChat}
            className="p-2 rounded-xl transition-colors"
            style={{ color: 'var(--text-muted)' }}
            title="Clear chat"
          >
            <Trash2 size={14} />
          </button>
        )}
        <button
          onClick={sendMessage}
          disabled={chatLoading || !input.trim()}
          className="btn-primary px-3 py-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
        >
          {chatLoading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Send size={15} />
          )}
        </button>
      </div>
    </div>
  );
}
