import type { EntityWithNameOnly } from "../../../../core/domain/entities/EntityWithNameOnly";

export interface ByDurationLicense extends EntityWithNameOnly{
  is_active: boolean;
}