import type { CreateFeeDto, FeeFilters, UpdateFeeDto } from "../dtos/feeDtos";
import type { Fee } from "../../domain/entities/Fee";
import type { IFeeRepository } from "../../domain/repositories/IFeeRepository";

export const createManageFeesUseCase = (repository: IFeeRepository) => {
  return {
    findAllFees: (params?: FeeFilters) => {
      return repository.findAllFees(params)
    },
    findFeeById: (id: number) => {
      return repository.findFeeById(id)
    },
    createFee: (data: CreateFeeDto, idempotencyKey?: string) => {
      return repository.createFee(data, idempotencyKey)
    },
    updateFee: (id: number, data: UpdateFeeDto, idempotencyKey?: string) => {
      return repository.updateFee(id, data, idempotencyKey)
    },
    archiveFee: (fee: Pick<Fee, "id" | "name">, idempotencyKey?: string) => {
      return repository.archiveFee(fee, idempotencyKey)
    },
    activeFee: (fee: Pick<Fee, "id" | "name">, idempotencyKey?: string) => {
      return repository.activeFee(fee, idempotencyKey)
    }
  }
}