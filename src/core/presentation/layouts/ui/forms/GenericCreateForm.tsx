// src/core/presentation/layouts/ui/forms/GenericCreateForm.tsx
import React, { useRef, useEffect } from 'react';
import { FormProvider, type FieldValues, type Path } from 'react-hook-form';
import { FormInput, type FormInputProps, } from '../inputs/FormInput';
import { Button } from '../buttons/Button';
import { z, type ZodSchema, type ZodObject } from 'zod';
import { useDynamicForm } from '../../../hooks/useDynamicForm221';
import type { InputType } from '../inputs/Input';
import type { UseFormReturn } from 'react-hook-form';

export type FieldConfig<T extends FieldValues = any> = Omit<FormInputProps<T>, 'name'> & {
  name: Path<T>;
  render?: (methods: UseFormReturn<T>) => React.ReactNode;
};

function isZodObject(schema: ZodSchema<any>): schema is ZodObject<any> {
  return 'shape' in schema;
}

function flattenSchema(
  schema: ZodObject<any>,
  prefix = ''
): { path: string; schema: z.ZodTypeAny }[] {
  const fields: { path: string; schema: z.ZodTypeAny }[] = [];
  const shape = schema.shape;
  for (const [key, fieldSchema] of Object.entries(shape)) {
    const path = prefix ? `${ prefix }.${ key }`: key;
    if (fieldSchema instanceof z.ZodObject) {
      fields.push(...flattenSchema(fieldSchema as ZodObject<any>, path));
    } else {
      fields.push({ path, schema: fieldSchema as z.ZodTypeAny });
    }
  }
  return fields;
}

interface GenericCreateFormProps {
  schema: ZodSchema<any>;
  fields?: FieldConfig[]; // 👈 explicit field configurations
  defaultValues?: Record<string, any>;
  onSubmit: (data: any) => Promise<any>;
  onSuccess: (id: number, item: any) => void;
  onCancel: () => void;
  submitLabel?: string;
}

export function GenericCreateForm({
  schema,
  fields: explicitFields,
  defaultValues,
  onSubmit,
  onSuccess,
  onCancel,
  submitLabel = 'حفظ',
}: GenericCreateFormProps) {
  const { form: methods } = useDynamicForm({ schema, defaultValues });
  const { handleSubmit, formState } = methods;
  const { isValid, isSubmitting } = formState;
  const formRef = useRef<HTMLDivElement>(null);

  const handleFormSubmit = async (data: any) => {
    try {
      const result = await onSubmit(data);
      onSuccess(result?.data?.id, result);
      methods.reset();
    } catch (err: any) {
      if (err.validationErrors) {
        const entries = Object.entries(err.validationErrors);
        entries.forEach(([field, msgs]) => {
          const msg = Array.isArray(msgs) ? msgs[0] : String(msgs);
          methods.setError(field as any, { message: msg });
        });
        const firstField = entries[0][0]
        const el = document.querySelector(`[for="${firstField}"]`)
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" })
      }
      throw err;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && formRef.current?.contains(e.target as Node)) {
        e.preventDefault();
        if (isValid && !isSubmitting) {
          methods.handleSubmit(handleFormSubmit)();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isValid, isSubmitting, methods, handleFormSubmit]);

  // If explicit fields are provided, use them
  if (explicitFields && explicitFields.length > 0) {
    return (
      <FormProvider {...methods}>
        <div ref={formRef} className="space-y-4">
          <div className="space-y-3">
            {explicitFields.map((field) => (
              field.render
                ? <React.Fragment key={field.name as string}>{field.render(methods as any)}</React.Fragment>
                : <FormInput key={field.name as string} {...field} label={field.label} />
            ))}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              إلغاء
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={!isValid || isSubmitting}
              onClick={methods.handleSubmit(handleFormSubmit)}
            >
              {isSubmitting ? 'جاري...' : submitLabel}
            </Button>
          </div>
        </div>
      </FormProvider>
    );
  }

  // Fallback: generate fields from schema (original behaviour)
  let flattenedFields: { path: string; schema: z.ZodTypeAny }[] = [];
  if (isZodObject(schema)) {
    flattenedFields = flattenSchema(schema);
  }

  const getInputType = (fieldSchema: z.ZodTypeAny): InputType => {
    if (fieldSchema instanceof z.ZodNumber) return 'number';
    if (fieldSchema instanceof z.ZodDate) return 'date';
    if (fieldSchema instanceof z.ZodEnum) return 'select';
    return 'text';
  };

  const getOptions = (fieldSchema: z.ZodTypeAny) => {
    if (fieldSchema instanceof z.ZodEnum) {
      return fieldSchema.options.map((opt: any) => ({
        value: opt,
        label: String(opt),
      }));
    }
    return undefined;
  };

  const isRequired = (fieldSchema: z.ZodTypeAny) => {
    return !fieldSchema.isOptional?.();
  };

  return (
    <FormProvider {...methods}>
      <div ref={formRef} className="space-y-4">
        <div className="space-y-3">
          {flattenedFields.map(({ path, schema: fieldSchema }) => {
            const type = getInputType(fieldSchema);
            const options = getOptions(fieldSchema);
            const required = isRequired(fieldSchema);
            const label = path.split('.').pop() || path;
            return (
              <FormInput
                key={path}
                name={path}
                type={type}
                label={label}
                required={required}
                options={options}
              />
            );
          })}
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            إلغاء
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={!isValid || isSubmitting}
            onClick={methods.handleSubmit(handleFormSubmit)}
          >
            {isSubmitting ? 'جاري...' : submitLabel}
          </Button>
        </div>
      </div>
    </FormProvider>
  );
}