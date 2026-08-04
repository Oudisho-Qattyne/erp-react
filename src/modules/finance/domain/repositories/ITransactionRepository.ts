import type { DpomainResponsePaginated } from "../../../hr/domain/entities/common/DomainResponsePaginated";
import type { CreateTransactionDto, TransactionFilters, UpdateTransactionStatusDto } from "../../application/dtos/transactionDtos";
import type { Transaction } from "../entities/Transaction";

export interface ITransactionRepository {
  findAllTransactions(params?: TransactionFilters): Promise<DpomainResponsePaginated<Transaction[]>>;
  createTransaction(data: CreateTransactionDto, idempotencyKey?: string): Promise<DpomainResponsePaginated<Transaction>>;
  // Status can only move forward: pending -> approved | canceled
  updateTransactionStatus(id: number, data: UpdateTransactionStatusDto, idempotencyKey?: string): Promise<DpomainResponsePaginated<Transaction>>;
}
