import { AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { Button, type ButtonVariant } from '../buttons/Button';
import { Dialog } from './Dialog';

export type ConfirmType = 'danger' | 'alert' | 'friendly' | 'default';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  icon?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  showCancel?: boolean;
  type?: ConfirmType;
  confirmLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const typeStyles: Record<ConfirmType, {
  icon: React.ReactNode;
  headerBg: string;
  confirmVariant: ButtonVariant;
}> = {
  danger: {
    icon: <AlertTriangle size={24} />,
    headerBg: 'bg-danger text-white',
    confirmVariant: 'danger',
  },
  alert: {
    icon: <AlertTriangle size={24} />,
    headerBg: 'bg-warning text-white',
    confirmVariant: 'primary',
  },
  friendly: {
    icon: <CheckCircle size={24} />,
    headerBg: 'bg-success text-white',
    confirmVariant: 'primary',
  },
  default: {
    icon: <Info size={24} />,
    headerBg: 'bg-primary text-white',
    confirmVariant: 'primary',
  },
};

export function ConfirmDialog({
  isOpen,
  title,
  message,
  icon,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  showCancel = true,
  type = 'default',
  confirmLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const styles = typeStyles[type];
  const displayIcon = icon ?? styles.icon;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onCancel}
      title={
        <div className="flex items-center gap-3">
          <span>{displayIcon}</span>
          <span>{title}</span>
        </div>
      }
      headerClassName={styles.headerBg}
      size="sm"
      actions={
        <div className="flex justify-end gap-3 w-full">
          {showCancel && (
            <Button variant="outline" onClick={onCancel}>
              {cancelLabel}
            </Button>
          )}
          <Button variant={styles.confirmVariant} onClick={onConfirm} isLoading={confirmLoading}>
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="text-text text-sm leading-relaxed">{message}</div>
    </Dialog>
  );
}
