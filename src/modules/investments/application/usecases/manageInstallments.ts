import type { IInstallmentRepository } from "../../domain/repositories/IInstallmentRepository"

export const createManageInstallmentsUseCase = (repository: IInstallmentRepository) => {
  return {
    payNextUnpaidInstallment: (contractId: number, paymentDate: string) =>
      repository.payNextUnpaidInstallment(contractId, paymentDate),

    updatePaymentDate: (installmentId: number, contractId: number, paymentDate: string) =>
      repository.updatePaymentDate(installmentId, contractId, paymentDate),
  }
}
