// src/core/presentation/layouts/ui/forms/DynamicForm.tsx
import React from 'react';
import { FormProvider } from 'react-hook-form';
import { FormInput, type FormInputProps } from '../inputs/FormInput';
import { Button } from '../buttons/Button';
import type { ZodSchema } from 'zod';
import { useDynamicForm } from '../../../hooks/useDynamicForm';

// Ensure name is a string key
export interface FieldConfig<T extends Record<string, any>> extends Omit<FormInputProps<any>, 'name'> {
  name: Extract<keyof T, string>;
}

interface DynamicFormProps<T extends Record<string, any>> {
  schema: ZodSchema<T>;
  defaultValues?: Partial<T>;
  fields: FieldConfig<T>[];
  onSubmit: (data: T) => void | Promise<void>;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  loading?: boolean;
  className?: string;
}

export function DynamicForm<T extends Record<string, any>>({
  schema,
  defaultValues,
  fields,
  onSubmit,
  submitLabel = 'حفظ',
  cancelLabel = 'إلغاء',
  onCancel,
  loading = false,
  className = '',
}: DynamicFormProps<T>) {
  const methods = useDynamicForm({ schema, defaultValues });
  const { handleSubmit, formState } = methods;
  const { isValid, isSubmitting } = formState;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className={`space-y-4 ${className}`}>
        {fields.map((field) => (
          <FormInput
            key={String(field.name)}
            name={String(field.name)}
            {...field}
          />
        ))}
        <div className="flex gap-3 mt-6">
          <Button type="submit" variant="primary" disabled={!isValid || isSubmitting || loading}>
            {isSubmitting || loading ? 'جاري...' : submitLabel}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              {cancelLabel}
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}