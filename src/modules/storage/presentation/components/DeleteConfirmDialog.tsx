import { useContext, useMemo, useState } from 'react';
import { Dialog } from '../../../../core/presentation/layouts/ui/dialog/Dialog';
import { Button } from '../../../../core/presentation/layouts/ui/buttons/Button';
import { Spinner } from '../../../../core/presentation/layouts/ui/state/Spinner';
import { AuthContext } from '../../../../core/infrastructure/auth/AuthProvider';
import { useLanguage } from '../../../../core/presentation/context/i18n/I18nProvider';
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
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const auth = useContext(AuthContext);
  const hasAccess = useMemo(() => {
    const hasFolder = items.some(i => i.type === 'folder');
    const hasFile = items.some(i => i.type === 'file');
    return (
      (!hasFolder || (auth?.hasPermission('storage.folder.delete') ?? false)) &&
      (!hasFile || (auth?.hasPermission('storage.file.delete') ?? false))
    );
  }, [items, auth]);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !hasAccess) return null;

  return (
    <Dialog isOpen={isOpen} onClose={onCancel} title={t('delete_confirm.title', 'storage')}>
      <div className="p-4 space-y-4">
        <p className="text-text">{t('delete_confirm.message', 'storage')}</p>
        {items.map((item) => (
          <p key={item.id}>{item.id}</p>
        ))}
        <p className="text-sm text-text-muted">{t('delete_confirm.irreversible', 'storage')}</p>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            {t('file_upload.cancel', 'storage')}
          </Button>
          <Button variant="primary" onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" className="border-white" />
                <span>{t('delete_confirm.deleting', 'storage')}</span>
              </div>
            ) : (
              t('delete_confirm.confirm', 'storage')
            )}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}