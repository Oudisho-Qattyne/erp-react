import type { DomainResponse } from "../../../../core/domain/common/responce/DomainResponse";
import type { Contract } from "../entities/contract";

export interface IInstallmentRepository {
    payNextUnpaidInstallment: (contract_id: number, payment_date: string) => Promise<DomainResponse<Contract>>;
    updatePaymentDate: (installmentId: number, contract_id: number, payment_date: string) => Promise<DomainResponse<Contract>>;
}