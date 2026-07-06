import React, { useState, useEffect } from 'react';
import { Dialog } from '../../../../../../core/presentation/layouts/ui/dialog/Dialog';
import { Button } from '../../../../../../core/presentation/layouts/ui/buttons/Button';
import Input from '../../../../../../core/presentation/layouts/ui/inputs/Input';
import { useLanguage } from '../../../../../../core/presentation/context/i18n/I18nProvider';
import { useApiClient } from '../../../../../../core/presentation/context/api/ApiClinetProvider';
import { toast } from 'sonner';
import type { Plot } from '../../../../domain/entities/plot';

interface ChangePlotStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  plot: Plot | null;
  onSuccess: () => void;
}

export function ChangePlotStatusModal({ isOpen, onClose, plot, onSuccess }: ChangePlotStatusModalProps) {
  const { t } = useLanguage();
  const apiClient = useApiClient();
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [statusDate, setStatusDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (isOpen && plot) {
      setStatus(plot.status || 'unsold');
      setStatusDate(new Date().toISOString().split('T')[0]); // Default to today
      setNotes('');
    }
  }, [isOpen, plot]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plot) return;
    
    setLoading(true);
    try {
      await apiClient.put(`/investments/plots/${plot.id}/status`, {
        status,
        status_date: statusDate,
        notes
      });
      
      toast.success(t('plots.status_updated', 'investments') || 'Status updated successfully');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('plots.status_update_error', 'investments') || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: 'unsold', label: t('plot_status.unsold', 'investments') || 'Unsold' },
    { value: 'announced', label: t('plot_status.announced', 'investments') || 'Announced' },
    { value: 'subscribed', label: t('plot_status.subscribed', 'investments') || 'Subscribed' },
    { value: 'allocated', label: t('plot_status.allocated', 'investments') || 'Allocated' },
    { value: 'separated', label: t('plot_status.separated', 'investments') || 'Separated' }
  ];

  if (!plot) return null;

  return (
    <Dialog 
      isOpen={isOpen} 
      onClose={onClose} 
      title={t('plots.change_status', 'investments') || 'Change Status'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1">
            {t('plots.status', 'investments') || 'Status'}
          </label>
          <div className="w-full p-2 bg-primary-light/10 border border-border rounded-lg text-sm font-medium text-primary-dark">
            {t(`plot_status.${status}`, 'investments') || status}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1">
            {t('plots.status_date', 'investments') || 'Status Date'} <span className="text-danger">*</span>
          </label>
          <Input
            type="date"
            value={statusDate}
            onChange={(val) => setStatusDate(val as string)}
            required
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1">
            {t('plots.notes', 'investments') || 'Notes'}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-2 border border-border rounded-lg bg-surface text-text focus:ring-2 focus:ring-primary outline-none transition-all resize-none min-h-25"
            placeholder={t('plots.notes_placeholder', 'investments') || 'Optional notes...'}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            {t('common.cancel', 'shared') || 'Cancel'}
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? t('common.loading', 'shared') || 'Loading...' : t('common.save', 'shared') || 'Save'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
