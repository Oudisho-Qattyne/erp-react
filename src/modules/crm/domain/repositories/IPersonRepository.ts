import type { DpomainResponsePaginated } from "../../../hr/domain/entities/common/DomainResponsePaginated";
import type { PersonFilters } from "../../application/dtos/personDtos";
import type { Person } from "../entities/Person";

export interface IPersonRepository {
  findAllPersons(params?: PersonFilters): Promise<DpomainResponsePaginated<Person[]>>;
  findPersonById(id: number): Promise<DpomainResponsePaginated<Person> | null>;
}