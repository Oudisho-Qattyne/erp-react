import { useContext } from "react";
import { useState } from "react";
import { Button } from "../../../../core/presentation/layouts/ui/buttons/Button";
import { useLanguage } from "../../../../core/presentation/context/i18n/I18nProvider";
import { AuthContext } from "../../../../core/infrastructure/auth/AuthProvider";

export function FolderCreateForm({
    parentId,
    onSuccess,
    onCancel,
  }: {
    parentId: string;
    onSuccess: (name: string) => Promise<void>;
    onCancel: () => void;
  }) {
    const { t } = useLanguage();
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const auth = useContext(AuthContext);

    const handleSubmit = async () => {
      if (!name.trim()) return;
      setLoading(true);
      try {
        await onSuccess(name);
      } finally {
        setLoading(false);
      }
    };

    const hasAccess = auth?.hasPermission('storage.folder.create') ?? false;
    if (!hasAccess) return null;
  
    return (
      <div className="p-4 space-y-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('folder_create.placeholder', 'storage')}
          className="w-full px-3 py-2 border border-border rounded-md"
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>{t('file_upload.cancel', 'storage')}</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={loading || !name.trim()}>
            {loading ? t('folder_create.creating', 'storage') : t('folder_create.confirm', 'storage')}
          </Button>
        </div>
      </div>
    );
  }