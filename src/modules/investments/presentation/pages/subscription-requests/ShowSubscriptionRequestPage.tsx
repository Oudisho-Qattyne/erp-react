import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../../../../../core/presentation/context/i18n/I18nProvider';
import { Button } from '../../../../../core/presentation/layouts/ui/buttons/Button';
import { ArrowLeft } from 'lucide-react';
import { SubscriptionRequestPaper } from '../../components/subscriptionRequests/SubscriptionRequest';
import { mockSubscriptionRequests } from '../../../domain/entities/subscriptionRequests/mockSubscriptionRequests';

export function ShowSubscriptionRequestPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { direction, t } = useLanguage();

  const label = (key: string) => t(`subscription_requests.${key}`, 'investments');

  const request = useMemo(
    () => mockSubscriptionRequests.find(r => r.payload.id === Number(id)),
    [id]
  );

  if (!request) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/investments/subscription-requests')}>
          <ArrowLeft size={16} />
          {label('back')}
        </Button>
        <p className="text-text-muted">{label('not_found')}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate('/investments/subscription-requests')}>
            <ArrowLeft size={16} className={direction === 'rtl' ? 'rotate-180' : ''} />
            {label('back')}
          </Button>
          <h1 className="text-xl font-bold text-text">{label('detail_title').replace('{id}', String(request.payload.id))}</h1>
        </div>
        <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-green-dark text-white">
          v{request.version}
        </span>
      </div>

      <SubscriptionRequestPaper request={request} />
    </div>
  );
}
