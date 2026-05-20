import type { EntityWithNameOnly } from "../EntityWithNameOnly";

export interface OrganizationalLevels extends EntityWithNameOnly{
    parent_id: number | null,
    parent: Omit<OrganizationalLevels,'children' | 'parent'> | null,
    children: Omit<OrganizationalLevels,'children' | 'parent'>[],
}