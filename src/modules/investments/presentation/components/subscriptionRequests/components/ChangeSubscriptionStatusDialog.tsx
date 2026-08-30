import { useLanguage } from "../../../../../../core/presentation/context/i18n/I18nProvider";
import { Dialog } from "../../../../../../core/presentation/layouts/ui/dialog/Dialog";
import { GenericCreateForm } from "../../../../../../core/presentation/layouts/ui/forms/GenericCreateForm";
import { z } from "zod";

interface ChangeSubscriptionStatusDialogProps {
  isOpen: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: (notes: string) => void;
  onCancel: () => void;
}

export function ChangeSubscriptionStatusDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  danger = false,
  onConfirm,
  onCancel,
}: ChangeSubscriptionStatusDialogProps) {
  const { t } = useLanguage();

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      size="sm"
      headerClassName={danger ? 'bg-danger text-white' : undefined}
    >
      <div className="space-y-3">
        {message && <p className="text-text-muted text-sm">{message}</p>}
        <GenericCreateForm
          schema={z.object({ notes: z.string().optional() })}
          fields={[
            {
              name: 'notes',
              type: 'textarea',
              label: t('subscription_requests.note_label', 'investments') || 'Note',
              placeholder: t('subscription_requests.note_placeholder', 'investments') || 'Write a note about this status change...',
            },
          ]}
          defaultValues={{ notes: '' }}
          submitLabel={confirmLabel}
          onSubmit={async (data) => {
            onConfirm((data?.notes ?? '') as string);
          }}
          onSuccess={() => {
            onCancel();
          }}
          onCancel={onCancel}
        />
      </div>
    </Dialog>
  );
}