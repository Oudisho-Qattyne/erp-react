import { useState } from 'react';
import { Dialog } from '../../../../core/presentation/layouts/ui/dialog/Dialog';
import { Button } from '../../../../core/presentation/layouts/ui/buttons/Button';
import { useLanguage } from '../../../../core/presentation/context/i18n/I18nProvider';
import { FileExplorer } from './FileExplorer';
import type { StorageItemDto } from '../../application/dtos/storageItem';

interface FilePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (items: StorageItemDto[]) => void;
  folderId?: string;
  multiple?: boolean;
  fileTypes?: string[]
}

export function FilePicker({ isOpen, onClose, onSelect, folderId, multiple, fileTypes }: FilePickerProps) {
  const { t } = useLanguage();
  const [selectedItems, setSelectedItems] = useState<StorageItemDto[]>([]);

  const handleSelect = () => {
    onSelect(selectedItems);
    onClose();
  };
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={t('file_picker.title', 'storage')} size="3xl">
      <div className="h-[70vh] flex flex-col -m-4">
        <div className="flex-1 min-h-0">
          <FileExplorer
            multiple={multiple}
            folderId={folderId}
            onSelectionChange={setSelectedItems}
            fileTypes={fileTypes}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t border-border mt-4">
        <Button variant="outline" onClick={onClose}>
          {t('file_picker.cancel', 'storage')}
        </Button>
        <Button variant="primary" onClick={handleSelect} disabled={selectedItems.length === 0}>
          {multiple ? t('file_picker.select_count', 'storage').replace('{count}', String(selectedItems.length)) : t('file_picker.select', 'storage')}
        </Button>
      </div>
    </Dialog>
  );
}
