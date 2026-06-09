import { useEffect, useState } from 'react';
import { Bot } from 'lucide-react';

interface Props {
  tokens: string;
  isDone: boolean;
}

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 rounded text-xs font-mono">$1</code>')
    .replace(/\n/g, '<br/>');
}

const PHASE_LABELS = [
  'Thinking about your trip...',
  'Researching routes and transport...',
  'Finding hotels and stays...',
  'Planning day-by-day activities...',
  'Calculating budget breakdown...',
  'Adding food recommendations...',
  'Almost done...',
];

export function StreamingMessage({ tokens, isDone }: Props) {
  const [phaseIdx, setPhaseIdx] = useState(0);

  useEffect(() => {
    if (isDone || tokens.length > 0) return;
    const id = setInterval(() => {
      setPhaseIdx((i) => (i + 1) % PHASE_LABELS.length);
    }, 2200);
    return () => clearInterval(id);
  }, [isDone, tokens]);

  const isJson = tokens.trim().startsWith('{');

  return (
    <div className="flex justify-start gap-2 items-end">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="max-w-[85%] bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm">
        {tokens.length === 0 ? (
          <div className="flex items-center gap-2">
            <span className="flex gap-0.5">
              <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </span>
            <span className="text-xs text-gray-500 animate-pulse">
              {PHASE_LABELS[phaseIdx]}
            </span>
          </div>
        ) : isJson ? (
          <div className="flex items-center gap-2">
            <span className="flex gap-0.5">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </span>
            <span className="text-xs text-gray-500">
              Building your itinerary... ({Math.round(tokens.length / 100) * 100}+ chars)
            </span>
          </div>
        ) : (
          <p
            className="text-sm text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: renderMarkdown(tokens) + (!isDone ? '<span class="inline-block w-0.5 h-4 bg-gray-400 ml-0.5 animate-pulse align-middle"></span>' : ''),
            }}
          />
        )}
      </div>
    </div>
  );
}
