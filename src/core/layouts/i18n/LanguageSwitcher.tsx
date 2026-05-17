import { useTranslation } from './I18nProvider'

const LanguageSwitcher = () => {
  const { locale, setLocale } = useTranslation()

  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value)}
      className="px-3 py-2 rounded-md bg-secondary text-secondary-foreground border border-border"
    >
      <option value="en">English</option>
      <option value="ar">العربية</option>
    </select>
  )
}

export default LanguageSwitcher