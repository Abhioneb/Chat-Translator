// src/components/ui/ChatHeader.tsx
import { ReactNode } from 'react';
export function ChatHeader({ children }: { children: ReactNode }) {
  return (
    <header className="
      flex items-center justify-between px-4 py-2
      border-b bg-gray-50 dark:bg-gray-800
    ">
      {children}
    </header>
  );
}
