import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud } from '../../../../../core/presentation/hooks/data/useEntity';
import type { Investor } from '../../../domain/entities/investor';
import { InvestorForm } from './components/InvestorForm';
import { toast } from 'sonner';
import { handleApiError } from '../../../../../core/presentation/utils/handleApiError';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '../../../../../core/presentation/layouts/ui/buttons/Button';
import { LoadingState } from '../../../../../core/presentation/layouts/ui/state/LoadingState';
import { ErrorState } from '../../../../../core/presentation/layouts/ui/state/ErrorState';
import { InvestorInterestFormModal } from './components/InvestorInterestFormModal';
import { Trash2, Map, List } from 'lucide-react';
import { Dialog } from '../../../../../core/presentation/layouts/ui/dialog/Dialog';
import { ConfirmDialog } from '../../../../../core/presentation/layouts/ui/dialog/ConfirmDialog';
import type { PlotArea } from '../../../domain/entities/plotArea';
import type { PlotClassification } from '../../../domain/entities/plotClassification';

function InterestCard({ interest, onDelete, t }: any) {
  const [showAreas, setShowAreas] = useState(false);
  const [showClassifications, setShowClassifications] = useState(false);

  const { getAll: getAreas, entities: areas, loading: areasLoading } = useEntityCrud<PlotArea>('/investments/plot-areas', '/investments/plot-areas');
  const { getAll: getClassifications, entities: classifications, loading: classLoading } = useEntityCrud<PlotClassification>('/investments/plot-classifications', '/investments/plot-classifications');

  const handleShowAreas = () => {
    setShowAreas(true);
    if (interest.plot_area_ids && interest.plot_area_ids.length > 0) {
      const query = interest.plot_area_ids.map((id: number, i: number) => `ids[${i}]=${id}`).join('&');
      getAreas(`/investments/plot-areas?${query}`);
    }
  }

  const handleShowClassifications = () => {
    setShowClassifications(true);
    if (interest.plot_classification_ids && interest.plot_classification_ids.length > 0) {
      const query = interest.plot_classification_ids.map((id: number, i: number) => `ids[${i}]=${id}`).join('&');
      getClassifications(`/investments/plot-classifications?${query}`);
    }
  }

  return (
    <div className="p-4 bg-background rounded-lg border border-border">
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleShowAreas} className="flex items-center gap-1 text-xs">
            <Map size={14} />
            {t('investors.plot_areas', 'investments') || 'Plot Areas'} ({interest.plot_area_ids?.length || 0})
          </Button>
          <Button variant="outline" size="sm" onClick={handleShowClassifications} className="flex items-center gap-1 text-xs">
            <List size={14} />
            {t('investors.plot_classifications', 'investments') || 'Classifications'} ({interest.plot_classification_ids?.length || 0})
          </Button>
        </div>
        <Button variant="ghost" size="sm" className="text-danger hover:bg-danger/10 p-1 h-auto" onClick={() => onDelete(interest.id)} requiredPermission="investments.investors.update">
          <Trash2 size={16} />
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <span className="text-sm text-text-muted">{t('investors.min_area', 'investments') || 'Min Area'}</span>
          <p className="font-medium text-text">{interest.min_area || '—'}</p>
        </div>
        <div>
          <span className="text-sm text-text-muted">{t('investors.max_area', 'investments') || 'Max Area'}</span>
          <p className="font-medium text-text">{interest.max_area || '—'}</p>
        </div>
        <div className="col-span-2">
          <span className="text-sm text-text-muted">{t('common.notes', 'shared') || 'Notes'}</span>
          <p className="font-medium text-text">{interest.notes || '—'}</p>
        </div>
      </div>

      <Dialog isOpen={showAreas} onClose={() => setShowAreas(false)} title={t('investors.plot_areas', 'investments') || 'Plot Areas'}>
        <div className="p-4 max-h-60 overflow-y-auto">
          {areasLoading ? <div className="text-center text-sm">{t('common.loading', 'shared') || 'Loading...'}</div> : (
            areas.length > 0 ? (
              <ul className="space-y-2">
                {areas.map(a => <li key={a.id} className="p-2 bg-surface border border-border rounded">{a.name}</li>)}
              </ul>
            ) : <div className="text-center text-sm text-text-muted">{t('common.no_data', 'shared') || 'No data'}</div>
          )}
        </div>
      </Dialog>

      <Dialog isOpen={showClassifications} onClose={() => setShowClassifications(false)} title={t('investors.plot_classifications', 'investments') || 'Classifications'}>
        <div className="p-4 max-h-60 overflow-y-auto">
          {classLoading ? <div className="text-center text-sm">{t('common.loading', 'shared') || 'Loading...'}</div> : (
            classifications.length > 0 ? (
              <ul className="space-y-2">
                {classifications.map(c => <li key={c.id} className="p-2 bg-surface border border-border rounded">{c.name}</li>)}
              </ul>
            ) : <div className="text-center text-sm text-text-muted">{t('common.no_data', 'shared') || 'No data'}</div>
          )}
        </div>
      </Dialog>
    </div>
  );
}

export function EditInvestorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { getById, update } = useEntityCrud<Investor>('/investments/investors', '/investments/investors');
  const { remove: removeInterest } = useEntityCrud(`/investments/investors/${id || 0}/interests`, `/investments/investors/${id || 0}/interests`);
  const [investor, setInvestor] = useState<Investor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [interestToDelete, setInterestToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchInvestor();
  }, [id]);

  const fetchInvestor = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const response = await getById(Number(id));
      setInvestor(response?.data || null);
    } catch (err: any) {
      setError(handleApiError(err, { module: "investments", silent: true }));
    } finally {
      setLoading(false);
    }
  };
  const handleBack = () => navigate('/investments/investors');

  const handleSubmit = async (data: any) => {
    if (!id) return;
    try {
      return await update(Number(id), data);
    } catch (err: any) {
      handleApiError(err, { module: "investments" });
      throw err;
    }
  };

  const handleDeleteInterest = async () => {
    if (!interestToDelete) return;
    try {
      await removeInterest(interestToDelete);
      toast.success(t('investors.interest_deleted', 'investments') || 'Interest deleted successfully');
      setInterestToDelete(null);
      fetchInvestor();
    } catch (e : any) {
      handleApiError(e, { module: "investments" });
    }
  };

  if (loading) return <LoadingState message={t('common.loading', 'shared') || 'Loading...'} />;
  if (error || !investor) return <ErrorState message={error || 'Investor not found'} onRetry={() => fetchInvestor()} />;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={handleBack}>
          <ArrowRight size={16} /> {t('investors.back_to_list', 'investments') || 'Back to Investors'}
        </Button>
        <h1 className="text-2xl font-bold">{t('investors.edit', 'investments') || 'Edit Investor'}</h1>
      </div>



      <InvestorForm
        edit={true}
        investor={investor}
        defaultValues={investor}
        onSubmit={handleSubmit}
        onSuccess={() => {
          toast.success(t('investors.updated', 'investments') || 'Investor updated successfully');
          fetchInvestor();
        }}
        onCancel={handleBack}
        submitLabel={t('common.save', 'shared') || 'Save'}
      />

      <div className="bg-surface rounded-xl border border-border p-6 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">{t('investors.interests', 'investments') || 'Interests'}</h2>
          <Button onClick={() => setShowInterestModal(true)} variant="outline" size="sm" requiredPermission="investments.investors.update">
            {t('investors.add_interest', 'investments') || 'Add Interest'}
          </Button>
        </div>

        {investor.interests && investor.interests.length > 0 ? (
          <div className="space-y-4">
            {investor.interests.map((interest) => (
              <InterestCard key={interest.id} interest={interest} onDelete={setInterestToDelete} t={t} />
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-text-muted">
            {t('investors.no_interests', 'investments') || 'No interests added yet.'}
          </div>
        )}
      </div>

      <InvestorInterestFormModal
        isOpen={showInterestModal}
        onClose={() => setShowInterestModal(false)}
        investorId={Number(id)}
        onSuccess={() => {
          toast.success(t('investors.interest_created', 'investments') || 'Interest added successfully');
          fetchInvestor();
        }}
      />

      <ConfirmDialog
        isOpen={interestToDelete !== null}
        title={t('common.confirm_delete_title', 'shared') || 'Delete item'}
        message={t('common.confirm_delete_message', 'shared') || 'Are you sure you want to delete this item? This action cannot be undone.'}
        confirmLabel={t('common.delete', 'shared') || 'Delete'}
        cancelLabel={t('common.cancel', 'shared') || 'Cancel'}
        type="danger"
        onConfirm={handleDeleteInterest}
        onCancel={() => setInterestToDelete(null)}
      />
    </div>
  );
}
