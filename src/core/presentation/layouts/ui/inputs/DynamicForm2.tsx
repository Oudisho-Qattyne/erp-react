import { z } from 'zod';
import { useMemo } from 'react';
import { Button } from '../buttons/Button.js';
import { TheInput, type TheInputType as InputType } from './TheInput.js';
import { useDynamicForm } from '../../../hooks/useDynamicForm2.js';

interface FieldConfig {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'textarea' | 'select';
  options?: { value: string; label: string }[];
}

interface DynamicFormProps<T extends z.ZodObject<any>> {
  schema: T;
  defaultValues?: Partial<z.infer<T>>;
  onSubmit: (data: z.infer<T>) => void;
  fieldsConfig?: FieldConfig[];
}

export function DynamicForm<T extends z.ZodObject<any>>({
  schema,
  defaultValues,
  onSubmit,
  fieldsConfig,
}: DynamicFormProps<T>) {
  const { fieldProps, handleSubmit, isValid, isSubmitting } = useDynamicForm({
    schema: schema as any,
    defaultValues: defaultValues as any,
    mode: 'onChange',
  });

  const shape = schema.shape;
  const fieldNames = Object.keys(shape) as (keyof z.infer<T>)[];

  const fields = useMemo((): FieldConfig[] => {
    if (fieldsConfig) return fieldsConfig;
    return fieldNames.map((key) => ({
      key: key as string,
      label: key as string,
      type: 'text',
      options: undefined,
    }));
  }, [fieldNames, fieldsConfig]);

  const getInputType = (fieldKey: string): FieldConfig['type'] => {
    const zodType = shape[fieldKey];
    if (zodType instanceof z.ZodNumber) return 'number';
    if (zodType instanceof z.ZodDate) return 'date';
    if (zodType instanceof z.ZodString && fieldKey.toLowerCase().includes('textarea')) return 'textarea';
    return 'text';
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {fields.map((field) => {
        const inputType = field.type || getInputType(field.key);
        const props = fieldProps(field.key as any, {
          label: field.label,
          type: inputType,
        });

        if (inputType === 'select' && field.options) {
          return (
            <TheInput
              key={field.key}
              type="select"
              label={field.label}
              name={field.key}
              value={props.value}
              onChange={props.onChange}
              onBlur={props.onBlur}
              error={props.error}
              options={field.options}
              required={(shape[field.key] as any)?.isOptional === false}
            />
          );
        }

        return (
          <TheInput
            key={field.key}
            name={props.name}
            value={props.value}
            onChange={props.onChange}
            onBlur={props.onBlur}
            error={props.error}
            label={field.label}
            type={inputType as InputType}
            required={(shape[field.key] as any)?.isOptional === false}
          />
        );
      })}
      <div className="flex gap-3">
        <Button type="submit" variant="primary" disabled={!isValid || isSubmitting}>
          Submit
        </Button>
      </div>
    </form>
  );
}