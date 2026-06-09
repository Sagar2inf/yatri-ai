export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-white border border-gray-200 text-gray-500 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1.5 max-w-[80px]">
        <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}
