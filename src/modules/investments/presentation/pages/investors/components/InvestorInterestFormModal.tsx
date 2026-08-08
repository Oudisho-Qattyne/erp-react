import React from 'react';
import { useLanguage } from '../../../../../../core/presentation/context/i18n/I18nProvider';
import { GenericCreateForm } from '../../../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import { Dialog } from '../../../../../../core/presentation/layouts/ui/dialog/Dialog';
import { useEntityCrud } from '../../../../../../core/presentation/hooks/data/useEntity';
import { getCreateInvestorInterestFormSchema } from '../../../schemas/investorInterestForm.schema';
import type { PlotArea } from '../../../../domain/entities/plotArea';
import type { PlotClassification } from '../../../../domain/entities/plotClassification';
import { buildInvestorInterestFormFields } from '../../../forms/investorInterestFormConfig';

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

  const fields = buildInvestorInterestFormFields(t, {
    plotAreas,
    plotClassifications,
    createArea,
    createClassification,
  });

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
