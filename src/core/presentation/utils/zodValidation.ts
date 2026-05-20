// src/core/domain/common/validation/zodValidation.ts
import { z } from 'zod';

export class ZodValidationError extends Error {
  constructor(public error: z.ZodError) {
    super('Validation failed');
    this.name = 'ZodValidationError';
  }

  // Helper to access issues via the error object
  get issues(): z.ZodIssue[] {
    return this.error.issues;
  }

  // Helper to get formatted error messages
  getFormattedErrors(): Record<string, string[]> {
    const errors: Record<string, string[]> = {};
    this.error.issues.forEach(issue => {
      const path = issue.path.join('.');
      if (!errors[path]) errors[path] = [];
      errors[path].push(issue.message);
    });
    return errors;
  }

  // Helper to get a simple string representation
  toString(): string {
    return JSON.stringify(this.error.issues, null, 2);
  }
}

/**
 * Generic Zod validation function
 * @param schema - Zod schema to validate against
 * @param data - Unknown data to validate
 * @returns Validated data of type T
 * @throws ZodValidationError with all validation issues
 */
export function validateWithZod<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ZodValidationError(result.error);
  }
  return result.data;
}

// Alternative: simpler version that throws raw Error with JSON string
export function validateWithZodSimple<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(JSON.stringify(result.error.issues, null, 2));
  }
  return result.data;
}