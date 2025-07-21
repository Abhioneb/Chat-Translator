import { ButtonHTMLAttributes, ReactNode } from 'react';
export function Button({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      {...props}
      className="
        px-4 py-2 rounded
        bg-blue-600 text-white font-medium
        hover:bg-blue-700 active:bg-blue-800
        focus:outline-none focus:ring-2 focus:ring-blue-400
      "
    >
      {children}
    </button>
  );
}
