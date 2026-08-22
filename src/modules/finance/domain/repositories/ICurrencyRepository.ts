import type { DomainResponse } from "../../../../core/domain/common/responce/DomainResponse";
import type { Currency } from "../entities/Currency";

export interface ICurrencyRepository {
  findAllCurrencies(params?: any): Promise<DomainResponse<Currency[]>>;
  createCurrency(data: any, idempotencyKey?: string): Promise<DomainResponse<Currency>>;
  updateCurrency(code: string, data: any, idempotencyKey?: string): Promise<DomainResponse<Currency>>;
  deleteCurrency(currency: Pick<Currency, "code">, idempotencyKey?: string): Promise<void>;
}
