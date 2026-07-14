import React from 'react';
import { useLanguage } from '../../../../../../core/presentation/context/i18n/I18nProvider';
import { GenericCreateForm, type FieldConfig } from '../../../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import { Dialog } from '../../../../../../core/presentation/layouts/ui/dialog/Dialog';
import { useEntityCrud } from '../../../../../../core/presentation/hooks/data/useEntity';
import { getCreateInvestorInterestFormSchema } from '../../../schemas/investorInterestForm.schema';
import type { PlotArea } from '../../../../domain/entities/plotArea';
import type { PlotClassification } from '../../../../domain/entities/plotClassification';

import { getCreatePlotAreaFormSchema } from '../../../schemas/plotAreaForm.schema';
import { getCreatePlotClassificationFormSchema } from '../../../schemas/plotClassificationForm.schema';

interface InvestorInterestFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  investorId: number;
  onSuccess: () => void;
}

export function InvestorInterestFormModal({ isOpen, onClose, investorId, onSuccess }: InvestorInterestFormModalProps) {
  const { t } = useLanguage();
  
  const { create: createInterest } = useEntityCrud(`/investments/investors/${investorId}/interests`, `/investments/investors/${investorId}/interests`);
  const { entities: plotAreas, getAll: getAreas, create: createArea } = useEntityCrud<PlotArea>('/investments/plot-areas', '/investments/plot-areas');
  const { entities: plotClassifications, getAll: getClassifications, create: createClassification } = useEntityCrud<PlotClassification>('/investments/plot-classifications', '/investments/plot-classifications');

  React.useEffect(() => {
    if (isOpen) {
      getAreas('/investments/plot-areas?is_active=true');
      getClassifications('/investments/plot-classifications?is_active=true');
    }
  }, [isOpen, getAreas, getClassifications]);

  const handleSubmit = async (data: any) => {
    await createInterest(data);
  };

  const fields: FieldConfig[] = [
    {
      name: 'plot_area_ids',
      type: 'multi-select-or-create',
      label: t('investors.plot_areas', 'investments') || 'Plot Areas',
      searchable: true,
      options: plotAreas.map(a => ({ value: a.id, label: a.name, is_default: a.is_default })),
      createTitle: t('common.new', 'shared') || 'New',
      labelPath: 'data.name',
      renderCreateForm: (onSuccess, onCancel) => (
        <GenericCreateForm
          fields={[
            { name: 'name', label: t('plot_areas.name', 'investments') || 'Name', required: true },
          ]}
          schema={getCreatePlotAreaFormSchema(t)}
          onSubmit={(data) => createArea({ ...data, is_active: true })}
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
      options: plotClassifications.map(c => ({ value: c.id, label: c.name, is_default: c.is_default })),
      createTitle: t('common.new', 'shared') || 'New',
      labelPath: 'data.name',
      renderCreateForm: (onSuccess, onCancel) => (
        <GenericCreateForm
          fields={[
            { name: 'name', label: t('plot_classifications.name', 'investments') || 'Name', required: true },
          ]}
          schema={getCreatePlotClassificationFormSchema(t)}
          onSubmit={(data) => createClassification({ ...data, is_active: true })}
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

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={t('investors.add_interest', 'investments') || 'Add Investor Interest'}
      size="md"
    >
      <div className="p-4">
        <GenericCreateForm
          schema={getCreateInvestorInterestFormSchema(t)}
          fields={fields}
          onSubmit={handleSubmit}
          onSuccess={() => {
            onSuccess();
            onClose();
          }}
          onCancel={onClose}
          submitLabel={t('common.save', 'shared') || 'Save'}
        />
      </div>
    </Dialog>
  );
}
