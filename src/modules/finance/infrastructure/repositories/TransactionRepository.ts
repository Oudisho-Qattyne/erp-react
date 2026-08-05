import type { ApiClient } from "../../../../core/domain/common/api/ApiClient";
import type { DomainResponse } from "../../../../core/domain/common/responce/DomainResponse";
import type { CreateTransactionDto, TransactionFilters, UpdateTransactionStatusDto } from "../../application/dtos/transactionDtos";
import type { Transaction } from "../../domain/entities/Transaction";
import type { ITransactionRepository } from "../../domain/repositories/ITransactionRepository";

function serializeParams(
  params?: TransactionFilters,
): Record<string, string | boolean | number> | undefined {
  if (!params) return undefined;
  const out: Record<string, string | boolean | number> = {};
  const { sort_by, ...rest } = params;
  for (const [key, val] of Object.entries(rest)) {
    if (val !== undefined && val !== null && val !== "") out[key] = val as string | boolean | number;
  }
  if (sort_by) {
    for (const [field, order] of Object.entries(sort_by)) {
      if (order) out[`sort_by[${field}]`] = order;
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

export const createTransactionRepository = (apiClient: ApiClient): ITransactionRepository => {
  const baseUrl = "/financial-management/transactions";

  const idempotencyConfig = (idempotencyKey?: string) =>
    idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined;

  return {
    findAllTransactions: (params) =>
      apiClient.get<DomainResponse<Transaction[]>>(baseUrl, params ? { params: serializeParams(params) } : undefined),
    createTransaction: (data, idempotencyKey) =>
      apiClient.post<DomainResponse<Transaction>, CreateTransactionDto>(
        baseUrl,
        data,
        idempotencyConfig(idempotencyKey),
      ),
    updateTransactionStatus: (id, data, idempotencyKey) =>
      apiClient.put<DomainResponse<Transaction>, UpdateTransactionStatusDto>(
        `${baseUrl}/${id}/status`,
        data,
        idempotencyConfig(idempotencyKey),
      ),
  };
};
