// src/components/chat/MessageBubble.tsx
import { ReactNode } from 'react';

type Message = {
  original: string;
  translated: string;
  sender: 'user' | 'bot';
};

export default function MessageBubble({ message }: { message: Message }) {
  const isUser = message.sender === 'user';
  return (
    <div className={`flex my-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`
        max-w-xs px-4 py-2 rounded-xl shadow
        ${isUser
          ? 'bg-blue-600 text-white'
          : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white'}
      `}>
        <div className="text-sm italic opacity-75">{message.original}</div>
        <div className="mt-1">{message.translated}</div>
      </div>
    </div>
  );
}
