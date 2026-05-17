// src/components/ui/Tb.tsx
import React from 'react';

interface TbProps {
  children: React.ReactNode;
}

export function Tb({ children }: TbProps) {
  return (
    <table className="min-w-full w-max border-collapse rtl:text-right ltr:text-left">
      {children}
    </table>
  );
}