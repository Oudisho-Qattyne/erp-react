import type { DomainResponse } from "../../../../core/domain/common/responce/DomainResponse";
import type { CreateTransactionDto, TransactionFilters, UpdateTransactionStatusDto } from "../../application/dtos/transactionDtos";
import type { Transaction } from "../entities/Transaction";

export interface ITransactionRepository {
  findAllTransactions(params?: TransactionFilters): Promise<DomainResponse<Transaction[]>>;
  createTransaction(data: CreateTransactionDto, idempotencyKey?: string): Promise<DomainResponse<Transaction>>;
  // Status can only move forward: pending -> approved | canceled
  updateTransactionStatus(id: number, data: UpdateTransactionStatusDto, idempotencyKey?: string): Promise<DomainResponse<Transaction>>;
}
