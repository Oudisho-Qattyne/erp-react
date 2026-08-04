import { Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { useLanguage } from '../../../../core/presentation/context/i18n/I18nProvider';
import { WelcomeBanner } from '../../../../core/presentation/layouts/ui/layout/WelcomeBanner';
import { StatCard } from '../../../../core/presentation/layouts/ui/statistics/StatCard';

const MODULE = 'finance';

export function FinanceDashboardPage() {
  const { t } = useLanguage();
  const noData = t('dashboard.no_data', MODULE) || '—';

  const stats = [
    { icon: <Wallet size={18} />, label: t('dashboard.total_balance', MODULE), value: noData },
    { icon: <TrendingUp size={18} />, label: t('dashboard.income', MODULE), value: noData },
    { icon: <TrendingDown size={18} />, label: t('dashboard.expenses', MODULE), value: noData },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{t('dashboard.title', MODULE)}</h1>

      <WelcomeBanner
        title={t('dashboard.welcome_title', MODULE)}
        subtitle={t('dashboard.welcome_subtitle', MODULE)}
        stats={[
          { label: t('dashboard.total_balance', MODULE), value: '—' },
          { label: t('dashboard.income', MODULE), value: '—' },
          { label: t('dashboard.expenses', MODULE), value: '—' },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} />
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-6 animate-fade-in">
        <div className="flex items-center gap-2 mb-2">
          <PiggyBank size={18} className="text-primary" />
          <h2 className="text-lg font-bold text-text">{t('dashboard.placeholder_title', MODULE)}</h2>
        </div>
        <p className="text-sm text-text-muted">{t('dashboard.placeholder_message', MODULE)}</p>
      </div>
    </div>
  );
}
