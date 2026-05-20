import type { University } from "../../../../core/domain/entities/education/University";

// Create DTO (omit auto‑generated fields)
export type CreateUniversityDTO = Omit<University, 'id' | 'created_at'>;

// Update DTO (all fields optional)
export type UpdateUniversityDTO = Partial<CreateUniversityDTO>;