import type { FieldConfig, GroupConfig } from '../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import { GenericCreateForm } from '../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import { SelectOnMap } from '../../../../core/presentation/layouts/ui/inputs/SelectOnMap';
import type { PlotArea } from '../../domain/entities/plotArea';
import type { PlotClassification } from '../../domain/entities/plotClassification';
import type { ServiceStatusCondition } from '../../domain/entities/serviceStatusCondition';
import type { UseEntityCrudReturn } from '../../../../core/presentation/hooks/data/useEntity';
import { getCreatePlotAreaFormSchema } from '../schemas/plotAreaForm.schema';
import { getCreatePlotClassificationFormSchema } from '../schemas/plotClassificationForm.schema';
import { getCreateServiceStatusConditionFormSchema } from '../schemas/serviceStatusConditionForm.schema';
import z from 'zod';

type Translate = (key: string, module?: string) => string;

interface PlotFormDeps {
  plotAreas: PlotArea[];
  classifications: PlotClassification[];
  serviceStatusConditions: ServiceStatusCondition[];
  createPlotArea: UseEntityCrudReturn<PlotArea>['create'];
  createClassification: UseEntityCrudReturn<PlotClassification>['create'];
  createServiceStatusCondition: UseEntityCrudReturn<ServiceStatusCondition>['create'];
}

export const buildPlotFormFields = (t: Translate, deps: PlotFormDeps): FieldConfig[] => [
  { name: 'code', label: t('plots.code', 'investments') || 'Code', required: true, type: 'numeric', group: 'basic_info' },
  { name: 'identifier', label: t('plots.identifier', 'investments') || 'Identifier', required: true, type: 'numeric', group: 'basic_info' },
  { name: 'area', type: 'numeric', label: t('plots.area', 'investments') || 'Area', required: true, group: 'basic_info' },
  {
    name: 'plot_area_id',
    type: 'select-or-create',
    label: t('plots.plot_area_id', 'investments') || 'Plot Area',
    required: true,
    group: 'classification',
    options: deps.plotAreas.map(pa => ({ value: pa.id, label: pa.name, is_default: pa.is_default })),
    createTitle: t('plot_areas.add', 'investments') || 'Add Plot Area',
    labelPath: 'name',
    renderCreateForm: (onSuccessForm, onCancelForm) => (
      <GenericCreateForm
        fields={[
          { name: 'name', type: 'alpha', label: t('plot_areas.name', 'investments'), required: true },
        ]}
        schema={getCreatePlotAreaFormSchema(t)}
        onSubmit={async (data) => deps.createPlotArea({ ...data, is_active: true })}
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
    options: deps.classifications.map(pc => ({ value: pc.id, label: pc.name, is_default: pc.is_default })),
    createTitle: t('plot_classifications.add', 'investments') || 'Add Classification',
    labelPath: 'name',
    renderCreateForm: (onSuccessForm, onCancelForm) => (
      <GenericCreateForm
        fields={[
          { name: 'name', type: 'alpha', label: t('plot_classifications.name', 'investments'), required: true },
        ]}
        schema={getCreatePlotClassificationFormSchema(t)}
        onSubmit={async (data) => deps.createClassification({ ...data, is_active: true })}
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
  {
    name: 'service_status_conditions',
    label: t('plots.service_status_conditions', 'investments') || 'Service Status Conditions', group: 'additional',
    type: 'data-matrix',
    rowSchema: z.object({
      note: z.string(),
      service_status: z.string(),
      id: z.number().nullable(),
    }),
    matrixFields: [
      {
        label: t('service_status_conditions.name', 'investments'),
        name: 'id',
        type: 'select-or-create',
        searchable: true,
        excludeSelected: true,
        options: deps.serviceStatusConditions.map(a => ({ value: a.id, label: a.name, is_default: a.is_default })),
        createTitle: t('common.new', 'shared') || 'New',
        labelPath: 'data.name',
        renderCreateForm: (onSuccess, onCancel) => (
          <GenericCreateForm
            fields={[
              { name: 'name', type: 'alpha', label: t('service_status_conditions.name', 'investments'), required: true },
            ]}
            schema={getCreateServiceStatusConditionFormSchema(t)}
            onSubmit={(data) => deps.createServiceStatusCondition({ ...data, is_active: true })}
            onSuccess={onSuccess}
            onCancel={onCancel}
          />
        )
      },
      {
        label: t('service_status_conditions.service_status', 'investments') || 'Service Status',
        name: 'service_status',
        type: 'text',
        required: true
      },
      {
        label: t('plots.notes', 'investments') || 'Notes',
        name: 'note',
        type: 'text',
        required: true
      },
    ]
  }
];

export const buildPlotFormGroups = (t: Translate): GroupConfig[] => [
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
    rows: [['service_status_conditions']],
  },
];