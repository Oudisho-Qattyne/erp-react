import type { DomainResponse } from "../../../../core/domain/common/responce/DomainResponse";
import type { Currency } from "../entities/Currency";
import type { CurrencyConversionRequest, CurrencyConversionResult } from "../../application/dtos/currencyDtos";

export interface ICurrencyRepository {
  findAllCurrencies(params?: any): Promise<DomainResponse<Currency[]>>;
  createCurrency(data: any, idempotencyKey?: string): Promise<DomainResponse<Currency>>;
  updateCurrency(code: string, data: any, idempotencyKey?: string): Promise<DomainResponse<Currency>>;
  deleteCurrency(currency: Pick<Currency, "code">, idempotencyKey?: string): Promise<void>;
  convertCurrency(data: CurrencyConversionRequest , idempotencyKey?: string): Promise<DomainResponse<CurrencyConversionResult>>;
}
