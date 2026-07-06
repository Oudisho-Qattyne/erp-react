import type { EntityWithNameOnly } from "../../../../core/domain/entities/EntityWithNameOnly";

export interface IndustrialDecisionType extends EntityWithNameOnly{
  is_active: boolean;
}