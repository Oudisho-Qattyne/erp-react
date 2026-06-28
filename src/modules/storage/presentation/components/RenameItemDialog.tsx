import { useContext, useEffect, useMemo, useState } from 'react';
import { Dialog } from '../../../../core/presentation/layouts/ui/dialog/Dialog';
import { Button } from '../../../../core/presentation/layouts/ui/buttons/Button';
import { Spinner } from '../../../../core/presentation/layouts/ui/state/Spinner';
import { inputBaseClasses } from '../../../../core/presentation/layouts/ui/inputs/styles';
import Input from '../../../../core/presentation/layouts/ui/inputs/Input';
import { useLanguage } from '../../../../core/presentation/context/i18n/I18nProvider';
import { AuthContext } from '../../../../core/infrastructure/auth/AuthProvider';
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
  const { t } = useLanguage();
  const [newName, setNewName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const auth = useContext(AuthContext);
  const hasAccess = useMemo(() => {
    const perm = item?.type === 'folder' ? 'storage.folder.rename' : 'storage.file.rename';
    return auth?.hasPermission(perm) ?? false;
  }, [item, auth]);

  useEffect(() => {
    if (isOpen && item) {
      setNewName(item.name);
    }
  }, [isOpen, item]);

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

  const titleKey = item?.type === 'folder' ? 'rename.dialog_title_folder' : 'rename.dialog_title_file';

  if (!isOpen || !hasAccess) return null;

  return (
    <Dialog isOpen={isOpen} onClose={onCancel} title={t(titleKey, 'storage')}>
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            {t('rename.new_name', 'storage')}
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
              {t('rename.hint_file', 'storage').replace('{ext}', item.name.split('.').pop()!)}
            </p>
          )}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            {t('file_upload.cancel', 'storage')}
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isLoading || !newName.trim() || newName === item?.name}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" className="border-white" />
                <span>{t('rename.updating', 'storage')}</span>
              </div>
            ) : (
              t('rename.confirm', 'storage')
            )}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}