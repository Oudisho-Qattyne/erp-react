import { useEffect, useState } from "react"
import { useLanguage } from "../../../../../core/presentation/context/i18n/I18nProvider"
import { DataTable } from "../../../../../core/presentation/layouts/ui/tables/ResizableTable"
import { LoadingState } from "../../../../../core/presentation/layouts/ui/state/LoadingState"
import { ErrorState } from "../../../../../core/presentation/layouts/ui/state/ErrorState"
import { useLeaveTypes } from "../../hooks/leave/useLeaveTypes"
import { createLeaveTypeRepository } from "../../../infrastructure/leave/repository"
import { useApiClient } from "../../../../../core/presentation/context/api/ApiClinetProvider"
import { createManageLeaveTypesUseCase } from "../../../application/usecases/leave/manageLeaveTypesUseCase"
import type { EntityWithNameOnly } from "../../../../../core/domain/entities/EntityWithNameOnly"

export const UserEligibleLeaveTypes = () => {
    const [leaveTypes, setLeaveTypes] = useState<EntityWithNameOnly[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<any>(null)

    const { t } = useLanguage()
    const apiClient = useApiClient()
    const repository = createLeaveTypeRepository(apiClient)
    const useCase = createManageLeaveTypesUseCase(repository)

    const findUserEligibleLeaveTypes = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await useCase.findUserEligibleLeaveTypes()
            setLeaveTypes(res.data)
        } catch (error) {
            setError(error)
        }
        finally {
            setLoading(false)
        }
    }
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
            {loading
                ?
                <LoadingState />
                :
                error ?
                    <ErrorState message={error?.message ? error.message : "Somthing went wrong" } onRetry={findUserEligibleLeaveTypes} />
                    :
                    <DataTable
                        columns={columns}
                        data={leaveTypes}
                        rowKey="id"
                        loading={false}
                        emptyMessage={t("leave.no_eligible_leave_types", "hr") || "No eligible leave types found"}
                    />
            }
        </div>
    )
}
