import type { PersonListParams } from "../../infrastructure/repositories/PersonRepository";
import type { IPersonRepository } from "../../domain/repositories/IPersonRepository";

export const createManagePersonsUseCase = (repository: IPersonRepository) => {
  return {
    findAllPersons: (params?: PersonListParams) => {
      return repository.findAllPersons(params)
    },
  }
}