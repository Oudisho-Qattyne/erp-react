import type { EntityWithNameOnly } from "../../../../core/domain/entities/EntityWithNameOnly";

export interface IndustrialLicenseSource extends EntityWithNameOnly{
  is_active: boolean;
}