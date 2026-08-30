import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../../../../../core/presentation/context/i18n/I18nProvider';
import { Button } from '../../../../../core/presentation/layouts/ui/buttons/Button';
import { Spinner } from '../../../../../core/presentation/layouts/ui/state/Spinner';
import { ErrorState } from '../../../../../core/presentation/layouts/ui/state/ErrorState';
import { ArrowLeft, Check, X, CheckCheck, Ban } from 'lucide-react';
import { SubscriptionRequestPaper } from '../../components/subscriptionRequests/SubscriptionRequest';
import { ChangeSubscriptionStatusDialog } from '../../components/subscriptionRequests/components/ChangeSubscriptionStatusDialog';
import { useSubscription } from '../../hooks/useSubscription';
import { canShowSubscriptionAction } from '../../utils/subscriptionActions';

type StatusActionKey = 'approve' | 'reject' | 'complete' | 'cancel';

export function ShowSubscriptionRequestPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { direction, t } = useLanguage();
  const {
    selectedRequest,
    loading,
    error,
    getSubscriptionRequestById,
    approveSubscriptionRequest,
    rejectSubscriptionRequest,
    cancelSubscriptionRequestByGeneralManager,
    completeSubscriptionRequest,
  } = useSubscription();

  const label = (key: string) => t(`subscription_requests.${key}`, 'investments');
  const requestId = Number(id);
  const plotId = selectedRequest?.plot_id ?? 0;

  useEffect(() => {
    if (!Number.isNaN(requestId)) {
      getSubscriptionRequestById(requestId).catch(() => {});
    }
  }, [requestId]);

  const [pendingAction, setPendingAction] = useState<StatusActionKey | null>(null);

  const actionFns: Record<StatusActionKey, (plotId: number, subRequestId: number, notes?: string) => Promise<void>> = {
    approve: approveSubscriptionRequest,
    reject: rejectSubscriptionRequest,
    complete: completeSubscriptionRequest,
    cancel: cancelSubscriptionRequestByGeneralManager,
  };

  const handleConfirmAction = async (notes: string) => {
    if (!pendingAction) return;
    try {
      await actionFns[pendingAction](plotId, requestId, notes);
      await getSubscriptionRequestById(requestId);
      setPendingAction(null);
    } catch {
      setPendingAction(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate('/investments/subscription-requests')}>
            <ArrowLeft size={16} className={direction === 'rtl' ? 'rotate-180' : ''} />
            {label('back')}
          </Button>
          <h1 className="text-xl font-bold text-text">{label('detail_title').replace('{id}', String(requestId))}</h1>
        </div>
        {selectedRequest && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-green-dark text-white">
              v{selectedRequest.version}
            </span>
            {canShowSubscriptionAction(selectedRequest.status, 'approve') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPendingAction('approve')}
                className="text-success hover:text-success"
                isLoading={loading['approveSubscriptionRequest']}
              >
                <Check size={16} />
                {label('approve')}
              </Button>
            )}
            {canShowSubscriptionAction(selectedRequest.status, 'reject') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPendingAction('reject')}
                className="text-danger hover:text-danger"
                isLoading={loading['rejectSubscriptionRequest']}
              >
                <X size={16} />
                {label('reject')}
              </Button>
            )}
            {canShowSubscriptionAction(selectedRequest.status, 'complete') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPendingAction('complete')}
                className="text-success hover:text-success"
                isLoading={loading['completeSubscriptionRequest']}
              >
                <CheckCheck size={16} />
                {label('complete')}
              </Button>
            )}
            {canShowSubscriptionAction(selectedRequest.status, 'cancel') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPendingAction('cancel')}
                className="text-danger hover:text-danger"
                isLoading={loading['cancelSubscriptionRequestByGeneralManager']}
              >
                <Ban size={16} />
                {label('cancel')}
              </Button>
            )}
            <ChangeSubscriptionStatusDialog
              isOpen={pendingAction !== null}
              title={`${(pendingAction && label(pendingAction)) || ''} — ${label('detail_title').replace('{id}', String(requestId))}`}
              message={label('note_message') || ''}
              confirmLabel={pendingAction ? label(pendingAction) : undefined}
              danger={pendingAction === 'reject' || pendingAction === 'cancel'}
              onConfirm={handleConfirmAction}
              onCancel={() => setPendingAction(null)}
            />
          </div>
        )}
      </div>

      {loading['getSubscriptionRequestById'] ? (
        <div className="flex items-center justify-center py-16">
          <Spinner size="xl" className="mx-auto text-primary" />
        </div>
      ) : error['getSubscriptionRequestById'] ? (
        <ErrorState message={error['getSubscriptionRequestById']} onRetry={() => getSubscriptionRequestById(requestId)} />
      ) : selectedRequest ? (
        <SubscriptionRequestPaper request={selectedRequest} />
      ) : (
        <p className="text-text-muted">{label('not_found')}</p>
      )}
    </div>
  );
}