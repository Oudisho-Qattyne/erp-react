import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useLanguage } from "../../../../../core/presentation/context/i18n/I18nProvider"
import { useLeaveRequest } from "../../hooks/leaveRequest/useLeaveRequest"
import { Button } from "../../../../../core/presentation/layouts/ui/buttons/Button"
import { LoadingState } from "../../../../../core/presentation/layouts/ui/state/LoadingState"
import { ErrorState } from "../../../../../core/presentation/layouts/ui/state/ErrorState"
import { SectionCard } from "../../../../../core/presentation/layouts/ui/card/SectionCard"
import { InfoRow } from "../../../../../core/presentation/layouts/ui/card/InfoRow"
import { Dialog } from "../../../../../core/presentation/layouts/ui/dialog/Dialog"
import Input from "../../../../../core/presentation/layouts/ui/inputs/Input"
import { ArrowRight, Check, X } from "lucide-react"

const statusStyles: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600 border-gray-300",
  pending: "bg-warning/10 text-warning border-warning/20",
  approved: "bg-success/10 text-success border-success/20",
  rejected: "bg-danger/10 text-danger border-danger/20",
  cancelled: "bg-gray-100 text-gray-500 border-gray-200",
}

export function ShowLeaveRequestAdminPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t, language, direction } = useLanguage()
  const { currentLeaveRequest, findLeaveRequestById, loading, error, processLeaveRequest } = useLeaveRequest()
  const [processAction, setProcessAction] = useState<"approve" | "reject" | null>(null)
  const [reviewNotes, setReviewNotes] = useState("")

  useEffect(() => {
    if (id) findLeaveRequestById(Number(id))
  }, [id])

  const handleProcess = async () => {
    if (!processAction || !id) return
    try {
      await processLeaveRequest(Number(id), processAction, reviewNotes)
      setProcessAction(null)
      setReviewNotes("")
      findLeaveRequestById(Number(id))
    } catch {
      setProcessAction(null)
    }
  }

  if (loading.findLeaveRequestById) return <LoadingState message={t("common.loading", "shared")} />
  if (error.findLeaveRequestById || !currentLeaveRequest) {
    return (
      <ErrorState
        message={error.findLeaveRequestById || t("common.not_found", "shared")}
        onRetry={() => navigate("/hr/employee-leave-requests")}
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
        {lr.status === "pending" && (
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              leftIcon={<Check size={16} />}
              onClick={() => setProcessAction("approve")}
              isLoading={loading.processLeaveRequest}
            >
              {t("leave_request.approve", "hr")}
            </Button>
            <Button
              variant="danger"
              leftIcon={<X size={16} />}
              onClick={() => setProcessAction("reject")}
              isLoading={loading.processLeaveRequest}
            >
              {t("leave_request.reject", "hr")}
            </Button>
          </div>
        )}
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
            <InfoRow label={t("leave_request.review_notes", "hr")} value={lr.review_notes || "-"} />
          </div>
        </SectionCard>
      </div>

      <Dialog
        isOpen={processAction !== null}
        onClose={() => { setProcessAction(null); setReviewNotes("") }}
        title={processAction === "approve"
          ? (t("leave_request.approve_confirm_title", "hr") || "Approve Leave Request")
          : (t("leave_request.reject_confirm_title", "hr") || "Reject Leave Request")}
        size="md"
        actions={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button variant="outline" onClick={() => { setProcessAction(null); setReviewNotes("") }}>
              {t("common.cancel", "shared") || "Cancel"}
            </Button>
            <Button
              variant={processAction === "approve" ? "primary" : "danger"}
              onClick={handleProcess}
              isLoading={loading.processLeaveRequest}
            >
              {processAction === "approve"
                ? (t("leave_request.approve", "hr") || "Approve")
                : (t("leave_request.reject", "hr") || "Reject")}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-text-muted">
            {processAction === "approve"
              ? (t("leave_request.approve_confirm_message", "hr") || "Are you sure you want to approve this leave request?")
              : (t("leave_request.reject_confirm_message", "hr") || "Are you sure you want to reject this leave request?")}
          </p>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text">
              {t("leave_request.review_notes", "hr") || "Review Notes"}
            </label>
            <Input
              type="textarea"
              rows={4}
              value={reviewNotes}
              onChange={(val) => setReviewNotes(val as string)}
              placeholder={t("leave_request.review_notes_placeholder", "hr") || "Enter review notes..."}
              baseClasses="w-full rounded-lg border border-border bg-background px-3 py-2 text-text"
            />
          </div>
        </div>
      </Dialog>
    </div>
  )
}
