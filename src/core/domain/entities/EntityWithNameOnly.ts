export interface EntityWithNameOnly {
    id: number;
    name: string | Record<string, string>;
    created_at?: string;
}