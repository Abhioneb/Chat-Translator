// src/components/ui/ChatContainer.tsx
import { ReactNode } from 'react';
export function ChatContainer({ children }: { children: ReactNode }) {
  return (
    <div className="
      flex flex-col h-full bg-white dark:bg-gray-900
      rounded-lg shadow-lg overflow-hidden
    ">
      {children}
    </div>
  );
}
