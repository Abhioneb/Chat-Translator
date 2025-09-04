// src/components/ui/ChatFooter.tsx
import { ReactNode } from 'react';

export default function ChatFooter({
  input,
  setInput,
  onSend,
}: {
  input: string;
  setInput: (val: string) => void;
  onSend: () => void;
}) {
  return (
    <footer className="flex items-center gap-2 px-4 py-3 border-t bg-gray-50 dark:bg-gray-800">
      <input
        className="flex-1 border rounded px-3 py-2"
        placeholder="Type your message…"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSend()}
      />
      <button
        onClick={onSend}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Send
      </button>
    </footer>
  );
}
