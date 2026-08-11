import type { EntityWithNameOnly } from "../../../../core/domain/entities/EntityWithNameOnly";

export interface PartnershipType extends EntityWithNameOnly{
  is_active: boolean;
}
