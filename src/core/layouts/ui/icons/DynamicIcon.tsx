'use client';

import * as Icons from 'lucide-react';

interface DynamicIconProps {
  name: string;
  size?: number;
  className?: string;
  fill?: string;
}

export function DynamicIcon({ name, size = 18, className = '', fill }: DynamicIconProps) {
  // If it's an emoji (not a valid icon name), just render it as text
  if (!name || name.length <= 2) {
    return <span className={className}>{name}</span>;
  }

  const IconComponent = (Icons as any)[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in lucide-react`);
    return <Icons.HelpCircle size={size} className={className} />;
  }

  return <IconComponent size={size} className={className} fill={fill} />;
}
