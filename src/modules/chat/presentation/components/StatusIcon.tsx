import { Check, CheckCheck } from 'lucide-react';
import type { MessageStatus } from '../data/dummyChats';

export function StatusIcon({ status }: { status: MessageStatus }) {
  if (status === 'sent') return <Check size={14} className="text-text-muted" />;
  if (status === 'delivered') return <CheckCheck size={14} className="text-text-muted" />;
  return <CheckCheck size={14} className="text-primary" />;
}
