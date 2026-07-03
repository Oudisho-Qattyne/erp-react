import React, { useEffect } from 'react';
import { useLanguage } from '../../../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud } from '../../../../../../core/presentation/hooks/data/useEntity';
import { getCreatePlotFormSchema } from '../../../schemas/plotForm.schema';
import type { PlotArea } from '../../../../domain/entities/plotArea';
import type { PlotClassification } from '../../../../domain/entities/plotClassification';
import { GenericCreateForm, type FieldConfig } from '../../../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import { SelectOnMap } from '../../../../../../core/presentation/layouts/ui/inputs/SelectOnMap';
import { PlotStatusStepper, PLOT_STATUSES } from '../../../../../../core/presentation/layouts/ui/stepper/PlotStatusStepper';
import { getCreatePlotAreaFormSchema } from '../../../schemas/plotAreaForm.schema';
import { getCreatePlotClassificationFormSchema } from '../../../schemas/plotClassificationForm.schema';
import { Dialog } from '../../../../../../core/presentation/layouts/ui/dialog/Dialog';
import { Button } from '../../../../../../core/presentation/layouts/ui/buttons/Button';
import Input from '../../../../../../core/presentation/layouts/ui/inputs/Input';
import { inputBaseClasses } from '../../../../../../core/presentation/layouts/ui/inputs/styles';
import { CustomSelect } from '../../../../../../core/presentation/layouts/ui/inputs/CustomSelect';
import { ChangePlotStatusModal } from './ChangePlotStatusModal';
import { PlotStatusHistoryModal } from './PlotStatusHistoryModal';
import { PlotAuditLogModal } from './PlotAuditLogModal';
import { History, Pencil, MapPin } from 'lucide-react';

interface PlotFormProps {
  plot?: any;
  defaultValues?: any;
  onSubmit: (data: any) => Promise<any>;
  onSuccess: () => void;
  onCancel: () => void;
  submitLabel?: string;
  isCreate?: boolean;
}

export function PlotForm({ plot, defaultValues, onSubmit, onSuccess, onCancel, submitLabel, isCreate }: PlotFormProps) {
  const { t } = useLanguage();
  const { entities: plotAreas, getAll: getPlotAreas, create: createPlotArea } = useEntityCrud<PlotArea>('/investments/plot-areas', '/investments/plot-areas');
  const { entities: classifications, getAll: getClassifications, create: createClassification } = useEntityCrud<PlotClassification>('/investments/plot-classifications', '/investments/plot-classifications');

  const [statusDate, setStatusDate] = React.useState(defaultValues?.status_date || new Date().toISOString().split('T')[0]);
  const [clickedStatus, setClickedStatus] = React.useState<string | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = React.useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(!!isCreate);

  const status = defaultValues?.status || 'unsold';

  useEffect(() => {
    getPlotAreas();
    getClassifications();
  }, []);

  const formFields: FieldConfig[] = [
    { name: 'code', label: t('plots.code', 'investments') || 'Code', required: true },
    { name: 'identifier', label: t('plots.identifier', 'investments') || 'Identifier', required: true },
    { name: 'area', type: 'text', label: t('plots.area', 'investments') || 'Area', required: true },
    { 
      name: 'plot_area_id', 
      type: 'select-or-create', 
      label: t('plots.plot_area_id', 'investments') || 'Plot Area',
      required: true,
      options: plotAreas.map(pa => ({ value: pa.id, label: pa.name })),
      createTitle: t('plot_areas.add', 'investments') || 'Add Plot Area',
      labelPath: 'name',
      renderCreateForm: (onSuccessForm, onCancelForm) => (
        <GenericCreateForm
          fields={[
            { name: 'name', label: t('plot_areas.name', 'investments'), required: true },
            { name: 'is_active', type: 'checkbox', label: t('plot_areas.is_active', 'investments') }
          ]}
          schema={getCreatePlotAreaFormSchema(t)}
          onSubmit={async (data) => createPlotArea(data)}
          onSuccess={onSuccessForm}
          onCancel={onCancelForm}
        />
      )
    },
    { 
      name: 'plot_classification_id', 
      type: 'select-or-create', 
      label: t('plots.plot_classification_id', 'investments') || 'Classification',
      required: true,
      options: classifications.map(pc => ({ value: pc.id, label: pc.name })),
      createTitle: t('plot_classifications.add', 'investments') || 'Add Classification',
      labelPath: 'name',
      renderCreateForm: (onSuccessForm, onCancelForm) => (
        <GenericCreateForm
          fields={[
            { name: 'name', label: t('plot_classifications.name', 'investments'), required: true },
            { name: 'is_active', type: 'checkbox', label: t('plot_classifications.is_active', 'investments') }
          ]}
          schema={getCreatePlotClassificationFormSchema(t)}
          onSubmit={async (data) => createClassification(data)}
          onSuccess={onSuccessForm}
          onCancel={onCancelForm}
        />
      )
    },
    {
      name: 'latitude',
      label: t('plots.location', 'investments') || 'Location',
      required: true,
      render: (methods) => {
        const { watch, setValue, formState: { errors } } = methods;
        const lat = watch('latitude') || '';
        const lng = watch('longitude') || '';
        const error = errors.latitude || errors.longitude;
        
        return (
          <div className="w-full mb-4">
            <label className="block text-sm font-semibold text-text mb-1.5">
              {t('plots.location', 'investments') || 'Location'} <span className="text-danger">*</span>
            </label>
            <SelectOnMap
              latitude={lat}
              longitude={lng}
              onChange={(newLat, newLng) => {
                setValue('latitude', newLat, { shouldValidate: true });
                setValue('longitude', newLng, { shouldValidate: true });
              }}
            />
            {error && <div className="text-danger text-xs mt-1 font-medium">{String(error.message)}</div>}
          </div>
        );
      }
    },
    { name: 'longitude', hidden: true },
    { name: 'current_condition', label: t('plots.current_condition', 'investments') || 'Current Condition' },
    { name: 'notes', type: 'textarea', label: t('plots.notes', 'investments') || 'Notes' },
    { name: 'created_at', type: 'date', label: t('plots.created_at', 'investments') || 'Created At Date', hidden: !isCreate },
  ];

  // const handleSaveStatus = () => {
  //   setStatusDate(tempStatusDate);
  //   setIsEditStatusOpen(false);
  // };

  const handleFormSubmit = async (data: any) => {
    return onSubmit({ ...data, status, status_date: statusDate });
  };

  const currentStatus = defaultValues?.status || 'unsold';

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <div className="p-6 border-b border-border bg-primary/5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{t('plots.status', 'investments') || 'Status'}</h2>
          {!isCreate && plot?.status_histories && plot.status_histories.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => setIsHistoryModalOpen(true)} className="flex items-center gap-2">
              <History size={16} />
              {t('plots.view_history', 'investments') || 'سحل الحلااتت'}
            </Button>
          )}
        </div>
        <PlotStatusStepper 
          currentStatus={status} 
          statusDate={statusDate}
          onStatusClick={isCreate ? undefined : (status) => setClickedStatus(status)}
          permissions={{
            unsold: 'investments.plots.set-unsold',
            announced: 'investments.plots.set-announced',
            subscribed: 'investments.plots.set-subscribed',
            allocated: 'investments.plots.set-allocated',
            separated: 'investments.plots.set-separated',
          }}
        />
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">{t('plots.plot_info', 'investments') || 'Plot Info'}</h2>
          <div className="flex gap-2">
            {!isCreate && plot?.id && (
              <Button onClick={() => setIsAuditModalOpen(true)} variant="outline" size="sm" className="flex items-center gap-2" requiredPermission="shared.audit-logs.view">
                <History size={16} />
                {t('plots.edit_log', 'investments') || 'سجل التعديل'}
              </Button>
            )}
            {!isEditing && !isCreate && (
              <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className="flex items-center gap-2" requiredPermission="investments.plots.update">
                <Pencil size={16} />
                {t('common.edit', 'shared') || 'Edit'}
              </Button>
            )}
          </div>
        </div>

        {isEditing ? (
          <GenericCreateForm
            fields={formFields}
            schema={getCreatePlotFormSchema(t)}
            defaultValues={defaultValues}
            onSubmit={handleFormSubmit}
            onSuccess={onSuccess}
            onCancel={isCreate ? onCancel : () => setIsEditing(false)}
            submitLabel={submitLabel}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1">
              <span className="text-sm text-text-muted">{t('plots.code', 'investments') || 'Code'}</span>
              <p className="font-medium text-text">{plot?.code || '—'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-text-muted">{t('plots.identifier', 'investments') || 'Identifier'}</span>
              <p className="font-medium text-text">{plot?.identifier || '—'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-text-muted">{t('plots.area', 'investments') || 'Area'}</span>
              <p className="font-medium text-text">{plot?.area ? `${plot.area} ㎡` : '—'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-text-muted">{t('plots.plot_area_id', 'investments') || 'Plot Area'}</span>
              <p className="font-medium text-text">{plot?.plot_area?.name || '—'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-text-muted">{t('plots.plot_classification_id', 'investments') || 'Classification'}</span>
              <p className="font-medium text-text">{plot?.plot_classification?.name || '—'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-text-muted">{t('plots.current_condition', 'investments') || 'Current Condition'}</span>
              <p className="font-medium text-text">{plot?.current_condition || '—'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-text-muted">{t('plots.location', 'investments') || 'Location'}</span>
              <div className="flex items-center gap-2">
                <p className="font-medium text-text">
                  {plot?.latitude && plot?.longitude ? `${plot.latitude}, ${plot.longitude}` : '—'}
                </p>
                {plot?.latitude && plot?.longitude && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-1 h-auto"
                    onClick={() => window.open(`https://www.google.com/maps?q=${plot.latitude},${plot.longitude}`, '_blank')}
                    title={t('plots.show_map', 'investments') || 'Show in Map'}
                  >
                    <MapPin size={16} className="text-success" />
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-text-muted">{t('plots.added_by', 'investments') || 'Added By'}</span>
              <p className="font-medium text-text">{plot?.user?.name || '—'}</p>
            </div>
            <div className="space-y-1 md:col-span-2 lg:col-span-3">
              <span className="text-sm text-text-muted">{t('plots.notes', 'investments') || 'Notes'}</span>
              <p className="font-medium text-text whitespace-pre-wrap">{plot?.notes || '—'}</p>
            </div>
          </div>
        )}
      </div>

      {plot && clickedStatus && (
        <ChangePlotStatusModal
          isOpen={!!clickedStatus}
          onClose={() => setClickedStatus(null)}
          plot={{...plot, status: clickedStatus}}
          onSuccess={() => window.location.reload()}
        />
      )}

      {plot && (
        <PlotStatusHistoryModal
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          histories={plot.status_histories}
        />
      )}

      {plot && plot.id && (
        <PlotAuditLogModal
          isOpen={isAuditModalOpen}
          onClose={() => setIsAuditModalOpen(false)}
          plotId={plot.id}
        />
      )}
    </div>
  );
}
