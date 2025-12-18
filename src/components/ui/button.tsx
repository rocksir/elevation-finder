import React from 'react';

export const buttonVariants = (variant = 'default') => `btn-${variant}`;

export function Button({ children, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`px-3 py-2 rounded bg-sky-600 text-white ${className}`} {...props}>
      {children}
    </button>
  );
}
