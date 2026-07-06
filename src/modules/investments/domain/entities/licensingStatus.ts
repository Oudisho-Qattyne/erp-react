import type { EntityWithNameOnly } from "../../../../core/domain/entities/EntityWithNameOnly";

export interface LicensingStatus extends EntityWithNameOnly{
  is_active: boolean;
}