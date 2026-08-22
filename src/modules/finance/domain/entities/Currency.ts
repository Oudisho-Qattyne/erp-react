import type { EntityWithNameOnly } from "../../../../core/domain/entities/EntityWithNameOnly";

export interface Currency extends Omit<EntityWithNameOnly , 'is_default' | 'id'>{
    code:string;
    symbol?:string;
    decimal_places?:number;
    is_active?:boolean;
    is_base?:boolean;
}