export interface MultiLanguage {
    ar?:string,
    en?:string
}

export interface EntityWithNameOnly {
    id: number;
    name: string | MultiLanguage;
    created_at?: string;
    updated_at?: string;
    is_default?:boolean;
}