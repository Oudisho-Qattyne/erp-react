import type { Person } from "../../../crm/domain/entities/Person";

export interface AuthorizedPerson{
          person: Person,
          role_in_facility: string,
          is_required_for_legal_matters: boolean
        }