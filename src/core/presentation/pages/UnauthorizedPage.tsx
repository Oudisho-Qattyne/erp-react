import { Link } from 'react-router-dom';
import { useLanguage } from '../context/i18n/I18nProvider';
import { ShieldOff } from 'lucide-react';

export function UnauthorizedPage() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <ShieldOff size={64} className="text-danger mb-4" />
      <h1 className="text-6xl font-bold text-danger mb-4">403</h1>
      <h2 className="text-2xl font-semibold text-text mb-2">
        {t('unauthorized.title') || 'غير مصرح بالوصول'}
      </h2>
      <p className="text-muted-foreground mb-6">
        {t('unauthorized.message') || 'ليس لديك الصلاحية للوصول إلى هذه الصفحة'}
      </p>
      <Link to="/" className="px-4 py-2 bg-primary text-white rounded-md hover:opacity-90">
        {t('unauthorized.back_home') || 'العودة إلى الرئيسية'}
      </Link>
    </div>
  );
}
