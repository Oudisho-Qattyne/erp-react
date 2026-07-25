import { ArrowLeft, MoreVertical } from 'lucide-react';
import type { Contact } from '../data/dummyChats';

interface ChatHeaderProps {
  contact: Contact;
  onBack: () => void;
}

export function ChatHeader({ contact, onBack }: ChatHeaderProps) {
  return (
    <div className="px-4 py-2.5 border-b border-border flex items-center gap-3 bg-background shrink-0">
      <button
        type="button"
        onClick={onBack}
        className="md:hidden p-1 hover:bg-primary-light rounded-md cursor-pointer"
      >
        <ArrowLeft size={18} />
      </button>
      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
        {contact.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm">{contact.name}</div>
        <div className="text-xs text-text-muted">
          {contact.online ? 'متصل الآن' : 'غير متصل'}
        </div>
      </div>
      <button type="button" className="p-1.5 hover:bg-primary-light rounded-md cursor-pointer">
        <MoreVertical size={16} />
      </button>
    </div>
  );
}
