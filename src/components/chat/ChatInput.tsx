'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Mic, Sparkles, X } from 'lucide-react';
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
  const [showSuggestions, setShowSuggestions] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
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
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-3">
      {/* Suggestions */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && !input && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-wrap gap-2"
          >
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onSuggestionClick(suggestion)}
                className="px-3 py-1.5 text-xs font-medium bg-white border border-stone-200 hover:border-stone-400 hover:shadow-sm rounded-full transition-all"
              >
                <Sparkles size={12} className="inline mr-1.5 text-indigo-500" />
                {suggestion}
              </motion.button>
            ))}
            <button
              onClick={() => setShowSuggestions(false)}
              className="p-1.5 text-stone-400 hover:text-stone-600"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Container */}
      <div className="relative bg-white rounded-2xl border border-stone-200 shadow-lg shadow-stone-200/50 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-300 transition-all">
        <div className="flex items-end gap-2 p-3">
          {/* Attach Button */}
          <button className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-xl transition-colors">
            <Paperclip size={20} />
          </button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Lark anything about your customers..."
            rows={1}
            className="flex-1 py-2.5 px-2 bg-transparent border-none focus:outline-none resize-none text-stone-900 placeholder:text-stone-400 min-h-[44px] max-h-[120px]"
          />

          {/* Voice & Send */}
          <div className="flex items-center gap-1">
            <button className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-xl transition-colors">
              <Mic size={20} />
            </button>
            <motion.button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'p-2.5 rounded-xl transition-all',
                input.trim()
                  ? 'bg-stone-900 text-white shadow-lg shadow-stone-900/20'
                  : 'bg-stone-100 text-stone-400 cursor-not-allowed'
              )}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </motion.button>
          </div>
        </div>

        {/* Keyboard hint */}
        <div className="absolute -bottom-6 left-0 right-0 flex justify-center">
          <span className="text-[10px] text-stone-400">
            Press <kbd className="px-1 py-0.5 bg-stone-100 rounded text-stone-600">Enter</kbd> to send
          </span>
        </div>
      </div>
    </div>
  );
}
