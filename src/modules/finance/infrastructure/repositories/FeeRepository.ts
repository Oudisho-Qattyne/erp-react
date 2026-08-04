import type { ApiClient } from "../../../../core/domain/common/api/ApiClient";
import type { DpomainResponsePaginated } from "../../../hr/domain/entities/common/DomainResponsePaginated";
import type { UpdateFeeDto } from "../../application/dtos/feeDtos";
import type { Fee } from "../../domain/entities/Fee";
import type { IFeeRepository } from "../../domain/repositories/IFeeRepository";

export const createFeeRepository = (apiClient: ApiClient): IFeeRepository => {
  const baseUrl = "/finance/fees";

  const idempotencyConfig = (idempotencyKey?: string) =>
    idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined;

  return {
    findAllFees: (params) =>
      apiClient.get<DpomainResponsePaginated<Fee[]>>(baseUrl, params ? { params } : undefined),
    findFeeById: (id) =>
      apiClient.get<DpomainResponsePaginated<Fee>>(`${baseUrl}/${id}`),
    createFee: (data, idempotencyKey) =>
      apiClient.post<DpomainResponsePaginated<Fee>, Partial<Fee>>(baseUrl, data, idempotencyConfig(idempotencyKey)),
    updateFee: (id, data, idempotencyKey) =>
      apiClient.put<DpomainResponsePaginated<Fee>, UpdateFeeDto>(`${baseUrl}/${id}`, data, idempotencyConfig(idempotencyKey)),
    archiveFee: (id, idempotencyKey) =>
      apiClient.post<DpomainResponsePaginated<Fee>>(`${baseUrl}/${id}/archive`, undefined, idempotencyConfig(idempotencyKey)),
    deleteFee: (id) =>
      apiClient.delete<DpomainResponsePaginated<Fee>>(`${baseUrl}/${id}`),
  };
};
