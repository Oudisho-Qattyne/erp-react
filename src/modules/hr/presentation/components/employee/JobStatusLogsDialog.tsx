import React, { useEffect } from 'react'
import { useLanguage } from '../../../../../core/presentation/context/i18n/I18nProvider'
import { Dialog } from '../../../../../core/presentation/layouts/ui/dialog/Dialog'
import { DataTable, type ColumnDef } from '../../../../../core/presentation/layouts/ui/tables/ResizableTable'
import { LoadingState } from '../../../../../core/presentation/layouts/ui/state/LoadingState'
import { EmptyState } from '../../../../../core/presentation/layouts/ui/state/EmptyState'
import { useEmployee } from '../../hooks/employee/useEmployee'
import type { JobStatusLog } from '../../../domain/entities/jobStatus/JobStatusLog'

interface JobStatusLogsDialogProps {
  isOpen: boolean
  onClose: () => void
  employeeId: number
}

export function JobStatusLogsDialog({ isOpen, onClose, employeeId }: JobStatusLogsDialogProps) {
  const { t } = useLanguage()
  const { jobStatusLogs, loading, error, jobStatusPagination, setJobStatusPage, findJobStatusLogs } = useEmployee()

  useEffect(() => {
    if (isOpen && employeeId) {
      findJobStatusLogs(employeeId)
    }
  }, [isOpen, employeeId])

  const columns: ColumnDef<JobStatusLog>[] = [
    { key: 'id', label: '#', width: 60 },
    { key: 'job_status_id', label: t('employees.job_status', 'hr') || 'Job Status', width: 150 },
    { key: 'job_status_note', label: t('employees.job_status_note', 'hr') || 'Note', width: 200 },
    { key: 'created_at', label: t('employees.created_at', 'hr') || 'Created At', width: 160 },
  ]

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={t('employees.job_status_logs', 'hr') || 'Job Status Logs'}
      size="lg"
    >
      {loading.findJobStatusLogs ? (
        <LoadingState message={t('common.loading', 'shared') || 'Loading...'} />
      ) : error.findJobStatusLogs ? (
        <p className="text-danger text-sm">{error.findJobStatusLogs}</p>
      ) : jobStatusLogs.length === 0 ? (
        <EmptyState message={t('common.no_data', 'shared') || 'No data'} />
      ) : (
        <DataTable
          columns={columns}
          data={jobStatusLogs}
          rowKey="id"
          pagination={{
            page: jobStatusPagination.currentPage,
            totalPages: jobStatusPagination.lastPage,
            totalItems: jobStatusPagination.total,
            onPageChange: setJobStatusPage,
          }}
        />
      )}
    </Dialog>
  )
}
