import { useEffect, useState } from "react";
import { Button } from "../../../../core/presentation/layouts/ui/buttons/Button";
import Input from "../../../../core/presentation/layouts/ui/inputs/Input";
import { inputBaseClasses } from "../../../../core/presentation/layouts/ui/inputs/styles";

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
  const [isSecure, setIsSecure] = useState(false);
  const [extension, setExtension] = useState<string>("");
  const [baseName, setBaseName] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (file?.name) {
      const lastDotIndex = file.name.lastIndexOf(".");
      if (lastDotIndex === -1) {
        // No extension
        setBaseName(file.name);
        setExtension("");
      } else {
        const ext = file.name.slice(lastDotIndex); // includes dot, e.g. ".pdf"
        const nameWithoutExt = file.name.slice(0, lastDotIndex);
        setBaseName(nameWithoutExt);
        setExtension(ext);
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

  return (
    <div className="p-4 space-y-4">
      <div className="text-sm">
        <span className="text-muted-foreground">الملف الأصلي:</span>{" "}
        <span className="font-medium">{file.name}</span>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">اسم الملف</label>
        <div className="flex items-center gap-1">
          <Input
            className={inputBaseClasses}
            type="text"
            value={baseName}
            onChange={(value) => setBaseName(value)}
            placeholder="اسم الملف"
          />
          {extension && <span className="text-sm text-muted-foreground">{extension}</span>}
        </div>
        <p className="text-xs text-muted-foreground mt-1">يمكنك تغيير الاسم، الامتداد ثابت</p>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isSecure}
          onChange={(e) => setIsSecure(e.target.checked)}
          className="rounded border-border"
        />
        <span className="text-sm">تخزين آمن (تشفير الملف)</span>
      </label>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          إلغاء
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "جاري الرفع..." : "رفع"}
        </Button>
      </div>
    </div>
  );
}