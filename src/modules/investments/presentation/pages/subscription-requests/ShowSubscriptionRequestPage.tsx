import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../../../../../core/presentation/context/i18n/I18nProvider';
import { Button } from '../../../../../core/presentation/layouts/ui/buttons/Button';
import { Spinner } from '../../../../../core/presentation/layouts/ui/state/Spinner';
import { ErrorState } from '../../../../../core/presentation/layouts/ui/state/ErrorState';
import { ArrowLeft } from 'lucide-react';
import { SubscriptionRequestPaper } from '../../components/subscriptionRequests/SubscriptionRequest';
import { useSubscription } from '../../hooks/useSubscription';

export function ShowSubscriptionRequestPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { direction, t } = useLanguage();
  const { selectedRequest, loading, error, getSubscriptionRequestById } = useSubscription();

  const label = (key: string) => t(`subscription_requests.${key}`, 'investments');
  const requestId = Number(id);

  useEffect(() => {
    if (!Number.isNaN(requestId)) {
      getSubscriptionRequestById(requestId).catch(() => {});
    }
  }, [requestId]);

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
          <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-green-dark text-white">
            v{selectedRequest.version}
          </span>
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