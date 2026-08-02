import { useState, useCallback } from "react"
import { useApiClient } from "../../../../core/presentation/context/api/ApiClinetProvider"
import { useLanguage } from "../../../../core/presentation/context/i18n/I18nProvider"
import { createInstallmentRepository } from "../../infrastructure/repositories/InstallmentRepository"
import { createManageInstallmentsUseCase } from "../../application/usecases/manageInstallments"
import type { Contract } from "../../domain/entities/contract"
import type { Installment } from "../../domain/entities/installment"
import { toast } from "sonner"
import { useIdempotency } from "../../../../core/presentation/hooks/useIdempotency"

const OP_KEYS = ["payNextUnpaidInstallment", "updatePaymentDate"] as const

function initRecord<T>(value: T): Record<string, T> {
  return Object.fromEntries(OP_KEYS.map((k) => [k, value]))
}

export interface UseInstallmentsReturn {
  contract: Contract | null
  installments: Installment[]
  setContract: (contract: Contract | null) => void
  loading: Record<string, boolean>
  isLoading: () => boolean
  error: Record<string, string | null>
  hasErrors: () => boolean
  clearError: () => void
  payNextUnpaidInstallment: (contractId: number, paymentDate: string) => Promise<void>
  updatePaymentDate: (installmentId: number, contractId: number, paymentDate: string) => Promise<void>
}

export const useInstallments = (): UseInstallmentsReturn => {
  const apiClient = useApiClient()
  const { t } = useLanguage()

  const [contract, setContract] = useState<Contract | null>(null)
  const [loading, setLoading] = useState<Record<string, boolean>>(() => initRecord(false))
  const [error, setError] = useState<Record<string, string | null>>(() => initRecord(null))

  const repository = createInstallmentRepository(apiClient)
  const useCase = createManageInstallmentsUseCase(repository)
  const idem = useIdempotency()

  const setFnLoading = (fn: string, v: boolean) => setLoading((p) => ({ ...p, [fn]: v }))
  const setFnError = (fn: string, e: string | null) => setError((p) => ({ ...p, [fn]: e }))

  const clearError = useCallback(() => setError(initRecord(null)), [])

  const payNextUnpaidInstallment = useCallback(async (contractId: number, paymentDate: string) => {
    setFnLoading("payNextUnpaidInstallment", true)
    setFnError("payNextUnpaidInstallment", null)
    try {
      const res = await idem.run('payInstallment', { contractId, paymentDate }, (key) => useCase.payNextUnpaidInstallment(contractId, paymentDate, key))
      setContract(res.data)
      toast.success(t("installments.pay_success", "investments") || "Installment paid successfully")
    } catch (err: any) {
      const msg = err?.message || "Failed to pay installment"
      setFnError("payNextUnpaidInstallment", msg)
      toast.error(msg || t("installments.pay_error", "investments"))
      throw err
    } finally {
      setFnLoading("payNextUnpaidInstallment", false)
    }
  }, [useCase, t, idem])

  const updatePaymentDate = useCallback(async (installmentId: number, contractId: number, paymentDate: string) => {
    setFnLoading("updatePaymentDate", true)
    setFnError("updatePaymentDate", null)
    try {
      const res = await idem.run('updatePaymentDate', { installmentId, contractId, paymentDate }, (key) => useCase.updatePaymentDate(installmentId, contractId, paymentDate, key))
      setContract(res.data)
      toast.success(t("installments.update_date_success", "investments") || "Payment date updated successfully")
    } catch (err: any) {
      const msg = err?.message || "Failed to update payment date"
      setFnError("updatePaymentDate", msg)
      toast.error(msg || t("installments.update_date_error", "investments"))
      throw err
    } finally {
      setFnLoading("updatePaymentDate", false)
    }
  }, [useCase, t, idem])

  const isLoading = useCallback(() => Object.values(loading).some(Boolean), [loading])
  const hasErrors = useCallback(() => Object.values(error).some((e) => e !== null), [error])

  return {
    contract,
    installments: contract?.installments || [],
    setContract,
    loading,
    isLoading,
    error,
    hasErrors,
    clearError,
    payNextUnpaidInstallment,
    updatePaymentDate,
  }
}
