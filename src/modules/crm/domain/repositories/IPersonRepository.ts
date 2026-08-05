import type { DomainResponse } from "../../../../core/domain/common/responce/DomainResponse";
import type { PersonFilters } from "../../application/dtos/personDtos";
import type { Person } from "../entities/Person";

export interface IPersonRepository {
  findAllPersons(params?: PersonFilters): Promise<DomainResponse<Person[]>>;
}