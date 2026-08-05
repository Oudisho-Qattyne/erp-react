import type { ApiClient } from "../../../../core/domain/common/api/ApiClient";
import type { DpomainResponsePaginated } from "../../../hr/domain/entities/common/DomainResponsePaginated";
import type { CreateFeeDto, FeeFilters, UpdateFeeDto } from "../../application/dtos/feeDtos";
import type { Fee } from "../../domain/entities/Fee";
import type { IFeeRepository } from "../../domain/repositories/IFeeRepository";

function serializeParams(
  params?: FeeFilters,
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

export const createFeeRepository = (apiClient: ApiClient): IFeeRepository => {
  const baseUrl = "/financial-management/payment-fees";

  const idempotencyConfig = (idempotencyKey?: string) =>
    idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined;

  return {
    findAllFees: (params) =>
      apiClient.get<DpomainResponsePaginated<Fee[]>>(baseUrl, params ? { params: serializeParams(params) } : undefined),
    findFeeById: (id) =>
      apiClient.get<DpomainResponsePaginated<Fee>>(`${baseUrl}/${id}`),
    createFee: (data, idempotencyKey) =>
      apiClient.post<DpomainResponsePaginated<Fee>, CreateFeeDto>(baseUrl, data, idempotencyConfig(idempotencyKey)),
    updateFee: (id, data, idempotencyKey) =>
      apiClient.put<DpomainResponsePaginated<Fee>, UpdateFeeDto>(`${baseUrl}/${id}`, data, idempotencyConfig(idempotencyKey)),
    archiveFee: (fee, idempotencyKey) =>
      apiClient.put<DpomainResponsePaginated<Fee>, UpdateFeeDto>(
        `${baseUrl}/${fee.id}`,
        { name: fee.name, fee_status: "archived" },
        idempotencyConfig(idempotencyKey),
      ),
    activeFee: (fee, idempotencyKey) =>
      apiClient.put<DpomainResponsePaginated<Fee>, UpdateFeeDto>(
        `${baseUrl}/${fee.id}`,
        { name: fee.name, fee_status: "active" },
        idempotencyConfig(idempotencyKey),
      ),
  };
};
