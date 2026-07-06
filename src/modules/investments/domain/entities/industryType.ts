import type { EntityWithNameOnly } from "../../../../core/domain/entities/EntityWithNameOnly";

export interface IndustryType extends EntityWithNameOnly{
  is_active: boolean;
}