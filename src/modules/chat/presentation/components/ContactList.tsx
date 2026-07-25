import { useState } from 'react';
import { Search } from 'lucide-react';
import type { Contact } from '../data/dummyChats';
import { ContactItem } from './ContactItem';

interface ContactListProps {
  contacts: Contact[];
  selectedId: string | null;
  onSelect: (contact: Contact) => void;
}

export function ContactList({ contacts, selectedId, onSelect }: ContactListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="ابحث عن محادثة..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pr-9 pl-3 py-2 text-sm rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.map(contact => (
          <ContactItem
            key={contact.id}
            contact={contact}
            isSelected={selectedId === contact.id}
            onSelect={onSelect}
          />
        ))}
        {filtered.length === 0 && (
          <div className="flex items-center justify-center h-32 text-sm text-text-muted">
            لا توجد نتائج
          </div>
        )}
      </div>
    </div>
  );
}
