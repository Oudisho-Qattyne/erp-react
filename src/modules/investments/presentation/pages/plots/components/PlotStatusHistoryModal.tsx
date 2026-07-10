import React from 'react';
import { Dialog } from '../../../../../../core/presentation/layouts/ui/dialog/Dialog';
import { useLanguage } from '../../../../../../core/presentation/context/i18n/I18nProvider';
import { DataTable } from '../../../../../../core/presentation/layouts/ui/tables/ResizableTable';
import type { PlotStatusHistory } from '../../../../domain/entities/plotStatusHistory';



interface PlotStatusHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  histories?: PlotStatusHistory[];
}

export function PlotStatusHistoryModal({ isOpen, onClose, histories = [] }: PlotStatusHistoryModalProps) {
  const { t } = useLanguage();

  const columns = [
    {
      key: 'status',
      label: t('plots.status', 'investments') || 'Status',
      width: 120,
      render: (row: PlotStatusHistory) => (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-primary-dark bg-primary-light/20 px-2 py-0.5 rounded-full">
          {t(`plot_status.${row.status}`, 'investments') || row.status}
        </span>
      )
    },
    {
      key: 'status_date',
      label: t('plots.status_date', 'investments') || 'Status Date',
      width: 120,
      render: (row: PlotStatusHistory) => row.status_date ? new Date(row.status_date).toLocaleDateString() : '—'
    },
    {
      key: 'user',
      label: t('plots.changed_by', 'investments') || 'Changed By',
      width: 130,
      render: (row: PlotStatusHistory) => row.user?.name || '—'
    },
    {
      key: 'notes',
      label: t('plots.notes', 'investments') || 'Notes',
      width: 250,
      render: (row: PlotStatusHistory) => (
        <span className="text-sm whitespace-pre-wrap">{row.notes || '—'}</span>
      )
    },
    {
      key: 'created_at',
      label: t('plots.created_at', 'investments') || 'Created At',
      width: 150,
      render: (row: PlotStatusHistory) => row.created_at ? new Date(row.created_at).toLocaleString() : '—'
    }
  ];

  return (
    <Dialog 
      isOpen={isOpen} 
      onClose={onClose} 
      title={t('plots.status_history', 'investments') || 'Status History'}
      size="xl"
    >
      <div className="mt-4 max-h-[60vh] overflow-y-auto">
        <DataTable
          columns={columns}
          data={[...histories].reverse()}
          rowKey="id"
          emptyMessage={t('plots.no_history', 'investments') || 'No status history found'}
        />
      </div>
    </Dialog>
  );
}
