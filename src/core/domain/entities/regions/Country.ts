import type { EntityWithNameOnly } from "../EntityWithNameOnly";

export interface Country extends EntityWithNameOnly {
    code?:string | null
}