import { useLanguage } from '../../../../../../core/presentation/context/i18n/I18nProvider';
import { AuditLog } from '../../../../../../core/presentation/layouts/ui/auditLogs/AuditLog';

interface PlotAuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  plotId?: number;
}

export function PlotAuditLogModal({ isOpen, onClose, plotId }: PlotAuditLogModalProps) {
  const { t } = useLanguage();

  return (
    <AuditLog
      isOpen={isOpen}
      onClose={onClose}
      model="plot"
      modelId={plotId}
      labels={{
        title: t('plots.edit_log', 'investments') || 'Edit Log',
        event: t('plots.event', 'investments') || 'Event',
        created_at: t('plots.created_at', 'investments') || 'Created At',
        changed_by: t('plots.changed_by', 'investments') || 'Changed By',
        changes: t('plots.changes', 'investments') || 'Changes',
        field: t('plots.field', 'investments') || 'Field',
        old_value: t('plots.old_value', 'investments') || 'Old Value',
        new_value: t('plots.new_value', 'investments') || 'New Value',
        no_records: t('plots.no_edit_log', 'investments') || 'No edit logs found',
        subject_id: t('plots.plot_id', 'investments') || 'Plot ID',
      }}
      translateField={(key) => t(`plots.${key}`, 'investments') || key}
    />
  );
}
