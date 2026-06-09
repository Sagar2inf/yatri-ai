import { MapPin, HelpCircle, CheckCircle2, RefreshCw, User, Bot } from 'lucide-react';
import type { ChatMessage } from '../../types/index.js';

interface Props {
  message: ChatMessage;
}

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
    .replace(/\n/g, '<br/>');
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';

  const typeIcon = () => {
    switch (message.type) {
      case 'clarification': return <HelpCircle className="w-3.5 h-3.5 text-amber-500" />;
      case 'itinerary': return <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />;
      case 'modification': return <RefreshCw className="w-3.5 h-3.5 text-blue-500" />;
      default: return null;
    }
  };

  const typeLabel = () => {
    switch (message.type) {
      case 'clarification': return 'Need more details';
      case 'itinerary': return 'Itinerary ready';
      case 'modification': return 'Updated';
      default: return null;
    }
  };

  if (isUser) {
    return (
      <div className="flex justify-end gap-2 items-end">
        <div className="bg-orange-500 text-white px-4 py-3 rounded-2xl rounded-br-none max-w-[80%] shadow-sm">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
        <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
          <User className="w-4 h-4 text-orange-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start gap-2 items-end">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shrink-0">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="max-w-[85%]">
        {message.type && message.type !== 'text' && (
          <div className="flex items-center gap-1 mb-1 ml-1">
            {typeIcon()}
            <span className="text-xs text-gray-500">{typeLabel()}</span>
          </div>
        )}
        <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm">
          {message.type === 'clarification' && message.questions ? (
            <div className="space-y-2">
              {message.questions.map((q, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <MapPin className="w-3.5 h-3.5 text-orange-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-gray-700">{q}</p>
                </div>
              ))}
            </div>
          ) : (
            <p
              className="text-sm text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
            />
          )}
        </div>
        <p className="text-xs text-gray-400 mt-1 ml-1">
          {new Date(message.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
