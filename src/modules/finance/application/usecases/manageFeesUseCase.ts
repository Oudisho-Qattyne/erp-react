import type { CreateFeeDto, UpdateFeeDto } from "../dtos/feeDtos";
import type { IFeeRepository } from "../../domain/repositories/IFeeRepository";

export const createManageFeesUseCase = (repository: IFeeRepository) => {
  return {
    findAllFees: (params?: Record<string, string | boolean | number>) => {
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
    archiveFee: (id: number, idempotencyKey?: string) => {
      return repository.archiveFee(id, idempotencyKey)
    },
    deleteFee: (id: number) => {
      return repository.deleteFee(id)
    },
  }
}
