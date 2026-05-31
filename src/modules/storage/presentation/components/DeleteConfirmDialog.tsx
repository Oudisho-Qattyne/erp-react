// src/modules/storage/presentation/components/DeleteConfirmDialog.tsx
import { useState } from 'react';
import { Dialog } from '../../../../core/presentation/layouts/ui/dialog/Dialog';
import { Button } from '../../../../core/presentation/layouts/ui/buttons/Button';
import type { StorageItemDto } from '../../application/dtos/storageItem';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  items: StorageItemDto[];
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export function DeleteConfirmDialog({
  isOpen,
  items,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onCancel} title="تأكيد الحذف">
      <div className="p-4 space-y-4">
        <p className="text-text">هل أنت متأكد من حذف العناصر المحددة؟</p>
        {items.map((item) => (
          <p key={item.id}>{item.id}</p>
        ))}
        <p className="text-sm text-text-muted">لا يمكن التراجع عن هذا الإجراء.</p>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            إلغاء
          </Button>
          <Button variant="primary" onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span>جاري الحذف...</span>
              </div>
            ) : (
              'حذف'
            )}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}