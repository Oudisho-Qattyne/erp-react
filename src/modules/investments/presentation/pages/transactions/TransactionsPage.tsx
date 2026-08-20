import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coins, Plus, type LucideIcon } from 'lucide-react';
import { useLanguage } from '../../../../../core/presentation/context/i18n/I18nProvider';
import { useAuth } from '../../../../../core/infrastructure/auth/AuthProvider';
import { Button } from '../../../../../core/presentation/layouts/ui/buttons/Button';
import { Dialog } from '../../../../../core/presentation/layouts/ui/dialog/Dialog';

const paperLayers = [
  { spread: 'rotate-[11deg] group-hover:rotate-[26deg]', color: 'bg-white' },
  { spread: 'rotate-[7deg] group-hover:rotate-[16deg]', color: 'bg-white' },
  { spread: 'rotate-[3deg] group-hover:rotate-[7deg]', color: 'bg-white' },
  { spread: '-rotate-[3deg] group-hover:-rotate-[7deg]', color: 'bg-white' },
  { spread: '-rotate-[7deg] group-hover:-rotate-[16deg]', color: 'bg-white' },
  { spread: '-rotate-[11deg] group-hover:-rotate-[26deg]', color: 'bg-white' },
];

interface TransactionCardConfig {
  key: string;
  icon: LucideIcon;
  permission?: string;
}

const transactionCards: TransactionCardConfig[] = [
  { key: 'subscription', icon: Coins, permission: 'investments.plot-reqeusts.subscription_request' },
  // { key: 'bonds', icon: Landmark },
  // { key: 'financing', icon: Banknote },
  // { key: 'dividends', icon: TrendingUp },
];

export function TransactionsPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);
  const [activeCard, setActiveCard] = useState('subscription');

  const visibleCards = transactionCards.filter(({ permission }) => !permission || hasPermission(permission));

  const openCreate = (key: string) => {
    if (key === 'subscription') {
      navigate('/investments/transactions/create');
      return;
    }
    setActiveCard(key);
    setCreateOpen(true);
  };
  return (
    <div className="p-6 w-full mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Coins size={24} className="text-primary" />
          {t('transactions.title', 'investments') || 'Transactions'}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-10 justify-items-center">
        {visibleCards.map(({ key, icon: Icon }) => (
          <div key={key} className="group relative w-72 h-80" style={{ perspective: '800px' }}>
            {paperLayers.map((layer, i) => (
              <div
                key={i}
                className={`absolute inset-1 border border-border/60 shadow-lg origin-bottom transition-transform duration-500 ease-out ${layer.color} ${layer.spread}`}
              >
                <div className="h-full w-full p-5 flex flex-col gap-3">
                  <div className="h-2.5 w-3/5 rounded bg-text-light/15" />
                  <div className="h-2.5 w-4/5 rounded bg-text-light/15" />
                  <div className="h-2.5 w-2/5 rounded bg-text-light/15" />
                </div>
              </div>
            ))}

            <div className="relative z-10 h-full w-full border border-border bg-white shadow-xl flex flex-col items-center justify-center gap-4 p-6 transition-transform duration-500 ease-out group-hover:-translate-y-1.5">
              <div className="w-16 h-16 rounded-2xl bg-gold/15 text-gold flex items-center justify-center shadow-inner">
                <Icon size={32} />
              </div>
              <h3 className="text-3xl font-black text-black">
                {t(`transactions.${key}`, 'investments') || key}
              </h3>
              <p className="text-sm text-text-muted text-center leading-relaxed">
                {t(`transactions.${key}_hint`, 'investments') || ''}
              </p>
              <Button
                leftIcon={<Plus size={16} />}
                onClick={() => openCreate(key)}
                className="mt-2"
              >
                {t(`transactions.add_${key}`, 'investments') || 'New'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title={t(`transactions.add_${activeCard}`, 'investments') || 'New'}
        size="md"
      >
        <p className="text-text-muted text-center py-6">
          {t('transactions.soon', 'investments') || 'Subscription creation form is under development'}
        </p>
      </Dialog>
    </div>
  );
}
