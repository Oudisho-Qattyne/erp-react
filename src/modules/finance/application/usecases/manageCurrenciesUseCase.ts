import type { CreateCurrencyDto, CurrencyFilters, UpdateCurrencyDto } from "../dtos/currencyDtos";
import type { Currency } from "../../domain/entities/Currency";
import type { ICurrencyRepository } from "../../domain/repositories/ICurrencyRepository";

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
    }
  }
}
