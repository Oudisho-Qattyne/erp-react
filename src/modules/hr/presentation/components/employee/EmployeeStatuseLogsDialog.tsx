import React, { useEffect } from 'react'
import { useLanguage } from '../../../../../core/presentation/context/i18n/I18nProvider'
import { Dialog } from '../../../../../core/presentation/layouts/ui/dialog/Dialog'
import { DataTable, type ColumnDef } from '../../../../../core/presentation/layouts/ui/tables/ResizableTable'
import { LoadingState } from '../../../../../core/presentation/layouts/ui/state/LoadingState'
import { EmptyState } from '../../../../../core/presentation/layouts/ui/state/EmptyState'
import { useEmployee } from '../../hooks/employee/useEmployee'
import type { EmployeeStatusLog } from '../../../domain/entities/employeeStatus/employeeStatusLog'

interface EmployeeStatusLogsDialogProps {
  isOpen: boolean
  onClose: () => void
  employeeId: number
}

export function EmployeeStatusLogsDialog({ isOpen, onClose, employeeId }: EmployeeStatusLogsDialogProps) {
  const { t } = useLanguage()
  const { employeeStatusLogs, loading, error, employeeStatusPagination, setEmployeeStatusPage, findEmployeeStatusLogs } = useEmployee()

  useEffect(() => {
    if (isOpen && employeeId) {
      findEmployeeStatusLogs(employeeId)
    }
  }, [isOpen, employeeId])

  const columns: ColumnDef<EmployeeStatusLog>[] = [
    { key: 'id', label: '#', width: 60 },
    { key: 'employee_status_id', label: t('employees.employee_status_id', 'hr') || 'Employee Status', width: 150 },
    { key: 'employee_status_note', label: t('employees.employee_status_note', 'hr') || 'Note', width: 200 },
    { key: 'created_at', label: t('employees.created_at', 'hr') || 'Created At', width: 160 },
  ]

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={t('employees.employee_status_logs', 'hr') || 'Employee Status Logs'}
      size="lg"
    >
      {loading.findEmployeeStatusLogs ? (
        <LoadingState message={t('common.loading', 'shared') || 'Loading...'} />
      ) : error.findEmployeeStatusLogs ? (
        <p className="text-danger text-sm">{error.findEmployeeStatusLogs}</p>
      ) : employeeStatusLogs.length === 0 ? (
        <EmptyState message={t('common.no_data', 'shared') || 'No data'} />
      ) : (
        <DataTable
          columns={columns}
          data={employeeStatusLogs}
          rowKey="id"
          pagination={{
            page: employeeStatusPagination.currentPage,
            totalPages: employeeStatusPagination.lastPage,
            totalItems: employeeStatusPagination.total,
            onPageChange: setEmployeeStatusPage,
          }}
        />
      )}
    </Dialog>
  )
}
