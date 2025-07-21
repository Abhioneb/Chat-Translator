// src/components/ui/ChatFooter.tsx
import { ReactNode } from 'react';
export function ChatFooter({ children }: { children: ReactNode }) {
  return (
    <footer className="
      flex items-center gap-2 px-4 py-3
      border-t bg-gray-50 dark:bg-gray-800
    ">
      {children}
    </footer>
  );
}
