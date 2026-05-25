import { useState } from "react";
import { Button } from "../../../../core/presentation/layouts/ui/buttons/Button";

export function FileUploadForm({
    parentId,
    file,
    onSuccess,
    onCancel,
  }: {
    parentId: string;
    file: File;
    onSuccess: (isSecure: boolean) => Promise<void>;
    onCancel: () => void;
  }) {
    const [isSecure, setIsSecure] = useState(false);
    const [loading, setLoading] = useState(false);
  
    const handleSubmit = async () => {
      setLoading(true);
      await onSuccess(isSecure);
      setLoading(false);
    };
  
    return (
      <div className="p-4 space-y-4">
        <div className="text-sm">
          <span className="text-muted-foreground">اسم الملف:</span>{" "}
          <span className="font-medium">{file.name}</span>
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