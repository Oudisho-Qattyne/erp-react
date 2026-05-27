// src/modules/storage/presentation/components/RenameItemDialog.tsx
import { useEffect, useState } from 'react';
import { Dialog } from '../../../../core/presentation/layouts/ui/dialog/Dialog';
import { Button } from '../../../../core/presentation/layouts/ui/buttons/Button';
import { inputBaseClasses } from '../../../../core/presentation/layouts/ui/inputs/styles';
import Input from '../../../../core/presentation/layouts/ui/inputs/Input';
import type { StorageItemDto } from '../../application/dtos/storageItem';

interface RenameItemDialogProps {
  isOpen: boolean;
  item: StorageItemDto | null;
  onConfirm: (newName: string) => Promise<void>;
  onCancel: () => void;
}

export function RenameItemDialog({
  isOpen,
  item,
  onConfirm,
  onCancel,
}: RenameItemDialogProps) {
  const [newName, setNewName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Reset name when dialog opens with a new item
  useEffect(() => {
    if (isOpen && item) {
      setNewName(item.name);
    }
  }, [isOpen, item]);
console.log(newName);

  const handleSubmit = async () => {
    if (!newName.trim() || newName === item?.name) {
      onCancel();
      return;
    }
    setIsLoading(true);
    try {
      await onConfirm(newName.trim());
    } finally {
      setIsLoading(false);
    }
  };

  const title = item?.type === 'folder' ? 'إعادة تسمية المجلد' : 'إعادة تسمية الملف';

  return (
    <Dialog isOpen={isOpen} onClose={onCancel} title={title}>
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            الاسم الجديد
          </label>
          <Input
            type="text"
            value={newName}
            onChange={(val) => setNewName(val as string)}
            placeholder={item?.name}
            className={inputBaseClasses}
          />
          {item?.type === 'file' && item.name.includes('.') && (
            <p className="text-xs text-text-muted mt-1">
              يمكنك تغيير الاسم فقط، الامتداد (.{item.name.split('.').pop()}) سيتم الحفاظ عليه.
            </p>
          )}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            إلغاء
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isLoading || !newName.trim() || newName === item?.name}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span>جاري التحديث...</span>
              </div>
            ) : (
              'إعادة تسمية'
            )}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}