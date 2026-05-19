// src/hooks/useDynamicForm.ts
import { useForm, type UseFormReturn, type FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ZodSchema } from 'zod';

export function useDynamicForm<TFieldValues extends FieldValues>({
  schema,
  defaultValues,
  mode = 'onChange',
}: {
  schema: ZodSchema<TFieldValues>;
  defaultValues?: Partial<TFieldValues>;
  mode?: 'onBlur' | 'onChange' | 'onSubmit' | 'onTouched' | 'all';
}): UseFormReturn<TFieldValues> {
  return useForm<TFieldValues>({
    // Cast schema to any to bypass TypeScript strictness (safe at runtime)
    resolver: zodResolver(schema as any),
    // Cast defaultValues to any because UseForm expects DeepPartial<TFieldValues>
    defaultValues: defaultValues as any,
    mode,
  });
}