import { MessageCircle } from 'lucide-react';

export function ChatEmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center text-text-muted">
        <MessageCircle size={48} className="mx-auto mb-3 opacity-40" />
        <p className="text-sm">اختر محادثة من القائمة</p>
      </div>
    </div>
  );
}
