import type { ApiClient } from "../../../../core/domain/common/api/ApiClient";
import type { DpomainResponsePaginated } from "../../../hr/domain/entities/common/DomainResponsePaginated";
import type { PersonFilters } from "../../application/dtos/personDtos";
import type { Person } from "../../domain/entities/Person";
import type { IPersonRepository } from "../../domain/repositories/IPersonRepository";

function serializeParams(
  params?: PersonFilters,
): Record<string, string | boolean | number> | undefined {
  if (!params) return undefined;
  const out: Record<string, string | boolean | number> = {};
  const { sort_by, ...rest } = params;
  for (const [key, val] of Object.entries(rest)) {
    if (val !== undefined && val !== null && val !== "") out[key] = val as string | boolean | number;
  }
  if (sort_by) {
    for (const [field, order] of Object.entries(sort_by)) {
      if (order) out[`sort_by[${field}]`] = order;
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

export const createPersonRepository = (apiClient: ApiClient): IPersonRepository => {
  const baseUrl = "/crm/persons";

  return {
    findAllPersons: (params) =>
      apiClient.get<DpomainResponsePaginated<Person[]>>(baseUrl, params ? { params: serializeParams(params) } : undefined),
    findPersonById: (id) =>
      apiClient.get<DpomainResponsePaginated<Person>>(`${baseUrl}/${id}`),
  };
};