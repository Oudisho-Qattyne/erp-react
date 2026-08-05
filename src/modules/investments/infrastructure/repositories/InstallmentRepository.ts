import type { ApiClient } from "../../../../core/domain/common/api/ApiClient"
import type { IInstallmentRepository } from "../../domain/repositories/IInstallmentRepository"

export const createInstallmentRepository = (apiClient: ApiClient): IInstallmentRepository => {
    const baseUrl = "/investments/contracts/installments"
    return ({
        payNextUnpaidInstallment: (contractId: number, paymentDate: string, idempotencyKey?: string) => apiClient.post(`${baseUrl}/pay` , {contract_id :contractId, payment_date:paymentDate}, idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined),
        updatePaymentDate: (installmentId : number, contractId: number, paymentDate: string, idempotencyKey?: string) =>  apiClient.put(`${baseUrl}/${installmentId}`,{contract_id :contractId, payment_date:paymentDate}, idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined)
    })
}