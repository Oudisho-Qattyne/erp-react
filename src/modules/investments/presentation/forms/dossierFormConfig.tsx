import type { FieldConfig } from '../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import { FormInput } from '../../../../core/presentation/layouts/ui/inputs/FormInput';
import type { DossierFormData } from '../schemas/dossier.schema';
import type { Dossier } from '../../domain/entities/dossier';
import type { PlotStatus } from '../../domain/valueObjects/plots/plotStatus';

type Translate = (key: string, module?: string) => string;

const DOSSIER_STATUSES = [
  'draft',
  'allocatable',
  'active',
  'cancelled',
] as const;

const normalizeDate = (dateStr: string): string => {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  const isoMatch = dateStr.match(/^(\d{4}-\d{2}-\d{2})/);
  if (isoMatch) return isoMatch[1];
  const parts = dateStr.split('-');
  if (parts.length === 3 && parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
};

export interface DossierFormDeps {
  plotStatus: PlotStatus;
}

export const buildDossierFormFields = (t: Translate, deps: DossierFormDeps): FieldConfig<DossierFormData>[] => {
  const statusOptions = DOSSIER_STATUSES.map((value) => ({
    value,
    label: t(`dossier.status_${value}`, 'investments') || value,
  }));

  return [
    {
      name: 'dossier_number',
      type: 'numeric',
      label: t('dossier.number', 'investments') || 'Dossier Number',
      required: true,
      placeholder: t('dossier.number_placeholder', 'investments') || 'Enter dossier number',
    },
    {
      name: 'dossier_date',
      type: 'date',
      label: t('dossier.date', 'investments') || 'Dossier Date',
      required: true,
    },
    {
      name: 'status',
      label: t('dossier.status', 'investments') || 'Status',
      required: true,
      render: (methods) => (
        <FormInput
          name="status"
          type="select"
          label={t('dossier.status', 'investments') || 'Status'}
          options={statusOptions}
          disabled={deps.plotStatus === 'allocated' && methods.watch('status') === 'active'}
        />
      ),
    },
  ];
};

export const buildDossierDefaultValues = (dossier?: Dossier | null): DossierFormData =>
  dossier
    ? {
        dossier_number: dossier.dossier_number,
        dossier_date: normalizeDate(dossier.dossier_date),
        status: dossier.status,
      }
    : {
        dossier_number: '',
        dossier_date: new Date().toISOString().split('T')[0],
        status: 'draft',
      };