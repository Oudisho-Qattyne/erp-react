import type { City } from "../../../../core/domain/entities/regions/City";

// Create DTO (omit auto‑generated fields)
export type CreateCityDTO = Omit<City, 'id' | 'created_at'>;

// Update DTO (all fields optional)
export type UpdateCityDTO = Partial<CreateCityDTO>;