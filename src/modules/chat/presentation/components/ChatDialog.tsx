import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, MessageCircle } from 'lucide-react';
import type { Contact, Message } from '../data/dummyChats';
import { dummyContacts } from '../data/dummyChats';
import { ContactList } from './ContactList';
import { ChatView } from './ChatView';

function ChatDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initial: Record<string, Message[]> = {};
    for (const c of dummyContacts) {
      initial[c.id] = [...c.messages];
    }
    setMessages(initial);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedContact]);

  const handleSend = (text: string) => {
    if (!selectedContact) return;
    const msg: Message = {
      id: `m-${Date.now()}`,
      text,
      time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      sent: true,
      status: 'sent',
    };
    setMessages(prev => ({
      ...prev,
      [selectedContact.id]: [...(prev[selectedContact.id] || []), msg],
    }));
  };

  const openChat = (contact: Contact) => {
    setSelectedContact(contact);
  };

  const handleBack = () => {
    setSelectedContact(null);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-100000 flex items-center justify-center p-2 sm:p-4" dir="rtl">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col shadow-primary/10 animate-zoom-in overflow-hidden">
        <div className="bg-primary text-white px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <MessageCircle size={22} />
            <h2 className="font-bold text-base">{selectedContact ? selectedContact.name : 'المحادثات'}</h2>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-md hover:bg-danger/10 hover:text-danger transition-all cursor-pointer">
            <X size={18} className="text-white cursor-pointer" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className={`${selectedContact ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 flex-col border-l border-border bg-background shrink-0`}>
            <ContactList
              contacts={dummyContacts}
              selectedId={selectedContact?.id ?? null}
              onSelect={openChat}
            />
          </div>

          <div className={`${!selectedContact ? 'hidden md:flex' : 'flex'} flex-1`}>
            <ChatView
              contact={selectedContact}
              messages={messages[selectedContact?.id ?? ''] ?? []}
              messagesEndRef={messagesEndRef}
              onSend={handleSend}
              onBack={handleBack}
            />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ChatDialog;
