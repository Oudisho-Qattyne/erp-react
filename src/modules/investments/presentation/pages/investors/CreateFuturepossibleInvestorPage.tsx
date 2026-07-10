import React, { useState } from 'react';
import { useLanguage } from '../../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud } from '../../../../../core/presentation/hooks/data/useEntity';
import type { Investor } from '../../../domain/entities/investor';
import { InvestorForm } from './components/InvestorForm';
import { InvestorInterestFormModal } from './components/InvestorInterestFormModal';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '../../../../../core/presentation/layouts/ui/buttons/Button';

export function CreateFuturePossibleInvestorPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { create } = useEntityCrud<Investor>('/investments/investors', '/investments/investors');
  const [createdInvestorId, setCreatedInvestorId] = useState<number | null>(null);

  const handleBack = () => navigate('/investments/investors');

  const handleSubmit = async (data: any) => {
    try {
      const newdata = {...data , is_possible_investor_in_future : true}
      return await create(newdata);
    } catch (err: any) {
      toast.error(t('investors.create_error', 'investments') || 'Failed to create possible investor');
      throw err;
    }
  };

  const handleInterestSuccess = () => {
    toast.success(t('investors.interest_created', 'investments') || 'Interest added successfully');
    navigate('/investments/investors');
  };

  const handleInterestClose = () => {
    navigate('/investments/investors');
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={handleBack}>
          <ArrowRight size={16} /> {t('investors.back_to_list', 'investments') || 'Back to Investors'}
        </Button>
        <h1 className="text-2xl font-bold">{t('investors.add', 'investments') || 'Add Possible Investor'}</h1>
      </div>

      <InvestorForm
        isCreate={true}
        onSubmit={handleSubmit}
        onSuccess={(id) => {
          toast.success(t('investors.created', 'investments') || 'Possible investor created successfully');
          setCreatedInvestorId(id);
        }}
        onCancel={handleBack}
        submitLabel={t('investors.add', 'investments') || 'Add Possible Investor'}
      />

      {createdInvestorId && (
        <InvestorInterestFormModal
          isOpen={true}
          onClose={handleInterestClose}
          investorId={createdInvestorId}
          onSuccess={handleInterestSuccess}
        />
      )}
    </div>
  );
}
