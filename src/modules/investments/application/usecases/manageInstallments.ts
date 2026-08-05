import type { IInstallmentRepository } from "../../domain/repositories/IInstallmentRepository"

export const createManageInstallmentsUseCase = (repository: IInstallmentRepository) => {
  return {
    payNextUnpaidInstallment: (contractId: number, paymentDate: string, idempotencyKey?: string) =>
      repository.payNextUnpaidInstallment(contractId, paymentDate, idempotencyKey),

    updatePaymentDate: (installmentId: number, contractId: number, paymentDate: string, idempotencyKey?: string) =>
      repository.updatePaymentDate(installmentId, contractId, paymentDate, idempotencyKey),
  }
}
