import { useLanguage } from './I18nProvider';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value as 'en' | 'ar')}
      className="px-3 py-2 rounded-md bg-secondary text-secondary-foreground border border-border"
    >
      <option value="en">English</option>
      <option value="ar">العربية</option>
    </select>
  );
};

export default LanguageSwitcher;