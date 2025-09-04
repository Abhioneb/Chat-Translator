// src/components/ui/ChatHeader.tsx
import { ReactNode } from 'react';

export default function ChatHeader({ roomName }: { roomName: string }) {
  return (
    <header className="flex items-center justify-between px-4 py-2 border-b bg-gray-50 dark:bg-gray-800">
      <h2 className="text-lg font-semibold">Room: {roomName}</h2>
    </header>
  );
}
