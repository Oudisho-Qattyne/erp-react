import type { ApiClient } from "../../../../core/domain/common/api/ApiClient";
import type { DomainResponse } from "../../../../core/domain/common/responce/DomainResponse";
import type { CreateCurrencyDto, CurrencyConversionRequest, CurrencyConversionResult, CurrencyFilters, UpdateCurrencyDto } from "../../application/dtos/currencyDtos";
import type { Currency } from "../../domain/entities/Currency";
import type { ICurrencyRepository } from "../../domain/repositories/ICurrencyRepository";

function serializeParams(
  params?: CurrencyFilters,
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

export const createCurrencyRepository = (apiClient: ApiClient): ICurrencyRepository => {
  const baseUrl = "/financial-management/currencies";

  const idempotencyConfig = (idempotencyKey?: string) =>
    idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined;

  return {
    findAllCurrencies: (params) =>
      apiClient.get<DomainResponse<Currency[]>>(baseUrl, params ? { params: serializeParams(params) } : undefined),
    createCurrency: (data, idempotencyKey) =>
      apiClient.post<DomainResponse<Currency>, CreateCurrencyDto>(baseUrl, data, idempotencyConfig(idempotencyKey)),
    updateCurrency: (code, data, idempotencyKey) =>
      apiClient.put<DomainResponse<Currency>, UpdateCurrencyDto>(`${baseUrl}/${code}`, data, idempotencyConfig(idempotencyKey)),
    deleteCurrency: (currency, idempotencyKey) =>
      apiClient.delete<void>(`${baseUrl}/${currency.code}`, undefined, idempotencyConfig(idempotencyKey)),
    convertCurrency: (data: CurrencyConversionRequest, idempotencyKey) =>
      apiClient.post<DomainResponse<CurrencyConversionResult>, CurrencyConversionRequest>(`${baseUrl}/convert`, data, idempotencyConfig(idempotencyKey)),
  };
};
