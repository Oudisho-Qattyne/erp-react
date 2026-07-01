import { useEffect } from "react"
import { useLanguage } from "../../../../../core/presentation/context/i18n/I18nProvider"
import { DataTable } from "../../../../../core/presentation/layouts/ui/tables/ResizableTable"
import { LoadingState } from "../../../../../core/presentation/layouts/ui/state/LoadingState"
import { ErrorState } from "../../../../../core/presentation/layouts/ui/state/ErrorState"
import { useLeaveTypes } from "../../hooks/leave/useLeaveTypes"

export const UserEligibleLeaveTypes = () => {
    const { userEligibleLeaveTypes, loading, error, findUserEligibleLeaveTypes } = useLeaveTypes()
    const { t } = useLanguage()

    useEffect(() => {
        findUserEligibleLeaveTypes()
    }, [])

    const columns = [
        {
            key: "name", label: t("leave.name", "hr") || "Leave Type", width: 400,
            render: (row: any) => typeof row.name === "string" ? row.name : (row.name?.ar || row.name?.en || "")
        },
    ]
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">{t("leave.user_eligible_leave_types", "hr") || "User Eligible Leave Types"}</h1>
            {error.findUserEligibleLeaveTypes ? (
                <ErrorState message={error.findUserEligibleLeaveTypes} onRetry={findUserEligibleLeaveTypes} />
            ) : (
                <DataTable
                    columns={columns}
                    data={userEligibleLeaveTypes}
                    rowKey="id"
                    loading={loading.findUserEligibleLeaveTypes}
                    emptyMessage={t("leave.no_eligible_leave_types", "hr") || "No eligible leave types found"}
                />
            )}
        </div>
    )
}
