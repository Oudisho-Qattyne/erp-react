import type { ApiClient } from "../../../../core/domain/common/api/ApiClient";
import type { DomainResponse } from "../../../../core/domain/common/responce/DomainResponse";
import type { Person } from "../../domain/entities/Person";
import type { IPersonRepository } from "../../domain/repositories/IPersonRepository";

export type PersonListParams = Record<string, string | number>;

export const createPersonRepository = (apiClient: ApiClient): IPersonRepository => {
  const baseUrl = "/crm/people";

  return {
    findAllPersons: (params) =>
      apiClient.get<DomainResponse<Person[]>>(baseUrl, params ? { params } : undefined),
  };
};