import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode; // optional footer buttons
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  headerClassName?: string;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  '2xl': 'max-w-7xl',
  '3xl': 'max-w-9xl',
};

export function Dialog({ isOpen, onClose, title, children, actions, size = 'md', headerClassName }: DialogProps) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
    } else if (shouldRender) {
      // Start closing animation
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 250); // Match animate-fade-out duration
      return () => clearTimeout(timer);
    }
  }, [isOpen, shouldRender]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!shouldRender) return null;

  return createPortal(
    <div className="fixed inset-0 z-100000 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
        onClick={onClose}
      />
      {/* Modal panel */}
      <div
        className={`
          relative bg-card rounded-lg shadow-2xl w-full overflow-hidden ${sizeClasses[size]} max-h-[90vh] flex flex-col shadow-primary/10
          ${isClosing ? 'animate-zoom-out' : 'animate-zoom-in'}
        `}
      >
        {/* Header */}
        <div className={`flex justify-between items-center p-4 border-b border-border ${headerClassName || 'bg-primary text-white'}`}>
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded-md hover:bg-danger/10 hover:text-danger transition-all duration-200 group">
            <X size={18} className="group-hover:text-danger transition-colors text-white cursor-pointer" />
          </button>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
        {/* Footer actions (optional) */}
        {actions && <div className="p-4 border-t border-border flex justify-end gap-2">{actions}</div>}
    </div>
  </div>, document.body)
}