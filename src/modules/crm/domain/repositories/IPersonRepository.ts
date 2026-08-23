import type { DomainResponse } from "../../../../core/domain/common/responce/DomainResponse";
import type { PersonListParams } from "../../infrastructure/repositories/PersonRepository";
import type { Person } from "../entities/Person";

export interface IPersonRepository {
  findAllPersons(params?: PersonListParams): Promise<DomainResponse<Person[]>>;
}