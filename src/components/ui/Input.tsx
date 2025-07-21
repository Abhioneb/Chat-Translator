// src/components/ui/Input.tsx
import { InputHTMLAttributes } from 'react';
export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="
        flex-1 px-3 py-2 border rounded
        focus:outline-none focus:ring-2 focus:ring-blue-400
        bg-gray-100 dark:bg-gray-700
      "
    />
  );
}
