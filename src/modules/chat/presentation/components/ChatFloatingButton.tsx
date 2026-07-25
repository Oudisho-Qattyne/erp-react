import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '../../../../core/presentation/layouts/ui/buttons/Button';
import ChatDialog from './ChatDialog';

export function ChatFloatingButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 left-6 z-50">
        <Button
          variant="primary"
          className="rounded-full w-14 h-14 shadow-lg flex items-center justify-center"
          onClick={() => setOpen(true)}
        >
          <MessageCircle />
        </Button>
      </div>
      <ChatDialog isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
