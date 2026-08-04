import type { ApiClient } from "../../../../core/domain/common/api/ApiClient";
import type { DpomainResponsePaginated } from "../../../hr/domain/entities/common/DomainResponsePaginated";
import type { CreateTransactionDto, UpdateTransactionStatusDto } from "../../application/dtos/transactionDtos";
import type { Transaction } from "../../domain/entities/Transaction";
import type { ITransactionRepository } from "../../domain/repositories/ITransactionRepository";

export const createTransactionRepository = (apiClient: ApiClient): ITransactionRepository => {
  const baseUrl = "/financial-management/transactions";

  const idempotencyConfig = (idempotencyKey?: string) =>
    idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined;

  return {
    findAllTransactions: (params) =>
      apiClient.get<DpomainResponsePaginated<Transaction[]>>(baseUrl, params ? { params } : undefined),
    createTransaction: (data, idempotencyKey) =>
      apiClient.post<DpomainResponsePaginated<Transaction>, CreateTransactionDto>(
        baseUrl,
        data,
        idempotencyConfig(idempotencyKey),
      ),
    updateTransactionStatus: (id, data, idempotencyKey) =>
      apiClient.put<DpomainResponsePaginated<Transaction>, UpdateTransactionStatusDto>(
        `${baseUrl}/${id}`,
        data,
        idempotencyConfig(idempotencyKey),
      ),
  };
};
