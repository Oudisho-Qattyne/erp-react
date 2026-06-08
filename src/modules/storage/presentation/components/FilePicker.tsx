import { useState } from 'react';
import { Dialog } from '../../../../core/presentation/layouts/ui/dialog/Dialog';
import { Button } from '../../../../core/presentation/layouts/ui/buttons/Button';
import { FileExplorer } from './FileExplorer';
import type { StorageItemDto } from '../../application/dtos/storageItem';

interface FilePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (items: StorageItemDto[]) => void;
  folderId?: string;
  multiple?: boolean;
}

export function FilePicker({ isOpen, onClose, onSelect, folderId, multiple }: FilePickerProps) {
  const [selectedItems, setSelectedItems] = useState<StorageItemDto[]>([]);

  const handleSelect = () => {
    onSelect(selectedItems);
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="اختر الملفات" size="3xl">
      <div className="h-[70vh] flex flex-col -m-4">
        <div className="flex-1 min-h-0">
          <FileExplorer
            folderId={folderId}
            onSelectionChange={setSelectedItems}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t border-border mt-4">
        <Button variant="outline" onClick={onClose}>
          إلغاء
        </Button>
        <Button variant="primary" onClick={handleSelect} disabled={selectedItems.length === 0}>
          {multiple ? `تحديد (${selectedItems.length})` : 'تحديد'}
        </Button>
      </div>
    </Dialog>
  );
}
