import { MessageCircle } from "lucide-react"
import { useLanguage } from "../../../../core/presentation/context/i18n/I18nProvider"

export function ChatEmptyState() {
  const { t } = useLanguage()
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center text-text-muted">
        <MessageCircle size={48} className="mx-auto mb-3 opacity-40" />
        <p className="text-sm">{t("empty_state.select_conversation", "chat")}</p>
      </div>
    </div>
  )
}
