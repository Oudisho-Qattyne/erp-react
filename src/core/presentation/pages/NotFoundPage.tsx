import { Link } from 'react-router-dom';
import { useLanguage } from '../context/i18n/I18nProvider';

export function NotFoundPage() {
  const { t } = useLanguage();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-text mb-2">
        {t('not_found.title') || 'الصفحة غير موجودة'}
      </h2>
      <p className="text-muted-foreground mb-6">
        {t('not_found.message') || 'عذراً، الصفحة التي تبحث عنها غير موجودة'}
      </p>
      <Link to="/" className="px-4 py-2 bg-primary text-white rounded-md hover:opacity-90">
        {t('not_found.back_home') || 'العودة إلى الرئيسية'}
      </Link>
    </div>
  );
}