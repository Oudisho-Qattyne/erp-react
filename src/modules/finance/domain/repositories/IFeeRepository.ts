import type { DpomainResponsePaginated } from "../../../hr/domain/entities/common/DomainResponsePaginated";
import type { CreateFeeDto, FeeFilters, UpdateFeeDto } from "../../application/dtos/feeDtos";
import type { Fee } from "../entities/Fee";

export interface IFeeRepository {
  findAllFees(params?: FeeFilters): Promise<DpomainResponsePaginated<Fee[]>>;
  findFeeById(id: number): Promise<DpomainResponsePaginated<Fee> | null>;
  createFee(data: CreateFeeDto, idempotencyKey?: string): Promise<DpomainResponsePaginated<Fee>>;
  updateFee(id: number, data: UpdateFeeDto, idempotencyKey?: string): Promise<DpomainResponsePaginated<Fee>>;
  archiveFee(fee: Pick<Fee, "id" | "name">, idempotencyKey?: string): Promise<DpomainResponsePaginated<Fee>>;
  activeFee(fee: Pick<Fee, "id" | "name">, idempotencyKey?: string): Promise<DpomainResponsePaginated<Fee>>;
}