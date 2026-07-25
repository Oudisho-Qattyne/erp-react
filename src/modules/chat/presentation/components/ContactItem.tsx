import type { Contact } from '../data/dummyChats';

interface ContactItemProps {
  contact: Contact;
  isSelected: boolean;
  onSelect: (contact: Contact) => void;
}

export function ContactItem({ contact, isSelected, onSelect }: ContactItemProps) {
  return (
    <button
      onClick={() => onSelect(contact)}
      className={`w-full text-right px-3 py-3 flex items-center gap-3 hover:bg-primary-light transition-colors border-b border-border/50 cursor-pointer ${
        isSelected ? 'bg-primary' : ''
      }`}
    >
      <div className="relative shrink-0">
        <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm ${
          isSelected ? 'bg-primary-dark text-white' : 'bg-primary/10 text-primary'
        }`}>
          {contact.avatar}
        </div>
        {contact.online && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-success border-2 border-card rounded-full" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <span className={`font-semibold text-sm truncate ${isSelected ? 'text-white' : 'text-text'}`}>
            {contact.name}
          </span>
          <span className={`text-xs shrink-0 mr-1 ${isSelected ? 'text-white' : 'text-text-muted'}`}>
            {contact.lastTime}
          </span>
        </div>
        <div className="flex justify-between items-center mt-0.5">
          <span className={`text-xs truncate ${isSelected ? 'text-white' : 'text-text-muted'}`}>
            {contact.lastMessage}
          </span>
          {contact.unread > 0 && (
            <span className={`shrink-0 mr-1 text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 ${
              isSelected ? 'bg-primary-dark text-white' : 'bg-primary text-white'
            }`}>
              {contact.unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
