import type { Contact, Message } from '../data/dummyChats';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { ChatEmptyState } from './ChatEmptyState';

interface ChatViewProps {
  contact: Contact | null;
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onSend: (text: string) => void;
  onBack: () => void;
}

export function ChatView({ contact, messages, messagesEndRef, onSend, onBack }: ChatViewProps) {
  if (!contact) {
    return <ChatEmptyState />;
  }

  return (
    <div className="flex-1 flex flex-col bg-card">
      <ChatHeader contact={contact} onBack={onBack} />
      <MessageList messages={messages} messagesEndRef={messagesEndRef} />
      <ChatInput onSend={onSend} />
    </div>
  );
}
