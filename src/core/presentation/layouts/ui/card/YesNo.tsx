import { CheckCircle, XCircle } from "lucide-react"
import { useLanguage } from "../../../context/i18n/I18nProvider"

interface YesNoProps {
  value: boolean
}

export function YesNo({ value }: YesNoProps) {
  const { t } = useLanguage()

  return value
    ? (
      <span className="inline-flex items-center gap-1 text-success">
        <CheckCircle size={16} /> {t("common.yes", "shared") || "Yes"}
      </span>
    )
    : (
      <span className="inline-flex items-center gap-1 text-text-muted">
        <XCircle size={16} /> {t("common.no", "shared") || "No"}
      </span>
    )
}
