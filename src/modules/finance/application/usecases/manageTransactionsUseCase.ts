import type { CreateTransactionDto, TransactionFilters, UpdateTransactionStatusDto } from "../dtos/transactionDtos";
import type { ITransactionRepository } from "../../domain/repositories/ITransactionRepository";

export const createManageTransactionsUseCase = (repository: ITransactionRepository) => {
  return {
    findAllTransactions: (params?: TransactionFilters) => {
      return repository.findAllTransactions(params)
    },
    createTransaction: (data: CreateTransactionDto, idempotencyKey?: string) => {
      return repository.createTransaction(data, idempotencyKey)
    },
    updateTransactionStatus: (id: number, data: UpdateTransactionStatusDto, idempotencyKey?: string) => {
      return repository.updateTransactionStatus(id, data, idempotencyKey)
    },
  }
}
