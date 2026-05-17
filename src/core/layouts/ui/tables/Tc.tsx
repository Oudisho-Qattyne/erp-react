// src/components/ui/Tc.tsx
import React from 'react';

interface TcProps {
  children: React.ReactNode;
  bold?: boolean;
  mono?: boolean;
  color?: string; // optional custom color (Tailwind class like 'text-danger')
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export function Tc({
  children,
  bold = false,
  mono = false,
  color,
  align = 'right',
  className = '',
}: TcProps) {
  return (
    <td
      className={`
        py-2 px-2 text-sm
        ${bold ? 'font-semibold' : 'font-normal'}
        ${mono ? 'font-mono' : ''}
        ${color || 'text-text'}
        text-${align}
        ${className}
      `}
    >
      {children}
    </td>
  );
}