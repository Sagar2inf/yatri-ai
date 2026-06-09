import { useEffect, useRef, useState, useCallback } from 'react';
import { Bot, Trash2, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { useAppStore } from '../../store/index.js';
import { sendMessageStream } from '../../services/api.js';
import { MessageBubble } from './MessageBubble.js';
import { StreamingMessage } from './StreamingMessage.js';
import { InputArea } from './InputArea.js';

export function ChatInterface() {
  const {
    messages,
    isLoading,
    error,
    itinerary,
    setLoading,
    setError,
    addMessage,
    handleLLMResponse,
    reset,
  } = useAppStore();

  const [streamTokens, setStreamTokens] = useState('');
  const [streamDone, setStreamDone] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, streamTokens]);

  const handleSend = useCallback((text: string) => {
    if (isLoading) return;

    addMessage({ role: 'user', content: text, timestamp: Date.now(), type: 'text' });
    setLoading(true);
    setError(null);
    setStreamTokens('');
    setStreamDone(false);

    const abort = sendMessageStream(text, {
      onToken: (token) => {
        setStreamTokens((prev) => prev + token);
      },
      onComplete: (response) => {
        setStreamDone(true);
        setStreamTokens('');
        handleLLMResponse(response);
        setLoading(false);
      },
      onError: (errMsg) => {
        setStreamTokens('');
        setStreamDone(true);
        setError(errMsg);
        addMessage({
          role: 'assistant',
          content: `Sorry, something went wrong: ${errMsg}`,
          timestamp: Date.now(),
          type: 'text',
        });
        setLoading(false);
      },
    });

    abortRef.current = abort;
  }, [isLoading, addMessage, setLoading, setError, handleLLMResponse]);

  const handleCancel = () => {
    abortRef.current?.();
    abortRef.current = null;
    setLoading(false);
    setStreamTokens('');
    addMessage({
      role: 'assistant',
      content: 'Request cancelled. Ask me anything!',
      timestamp: Date.now(),
      type: 'text',
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 shadow-sm shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-800">YatraAI</h1>
            <p className="text-xs text-gray-500">India Travel Planner</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-orange-600 animate-pulse font-medium">Generating...</span>
              <button
                onClick={handleCancel}
                className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 rounded-lg px-2 py-0.5 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-green-600">
              <Wifi className="w-3 h-3" />
              <span className="text-[10px]">Ready</span>
            </div>
          )}
          {itinerary && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200">
              ✓ Itinerary
            </span>
          )}
          <button
            onClick={reset}
            title="Start new trip"
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && !isLoading && (
        <div className="mx-3 mt-2 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 shrink-0">
          <WifiOff className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-red-700">Error</p>
            <p className="text-xs text-red-600 mt-0.5 break-words">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 shrink-0 ml-1">
            <AlertCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* Live streaming bubble */}
        {isLoading && (
          <StreamingMessage tokens={streamTokens} isDone={streamDone} />
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <InputArea
        onSend={handleSend}
        disabled={isLoading}
        placeholder={
          itinerary
            ? 'Ask anything about your itinerary or request changes...'
            : 'Tell me where you want to go in India...'
        }
      />
    </div>
  );
}
