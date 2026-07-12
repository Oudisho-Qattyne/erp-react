import type { EntityWithNameOnly } from "../../../../core/domain/entities/EntityWithNameOnly";

export interface ByIndustryLicense extends EntityWithNameOnly{
  is_active: boolean;
}