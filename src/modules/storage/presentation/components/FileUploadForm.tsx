import { useContext, useEffect, useRef, useState } from "react";
import { Button } from "../../../../core/presentation/layouts/ui/buttons/Button";
import Input from "../../../../core/presentation/layouts/ui/inputs/Input";
import { inputBaseClasses } from "../../../../core/presentation/layouts/ui/inputs/styles";
import { useLanguage } from "../../../../core/presentation/context/i18n/I18nProvider";
import { AuthContext } from "../../../../core/infrastructure/auth/AuthProvider";
import { useDialogClose } from "../../../../core/presentation/layouts/ui/dialog/Dialog";
import { useConfirmOnClose } from "../../../../core/presentation/layouts/ui/dialog/useConfirmOnClose";

export function FileUploadForm({
  parentId,
  file,
  onSuccess,
  onCancel,
}: {
  parentId: string;
  file: File;
  onSuccess: (isSecure: boolean, name: string) => Promise<void>;
  onCancel: () => void;
}) {
  const { t } = useLanguage();
  const [isSecure, setIsSecure] = useState(false);
  const [extension, setExtension] = useState<string>("");
  const [baseName, setBaseName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const auth = useContext(AuthContext);
  const initialBaseNameRef = useRef<string | null>(null);

  const { requestClose } = useDialogClose();
  useConfirmOnClose(() => isSecure || (initialBaseNameRef.current !== null && baseName !== initialBaseNameRef.current));

  const handleCancel = () => {
    if (requestClose) {
      requestClose();
    } else {
      onCancel();
    }
  };

  useEffect(() => {
    if (file?.name) {
      const lastDotIndex = file.name.lastIndexOf(".");
      if (lastDotIndex === -1) {
        setBaseName(file.name);
        setExtension("");
        initialBaseNameRef.current = file.name;
      } else {
        const ext = file.name.slice(lastDotIndex);
        const nameWithoutExt = file.name.slice(0, lastDotIndex);
        setBaseName(nameWithoutExt);
        setExtension(ext);
        initialBaseNameRef.current = nameWithoutExt;
      }
    }
  }, [file]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const fullName = extension ? `${baseName}${extension}` : baseName;
      await onSuccess(isSecure, fullName);
    } finally {
      setLoading(false);
    }
  };

  const hasAccess = auth?.hasPermission('storage.file.upload') ?? false;
  if (!hasAccess) return null;

  return (
    <div className="p-4 space-y-4">
      <div className="text-sm">
        <span className="text-muted-foreground">{t('file_upload.original_file', 'storage')}</span>{" "}
        <span className="font-medium">{file.name}</span>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">{t('file_upload.file_name', 'storage')}</label>
        <div className="flex items-center gap-1">
          <Input
            className={inputBaseClasses}
            type="text"
            value={baseName}
            onChange={(value) => setBaseName(value)}
            placeholder={t('file_upload.file_name_placeholder', 'storage')}
          />
          {extension && <span className="text-sm text-muted-foreground">{extension}</span>}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{t('file_upload.hint', 'storage')}</p>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isSecure}
          onChange={(e) => setIsSecure(e.target.checked)}
          className="rounded border-border"
        />
        <span className="text-sm">{t('file_upload.secure_storage', 'storage')}</span>
      </label>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={handleCancel} disabled={loading}>
          {t('file_upload.cancel', 'storage')}
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? t('file_upload.uploading', 'storage') : t('file_upload.confirm', 'storage')}
        </Button>
      </div>
    </div>
  );
}