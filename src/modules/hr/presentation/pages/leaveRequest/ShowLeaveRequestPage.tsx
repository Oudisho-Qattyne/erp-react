import { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useLanguage } from "../../../../../core/presentation/context/i18n/I18nProvider"
import { useLeaveRequest } from "../../hooks/leaveRequest/useLeaveRequest"
import { Button } from "../../../../../core/presentation/layouts/ui/buttons/Button"
import { LoadingState } from "../../../../../core/presentation/layouts/ui/state/LoadingState"
import { ErrorState } from "../../../../../core/presentation/layouts/ui/state/ErrorState"
import { SectionCard } from "../../../../../core/presentation/layouts/ui/card/SectionCard"
import { InfoRow } from "../../../../../core/presentation/layouts/ui/card/InfoRow"
import { YesNo } from "../../../../../core/presentation/layouts/ui/card/YesNo"
import { ArrowRight } from "lucide-react"

const statusStyles: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600 border-gray-300",
  pending: "bg-warning/10 text-warning border-warning/20",
  approved: "bg-success/10 text-success border-success/20",
  rejected: "bg-danger/10 text-danger border-danger/20",
  cancelled: "bg-gray-100 text-gray-500 border-gray-200",
}

export function ShowLeaveRequestPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t, language, direction } = useLanguage()
  const { currentLeaveRequest, findLeaveRequestById, loading, error } = useLeaveRequest()

  useEffect(() => {
    if (id) findLeaveRequestById(Number(id))
  }, [id])

  if (loading.findLeaveRequestById) return <LoadingState message={t("common.loading", "shared")} />
  if (error.findLeaveRequestById || !currentLeaveRequest) {
    return (
      <ErrorState
        message={error.findLeaveRequestById || t("common.not_found", "shared")}
        onRetry={() => navigate("/hr/my-leave-requests")}
        retryLabel={t("common.back_to_list", "shared")}
      />
    )
  }

  const lr = currentLeaveRequest
  const getLeaveTypeName = () => {
    if (lr.leave_type?.name) {
      const n = lr.leave_type.name
      return typeof n === "string" ? n : language === "ar" ? n.ar : n.en
    }
    return `#${lr.leave_type_id}`
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 p-4">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          leftIcon={<ArrowRight size={18} className={direction === "rtl" ? "rotate-180" : ""} />}
          className="text-text-muted hover:text-text"
        >
          {t("common.back", "shared")}
        </Button>
      </div>

      <div className="bg-card/60 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-border shadow-sm">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary via-primary-light to-primary opacity-70" />
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-text">
              {t("leave_request.request_details", "hr")} #{lr.id}
            </h1>
            {lr.employee && (
              <p className="text-text-muted mt-1">{lr.employee.full_name}</p>
            )}
          </div>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${statusStyles[lr.status] || ""}`}>
            {t(`leave_request.status_${lr.status}`, "hr") || lr.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title={t("leave_request.request_details", "hr")}>
          <div className="space-y-4">
            <InfoRow label={t("leave_request.leave_type", "hr")} value={getLeaveTypeName()} />
            <InfoRow label={t("leave_request.start_date", "hr")} value={lr.start_date} />
            <InfoRow label={t("leave_request.end_date", "hr")} value={lr.end_date} />
            <InfoRow label={t("leave_request.requested_units", "hr")} value={lr.requested_units} />
            <InfoRow label={t("leave_request.reason", "hr")} value={lr.reason || "-"} />
          </div>
        </SectionCard>

        <SectionCard title={t("leave_request.review_notes", "hr")}>
          <div className="space-y-4">
            <InfoRow
              label={t("leave_request.review_notes", "hr")}
              value={lr.review_notes || "-"}
            />
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
