export interface StorageItemDto {
    id: string;
    type?: "file" | "folder";
    size?: number;
    lazy?: boolean;
    date?: Date;
    [key: string]: any;
}