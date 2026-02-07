'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  onSend: (message: string) => void;
  isLoading?: boolean;
}

export function ChatInput({
  suggestions,
  onSuggestionClick,
  onSend,
  isLoading,
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSend(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {suggestions.length > 0 && !input && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex flex-wrap gap-2"
          >
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.04 }}
                onClick={() => onSuggestionClick(suggestion)}
                className="px-3 py-1.5 text-xs text-stone-500 bg-stone-50 hover:bg-stone-100 border border-stone-150 hover:border-stone-200 rounded-lg transition-colors"
              >
                {suggestion}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative bg-white rounded-xl border border-stone-200 focus-within:border-stone-300 transition-colors">
        <div className="flex items-end gap-2 p-2 pl-4">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Lark anything..."
            rows={1}
            className="flex-1 py-2 bg-transparent border-none focus:outline-none resize-none text-sm text-stone-900 placeholder:text-stone-400 min-h-[40px] max-h-[120px]"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={cn(
              'p-2 rounded-lg transition-colors shrink-0',
              input.trim()
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-300'
            )}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <ArrowUp size={16} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
