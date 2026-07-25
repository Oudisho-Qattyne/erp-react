import type { Message } from '../data/dummyChats';
import { StatusIcon } from './StatusIcon';

export function MessageBubble({ message }: { message: Message }) {
  return (
    <div className={`flex ${message.sent ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed shadow-sm ${
          message.sent
            ? 'bg-primary text-white rounded-tr-sm'
            : 'bg-card text-text rounded-tl-sm'
        }`}
      >
        <div className="flex items-end gap-1.5">
          <span>{message.text}</span>
          <span className={`text-[10px] shrink-0 flex items-center gap-0.5 ${message.sent ? 'text-white/70' : 'text-text-muted'}`}>
            {message.time}
            {message.sent && <StatusIcon status={message.status} />}
          </span>
        </div>
      </div>
    </div>
  );
}
