import type { CreateCurrencyDto, CurrencyConversionRequest, CurrencyConversionResult, CurrencyFilters, UpdateCurrencyDto } from "../dtos/currencyDtos";
import type { Currency } from "../../domain/entities/Currency";
import type { ICurrencyRepository } from "../../domain/repositories/ICurrencyRepository";
import type { DomainResponse } from "../../../../core/domain/common/responce/DomainResponse";

export const createManageCurrenciesUseCase = (repository: ICurrencyRepository) => {
  return {
    findAllCurrencies: (params?: CurrencyFilters) => {
      return repository.findAllCurrencies(params)
    },
    createCurrency: (data: CreateCurrencyDto, idempotencyKey?: string) => {
      return repository.createCurrency(data, idempotencyKey)
    },
    updateCurrency: (code: string, data: UpdateCurrencyDto, idempotencyKey?: string) => {
      return repository.updateCurrency(code, data, idempotencyKey)
    },
    deleteCurrency: (currency: Pick<Currency, "code">, idempotencyKey?: string) => {
      return repository.deleteCurrency(currency, idempotencyKey)
    },
    convertCurrency: (data: CurrencyConversionRequest, idempotencyKey?: string): Promise<DomainResponse<CurrencyConversionResult>> => {
      return repository.convertCurrency(data, idempotencyKey)
    }
  }
}
