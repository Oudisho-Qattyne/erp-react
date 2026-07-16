import { useState, useCallback } from "react"
import { useApiClient } from "../../../../core/presentation/context/api/ApiClinetProvider"
import { useLanguage } from "../../../../core/presentation/context/i18n/I18nProvider"
import { createDossierPartnersRepository } from "../../infrastructure/repositories/DossierPartnersRepository"
import { createManageDossierPartnersUseCase } from "../../application/usecases/manageDossierPartners"
import type { Investor } from "../../domain/entities/investor"
import { toast } from "sonner"

const OP_KEYS = ["getPartners", "addPartners", "deletePartners"] as const

function initRecord<T>(value: T): Record<string, T> {
  return Object.fromEntries(OP_KEYS.map((k) => [k, value]))
}

export interface UseDossierPartnersReturn {
  partners: Investor[]
  setPartners: (partners: Investor[]) => void
  loading: Record<string, boolean>
  isLoading: () => boolean
  error: Record<string, string | null>
  hasErrors: () => boolean
  clearError: () => void
  getPartners: (plotId: number, dossierId: number) => Promise<void>
  addPartners: (plotId: number, dossierId: number, investorIds: number[]) => Promise<void>
  deletePartners: (plotId: number, dossierId: number, investorIds: number[]) => Promise<void>
}

export const useDossierPartners = (): UseDossierPartnersReturn => {
  const apiClient = useApiClient()
  const { t } = useLanguage()

  const [partners, setPartners] = useState<Investor[]>([])
  const [loading, setLoading] = useState<Record<string, boolean>>(() => initRecord(false))
  const [error, setError] = useState<Record<string, string | null>>(() => initRecord(null))

  const repository = createDossierPartnersRepository(apiClient)
  const useCase = createManageDossierPartnersUseCase(repository)

  const setFnLoading = (fn: string, v: boolean) => setLoading((p) => ({ ...p, [fn]: v }))
  const setFnError = (fn: string, e: string | null) => setError((p) => ({ ...p, [fn]: e }))

  const clearError = useCallback(() => setError(initRecord(null)), [])

  const getPartners = useCallback(async (plotId: number, dossierId: number) => {
    setFnLoading("getPartners", true)
    setFnError("getPartners", null)
    try {
      const res = await useCase.getPartners(plotId, dossierId)
      setPartners(res.data?.partners || [])
    } catch (err: any) {
      const msg = err?.message || "Failed to fetch partners"
      setFnError("getPartners", msg)
      toast.error(msg || t("dossier.load_error", "investments"))
    } finally {
      setFnLoading("getPartners", false)
    }
  }, [useCase, t])

  const addPartners = useCallback(async (plotId: number, dossierId: number, investorIds: number[]) => {
    setFnLoading("addPartners", true)
    setFnError("addPartners", null)
    try {
      const res = await useCase.addPartners(plotId, dossierId, investorIds)
      setPartners(res.data?.partners || [])
      toast.success(t("investors.add_investors_success", "investments") || "Partners added successfully")
    } catch (err: any) {
      const msg = err?.message || "Failed to add partners"
      setFnError("addPartners", msg)
      toast.error(msg || t("investors.add_investors_error", "investments"))
      throw err
    } finally {
      setFnLoading("addPartners", false)
    }
  }, [useCase, t])

  const deletePartners = useCallback(async (plotId: number, dossierId: number, investorIds: number[]) => {
    setFnLoading("deletePartners", true)
    setFnError("deletePartners", null)
    try {
      const res = await useCase.deletePartners(plotId, dossierId, investorIds)
      setPartners(res.data?.partners || [])
      toast.success(t("investors.remove_investors_success", "investments") || "Partners removed successfully")
    } catch (err: any) {
      const msg = err?.message || "Failed to remove partners"
      setFnError("deletePartners", msg)
      toast.error(msg || t("investors.remove_investors_error", "investments"))
      throw err
    } finally {
      setFnLoading("deletePartners", false)
    }
  }, [useCase, t])

  const isLoading = useCallback(() => Object.values(loading).some(Boolean), [loading])
  const hasErrors = useCallback(() => Object.values(error).some((e) => e !== null), [error])

  return {
    partners,
    setPartners,
    loading,
    isLoading,
    error,
    hasErrors,
    clearError,
    getPartners,
    addPartners,
    deletePartners,
  }
}
