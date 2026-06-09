import { useState, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface Props {
  onSend: (message: string) => void;
  disabled: boolean;
  placeholder?: string;
}

const QUICK_PROMPTS = [
  'Plan a 5-day trip to Rajasthan in ₹25,000',
  'Kerala backwaters for 7 days, ₹40,000 for 2 people',
  'Goa beach trip 4 days, budget ₹20,000',
  'Himachal Pradesh adventure 10 days, ₹50,000',
];

export function InputArea({ onSend, disabled, placeholder }: Props) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  return (
    <div className="border-t border-gray-100 bg-white p-3">
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? 'Tell me where you want to go in India...'}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all min-h-[40px] max-h-[120px]"
        />
        <button
          type="submit"
          disabled={!input.trim() || disabled}
          className="shrink-0 w-10 h-10 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors shadow-sm"
        >
          {disabled ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>

      {!disabled && input.length === 0 && (
        <div className="flex gap-2 mt-2 overflow-x-auto pb-1 scrollbar-hide">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => onSend(prompt)}
              className="shrink-0 text-xs bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-full px-3 py-1 transition-colors whitespace-nowrap"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-1.5 text-center">
        Press Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
