import React, { useEffect } from 'react';
import { useLanguage } from '../../../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud } from '../../../../../../core/presentation/hooks/data/useEntity';
import { getCreatePlotFormSchema } from '../../../schemas/plotForm.schema';
import type { PlotArea } from '../../../../domain/entities/plotArea';
import type { PlotClassification } from '../../../../domain/entities/plotClassification';
import { GenericCreateForm, type FieldConfig } from '../../../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import { SelectOnMap } from '../../../../../../core/presentation/layouts/ui/inputs/SelectOnMap';
import { PlotStatusStepper, PLOT_STATUSES } from './PlotStatusStepper';
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
import type { Plot } from '../../../../domain/entities/plot';
import type { PlotStatus } from '../../../../domain/valueObjects/plots/plotStatus';
import type { ServiceCondition } from '../../../../domain/entities/serviceCondition';
import type { ServiceStatusCondition } from '../../../../domain/entities/serviceStatusCondition';
import { getCreateServiceConditionFormSchema } from '../../../schemas/serviceConditionForm.schema';
import { getCreateServiceStatusConditionFormSchema } from '../../../schemas/serviceStatusConditionForm.schema';
import z from 'zod';

interface PlotFormProps {
  plot?: Plot;
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
  const { entities: serviceConditions, getAll: getServiceConditions, create: createServiceCondition, update, remove, loadingMap, errorMap } = useEntityCrud<ServiceCondition>('/investments/service-conditions', '/investments/service-conditions');
  const { entities: serviceStatusConditions, getAll: getServiceStatusConditions, create: createServiceStatusCondition } = useEntityCrud<ServiceStatusCondition>('/investments/service-status-conditions', '/investments/service-status-conditions');

  const [statusDate, setStatusDate] = React.useState(defaultValues?.status_date || new Date().toISOString().split('T')[0]);
  const [clickedStatus, setClickedStatus] = React.useState<PlotStatus | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = React.useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(!!isCreate);

  const status = defaultValues?.status || 'unsold';

  useEffect(() => {
    getPlotAreas('/investments/plot-areas?is_active=true');
    getClassifications('/investments/plot-classifications?is_active=true');
    getServiceConditions('/investments/service-conditions?is_active=true')
    getServiceStatusConditions('/investments/service-status-conditions?is_active=true')
  }, []);

  const formFields: FieldConfig[] = [
    { name: 'code', label: t('plots.code', 'investments') || 'Code', required: true, type: 'text', regex: /\S/, group: 'basic_info' },
    { name: 'identifier', label: t('plots.identifier', 'investments') || 'Identifier', required: true, type: 'numeric', group: 'basic_info' },
    { name: 'area', type: 'numeric', label: t('plots.area', 'investments') || 'Area', required: true, group: 'basic_info' },
    {
      name: 'plot_area_id',
      type: 'select-or-create',
      label: t('plots.plot_area_id', 'investments') || 'Plot Area',
      required: true,
      group: 'classification',
      options: plotAreas.map(pa => ({ value: pa.id, label: pa.name, is_default: pa.is_default })),
      createTitle: t('plot_areas.add', 'investments') || 'Add Plot Area',
      labelPath: 'name',
      renderCreateForm: (onSuccessForm, onCancelForm) => (
        <GenericCreateForm
          fields={[
            { name: 'name', type: 'alpha', label: t('plot_areas.name', 'investments'), required: true },
          ]}
          schema={getCreatePlotAreaFormSchema(t)}
          onSubmit={async (data) => createPlotArea({ ...data, is_active: true })}
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
      group: 'classification',
      options: classifications.map(pc => ({ value: pc.id, label: pc.name, is_default: pc.is_default })),
      createTitle: t('plot_classifications.add', 'investments') || 'Add Classification',
      labelPath: 'name',
      renderCreateForm: (onSuccessForm, onCancelForm) => (
        <GenericCreateForm
          fields={[
            { name: 'name', type: 'alpha', label: t('plot_classifications.name', 'investments'), required: true },
          ]}
          schema={getCreatePlotClassificationFormSchema(t)}
          onSubmit={async (data) => createClassification({ ...data, is_active: true })}
          onSuccess={onSuccessForm}
          onCancel={onCancelForm}
        />
      )
    },
    {
      name: 'latitude',
      label: t('plots.location', 'investments') || 'Location',
      required: true,
      group: 'location',
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
    { name: 'longitude', hidden: true, group: 'location' },
    // { name: 'current_condition', label: t('plots.current_condition', 'investments') || 'Current Condition', group: 'additional' },
    // {
    //   name: 'service_conditions', type: 'multi-select-or-create', label: t('plots.current_condition', 'investments') || 'Current Condition', group: 'additional',
    //   searchable: true,
    //   options: serviceConditions.map(a => ({ value: a.id, label: a.name, is_default: a.is_default })),
    //   createTitle: t('common.new', 'shared') || 'New',
    //   labelPath: 'data.name',
    //   renderCreateForm: (onSuccess, onCancel) => (
    //     <GenericCreateForm
    //       fields={[
    //         { name: 'name', type: 'alpha', label: t('service_conditions.name', 'investments'), required: true },
    //       ]}
    //       schema={getCreateServiceConditionFormSchema(t)}
    //       onSubmit={(data) => createServiceCondition({ ...data, is_active: true })}
    //       onSuccess={onSuccess}
    //       onCancel={onCancel}
    //     />
    //   )
    // },

    // {
    //   name: 'service_conditions_notes', type: 'data-matrix', label: t('plots.notes', 'investments') || 'Notes', group: 'additional',
    //   matrixFields: [
    //     {
    //       label: t('service_conditions.name', 'investments'),
    //       name: "service_condition",
    //       type: "text",
    //       disabled:true
    //     },
    //     {
    //       label: t('plots.notes', 'investments') || 'Notes',
    //       name: "note",
    //       type: "text",
    //       required: true
    //     },
    //   ],
    //   rowSchema: z.object({
    //     note: z.string(),
    //     service_condition: z.string(),
    //   }),
    //   dependsOn:['service_conditions'],
    //   compute:(values) => {
    //     const currentNotes = values.service_conditions_notes || [];
    //     const newValues = (values.service_conditions || []).map((sc: any) => {
    //       const scObj = serviceConditions.find((scl: any) => scl.id === sc);
    //       const scName = scObj?.name || '';
    //       const existing = currentNotes.find((row: any) => row.service_condition === scName);
    //       return { service_condition: scName, note: existing?.note || '' };
    //     });
    //     return { numberOfRows: values.service_conditions.length, value: newValues };
    //   }
    // },
    {
      name: 'service_conditions',
      label: t('plots.current_condition', 'investments') || 'Current Condition', group: 'additional',
      type: "data-matrix",
      rowSchema: z.object({
        note: z.string(),
        id: z.number().nullable(),
      }),
      matrixFields: [
        {
          label: t('service_conditions.name', 'investments'),
          name: "id",
          type: "select-or-create",
          searchable: true,
          excludeSelected: true,
          options: serviceConditions.map(a => ({ value: a.id, label: a.name, is_default: a.is_default })),
          createTitle: t('common.new', 'shared') || 'New',
          labelPath: 'data.name',
          renderCreateForm: (onSuccess, onCancel) => (
            <GenericCreateForm
              fields={[
                { name: 'name', type: 'alpha', label: t('service_conditions.name', 'investments'), required: true },
              ]}
              schema={getCreateServiceConditionFormSchema(t)}
              onSubmit={(data) => createServiceCondition({ ...data, is_active: true })}
              onSuccess={onSuccess}
              onCancel={onCancel}
            />
          )
        },
        {
          label: t('plots.notes', 'investments') || 'Notes',
          name: "note",
          type: "text",
          required: true
        },
      ]
    },
    {
      name: 'service_status_conditions',
      label: t('plots.service_status_conditions', 'investments') || 'Service Status Conditions', group: 'additional',
      type: "data-matrix",
      rowSchema: z.object({
        note: z.string(),
        service_status: z.string(),
        id: z.number().nullable(),
      }),
      matrixFields: [
        {
          label: t('service_status_conditions.name', 'investments'),
          name: "id",
          type: "select-or-create",
          searchable: true,
          excludeSelected: true,
          options: serviceStatusConditions.map(a => ({ value: a.id, label: a.name, is_default: a.is_default })),
          createTitle: t('common.new', 'shared') || 'New',
          labelPath: 'data.name',
          renderCreateForm: (onSuccess, onCancel) => (
            <GenericCreateForm
              fields={[
                { name: 'name', type: 'alpha', label: t('service_status_conditions.name', 'investments'), required: true },
              ]}
              schema={getCreateServiceStatusConditionFormSchema(t)}
              onSubmit={(data) => createServiceStatusCondition({ ...data, is_active: true })}
              onSuccess={onSuccess}
              onCancel={onCancel}
            />
          )
        },
        {
          label: t('service_status_conditions.service_status', 'investments') || 'Service Status',
          name: "service_status",
          type: "text",
          required: true
        },
        {
          label: t('plots.notes', 'investments') || 'Notes',
          name: "note",
          type: "text",
          required: true
        },
      ]
    }
  ];

  const formGroups = [
    {
      group: 'basic_info',
      title: t('plots.group_basic_info', 'investments') || 'Basic Information',
      columns: 3,
      rows: [['code', 'identifier', 'area']],
    },
    {
      group: 'classification',
      title: t('plots.group_classification', 'investments') || 'Classification',
      columns: 2,
      rows: [['plot_area_id', 'plot_classification_id']],
    },
    {
      group: 'location',
      title: t('plots.group_location', 'investments') || 'Location',
      columns: 1,
      rows: [['latitude']],
    },
    {
      group: 'additional',
      title: t('plots.group_additional', 'investments') || 'Additional Information',
      columns: 1,
      rows: [['service_conditions'], ['service_status_conditions']],
    },
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
          {!isCreate && plot?.id && (
            <Button variant="outline" size="sm" onClick={() => setIsHistoryModalOpen(true)} className="flex items-center gap-2" requiredPermission="investments.plot-dossier-status-histories.list">
              <History size={16} />
              {t('plots.view_history', 'investments') || 'Status History'}
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
            groups={formGroups}
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
              <div className="font-medium text-text">
                {plot?.service_conditions?.length
                  ? plot.service_conditions.map((sc, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span>{sc.name}</span>
                      {sc.note && <span className="text-xs text-text-muted">({sc.note})</span>}
                    </div>
                  ))
                : '—'}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-sm text-text-muted">{t('plots.service_status_conditions', 'investments') || 'Service Status Conditions'}</span>
            <div className="font-medium text-text">
              {plot?.service_status_conditions?.length
                ? plot.service_status_conditions.map((sc, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span>{sc.name}</span>
                      {sc.service_status && <span className="text-xs text-primary">[{sc.service_status}]</span>}
                      {sc.note && <span className="text-xs text-text-muted">({sc.note})</span>}
                    </div>
                  ))
                : '—'}
            </div>
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
            {/* <div className="space-y-1 md:col-span-2 lg:col-span-3">
              <span className="text-sm text-text-muted">{t('plots.notes', 'investments') || 'Notes'}</span>
              <p className="font-medium text-text whitespace-pre-wrap">{plot?.notes || '—'}</p>
            </div> */}
          </div>
        )}
      </div>

      {plot && clickedStatus && (
        <ChangePlotStatusModal
          isOpen={!!clickedStatus}
          onClose={() => setClickedStatus(null)}
          plot={{ ...plot, status: clickedStatus }}
          onSuccess={() => window.location.reload()}
        />
      )}

      {plot && plot.id && (
        <PlotStatusHistoryModal
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          plotId={plot.id}
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