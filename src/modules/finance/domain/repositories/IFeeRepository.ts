import type { DpomainResponsePaginated } from "../../../hr/domain/entities/common/DomainResponsePaginated";
import type { UpdateFeeDto } from "../../application/dtos/feeDtos";
import type { Fee } from "../entities/Fee";

export interface IFeeRepository {
  findAllFees(params?: Record<string, string | boolean | number>): Promise<DpomainResponsePaginated<Fee[]>>;
  findFeeById(id: number): Promise<DpomainResponsePaginated<Fee> | null>;
  createFee(data: Partial<Fee>, idempotencyKey?: string): Promise<DpomainResponsePaginated<Fee>>;
  updateFee(id: number, data: UpdateFeeDto, idempotencyKey?: string): Promise<DpomainResponsePaginated<Fee>>;
  archiveFee(id: number, idempotencyKey?: string): Promise<DpomainResponsePaginated<Fee>>;
  deleteFee(id: number): Promise<DpomainResponsePaginated<Fee>>;
}