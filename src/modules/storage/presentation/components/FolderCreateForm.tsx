import { useState } from "react";
import { Button } from "../../../../core/presentation/layouts/ui/buttons/Button";

export function FolderCreateForm({
    parentId,
    onSuccess,
    onCancel,
  }: {
    parentId: string;
    onSuccess: (name: string) => Promise<void>;
    onCancel: () => void;
  }) {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
  
    const handleSubmit = async () => {
      if (!name.trim()) return;
      setLoading(true);
      await onSuccess(name);
      setLoading(false);
    };
  
    return (
      <div className="p-4 space-y-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="اسم المجلد"
          className="w-full px-3 py-2 border border-border rounded-md"
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>إلغاء</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={loading || !name.trim()}>
            {loading ? "جاري الإنشاء..." : "إنشاء"}
          </Button>
        </div>
      </div>
    );
  }