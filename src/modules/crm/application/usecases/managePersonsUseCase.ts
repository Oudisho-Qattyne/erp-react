import type { PersonFilters } from "../dtos/personDtos";
import type { IPersonRepository } from "../../domain/repositories/IPersonRepository";

export const createManagePersonsUseCase = (repository: IPersonRepository) => {
  return {
    findAllPersons: (params?: PersonFilters) => {
      return repository.findAllPersons(params)
    },
  }
}