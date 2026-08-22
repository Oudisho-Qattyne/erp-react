import type { DomainResponse } from "../../../../core/domain/common/responce/DomainResponse";
import type { Fee } from "../entities/Fee";

export interface IFeeRepository {
  findAllFees(params?: any): Promise<DomainResponse<Fee[]>>;
  findFeeById(id: number): Promise<DomainResponse<Fee> | null>;
  createFee(data: any, idempotencyKey?: string): Promise<DomainResponse<Fee>>;
  updateFee(id: number, data: any, idempotencyKey?: string): Promise<DomainResponse<Fee>>;
  archiveFee(fee: Pick<Fee, "id" | "name">, idempotencyKey?: string): Promise<DomainResponse<Fee>>;
  activeFee(fee: Pick<Fee, "id" | "name">, idempotencyKey?: string): Promise<DomainResponse<Fee>>;
}