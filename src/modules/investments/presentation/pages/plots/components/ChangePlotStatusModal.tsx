import React, { useState, useEffect } from 'react';
import { Dialog } from '../../../../../../core/presentation/layouts/ui/dialog/Dialog';
import { Button } from '../../../../../../core/presentation/layouts/ui/buttons/Button';
import { ChevronDown } from 'lucide-react';
import Input from '../../../../../../core/presentation/layouts/ui/inputs/Input';
import { useLanguage } from '../../../../../../core/presentation/context/i18n/I18nProvider';
import { DossierPickerDialog } from './DossierPickerDialog';
import { toast } from 'sonner';
import type { Plot } from '../../../../domain/entities/plot';
import type { Dossier } from '../../../../domain/entities/dossier';
import type { PlotStatusBody } from '../../../../domain/repositories/IPlotRepository';
import { usePlotStatus } from '../../../hooks/usePlotStatus';

interface ChangePlotStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  plot: Plot | null;
  onSuccess: () => void;
}

export function ChangePlotStatusModal({ isOpen, onClose, plot, onSuccess }: ChangePlotStatusModalProps) {
  const { t } = useLanguage();
  const { changeStatus } = usePlotStatus();
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [statusDate, setStatusDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [selectedDossier, setSelectedDossier] = useState<Dossier | null>(null);
  const [dossierPickerOpen, setDossierPickerOpen] = useState(false);

  useEffect(() => {
    if (isOpen && plot) {
      setStatus(plot.status || 'unsold');
      setStatusDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setSelectedDossier(null);
    }
  }, [isOpen, plot]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plot) return;
    
    if (status === 'allocated' && !plot.allocated_dossier_id && !selectedDossier) {
      toast.error(t('plots.dossier_required', 'investments') || 'Please select a dossier');
      return;
    }

    setLoading(true);
    try {
      const body: PlotStatusBody = {
        status,
        status_date: statusDate,
        notes,
      };
      if (status === 'allocated' && selectedDossier) {
        body.allocated_dossier_id = selectedDossier.id;
      }
      await changeStatus(plot.id, body);
      toast.success(t('plots.status_updated', 'investments') || 'Status updated successfully');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || t('plots.status_update_error', 'investments') || 'Failed to update status');
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

        {status === 'allocated' && !plot.allocated_dossier_id && (
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              {t('plots.allocated_dossier', 'investments') || 'Dossier'} <span className="text-danger">*</span>
            </label>
            <div
              onClick={() => setDossierPickerOpen(true)}
              className="flex items-center justify-between w-full p-2 border border-border rounded-lg bg-surface text-sm cursor-pointer"
            >
              <span className={`truncate ${!selectedDossier ? 'text-text-muted' : 'text-text'}`}>
                {selectedDossier ? selectedDossier.dossier_number : (t('plots.select_dossier', 'investments') || 'Select a dossier')}
              </span>
              <ChevronDown size={16} className="text-text-muted shrink-0" />
            </div>
            <DossierPickerDialog
              isOpen={dossierPickerOpen}
              onClose={() => setDossierPickerOpen(false)}
              onConfirm={(selected) => {
                if (selected.length > 0) setSelectedDossier(selected[0]);
                setDossierPickerOpen(false);
              }}
              defaultFilter={{ plot_id: plot.id, status: 'allocatable' }}
            />
          </div>
        )}

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
