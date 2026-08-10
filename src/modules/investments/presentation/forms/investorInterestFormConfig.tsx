import type { FieldConfig } from '../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import { GenericCreateForm } from '../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import type { PlotArea } from '../../domain/entities/plotArea';
import type { PlotClassification } from '../../domain/entities/plotClassification';
import type { UseEntityCrudReturn } from '../../../../core/presentation/hooks/data/useEntity';
import { getCreatePlotAreaFormSchema } from '../schemas/plotAreaForm.schema';
import { getCreatePlotClassificationFormSchema } from '../schemas/plotClassificationForm.schema';

type Translate = (key: string, module?: string) => string;

interface InvestorInterestFormDeps {
  plotAreas: PlotArea[];
  plotClassifications: PlotClassification[];
  createArea: UseEntityCrudReturn<PlotArea>['create'];
  createClassification: UseEntityCrudReturn<PlotClassification>['create'];
}

export const buildInvestorInterestFormFields = (t: Translate, deps: InvestorInterestFormDeps): FieldConfig[] => [
  {
    name: 'plot_area_ids',
    type: 'multi-select-or-create',
    label: t('investors.plot_areas', 'investments') || 'Plot Areas',
    searchable: true,
    options: deps.plotAreas.map(a => ({ value: a.id, label: a.name, is_default: a.is_default })),
    createTitle: t('common.new', 'shared') || 'New',
    labelPath: 'data.name',
    renderCreateForm: (onSuccess, onCancel) => (
      <GenericCreateForm
        fields={[
          { name: 'name', type: 'alpha', label: t('plot_areas.name', 'investments') || 'Name', required: true },
        ]}
        schema={getCreatePlotAreaFormSchema(t)}
        onSubmit={(data) => deps.createArea({ ...data, is_active: true })}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    )
  },
  {
    name: 'plot_classification_ids',
    type: 'multi-select-or-create',
    label: t('investors.plot_classifications', 'investments') || 'Plot Classifications',
    searchable: true,
    options: deps.plotClassifications.map(c => ({ value: c.id, label: c.name, is_default: c.is_default })),
    createTitle: t('common.new', 'shared') || 'New',
    labelPath: 'data.name',
    renderCreateForm: (onSuccess, onCancel) => (
      <GenericCreateForm
        fields={[
          { name: 'name', type: 'alpha', label: t('plot_classifications.name', 'investments') || 'Name', required: true },
        ]}
        schema={getCreatePlotClassificationFormSchema(t)}
        onSubmit={(data) => deps.createClassification({ ...data, is_active: true })}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    )
  },
  {
    name: 'min_area',
    type: 'number',
    label: t('investors.min_area', 'investments') || 'Min Area',
  },
  {
    name: 'max_area',
    type: 'number',
    label: t('investors.max_area', 'investments') || 'Max Area',
  },
  {
    name: 'notes',
    type: 'textarea',
    label: t('common.notes', 'shared') || 'Notes',
  }
];