
// Create DTO (omit auto‑generated fields)
export type CreateEntityDTO<T> = Omit<T, 'id' | 'created_at'>;

// Update DTO (all fields optional)
export type UpdateEntityDTO<T> = Partial<CreateEntityDTO<T>>;