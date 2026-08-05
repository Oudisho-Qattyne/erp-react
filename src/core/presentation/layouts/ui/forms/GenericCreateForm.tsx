// src/core/presentation/layouts/ui/forms/GenericCreateForm.tsx
import React, { useRef, useEffect } from 'react';
import { FormProvider, type FieldValues, type Path } from 'react-hook-form';
import { FormInput, type FormInputProps, } from '../inputs/FormInput';
import { Button } from '../buttons/Button';
import { z, type ZodSchema, type ZodObject } from 'zod';
import { useDynamicForm } from '../../../hooks/useDynamicForm221';
import { useLanguage } from '../../../context/i18n/I18nProvider';
import { applyServerValidationErrors } from '../../../utils/handleApiError';
import { useDialogClose } from '../dialog/Dialog';
import type { InputType } from '../inputs/Input';
import type { UseFormReturn } from 'react-hook-form';

export type FieldConfig<T extends FieldValues = any> = Omit<FormInputProps<T>, 'name'> & {
  name: Path<T>;
  render?: (methods: UseFormReturn<T>) => React.ReactNode;
  group?: string;
  groupColumns?: number;
};

export interface GroupConfig {
  group: string;
  title?: string;
  columns?: number;
  rows?: string[][];
  children?: GroupConfig[];
}

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
  fields?: FieldConfig[]; // explicit field configurations
  groups?: GroupConfig[]; // group definitions (order, titles, columns)
  defaultValues?: Record<string, any>;
  onSubmit: (data: any) => Promise<any>;
  onSuccess: (id: number, item: any) => void;
  onCancel: () => void;
  submitLabel?: string;
}

type GroupedItem = {
  group: string;
  title?: string;
  columns: number;
  rows?: string[][];
  fields: FieldConfig[];
  children?: GroupedItem[];
};

function buildGroupedFields(fields: FieldConfig[], groups?: GroupConfig[]) {
  const grouped: GroupedItem[] = [];
  const ungrouped: FieldConfig[] = [];

  if (groups) {
    const used = new Set<number>();

    function processGroup(g: GroupConfig): GroupedItem | null {
      if (g.children && g.children.length > 0) {
        const children: GroupedItem[] = [];
        for (const child of g.children) {
          const item = processGroup(child);
          if (item) children.push(item);
        }
        if (children.length === 0) return null;
        return {
          group: g.group,
          title: g.title,
          columns: 0,
          fields: [],
          children,
        };
      }

      const groupFields: FieldConfig[] = [];
      fields.forEach((f, idx) => {
        if (!used.has(idx) && f.group === g.group) {
          used.add(idx);
          groupFields.push(f);
        }
      });
      if (groupFields.length === 0) return null;
      return {
        group: g.group,
        title: g.title,
        columns: g.columns || groupFields.length,
        rows: g.rows,
        fields: groupFields,
      };
    }

    for (const g of groups) {
      const item = processGroup(g);
      if (item) grouped.push(item);
    }

    fields.forEach((f, idx) => {
      if (!used.has(idx)) ungrouped.push(f);
    });
  } else {
    const groupOrder: string[] = [];
    const groupMap = new Map<string, FieldConfig[]>();
    for (const f of fields) {
      if (f.group) {
        if (!groupMap.has(f.group)) {
          groupOrder.push(f.group);
          groupMap.set(f.group, []);
        }
        groupMap.get(f.group)!.push(f);
      } else {
        ungrouped.push(f);
      }
    }
    for (const g of groupOrder) {
      grouped.push({
        group: g,
        columns: groupMap.get(g)!.length,
        fields: groupMap.get(g)!,
      });
    }
  }

  return { grouped, ungrouped };
}

export function GenericCreateForm({
  schema,
  fields: explicitFields,
  groups,
  defaultValues,
  onSubmit,
  onSuccess,
  onCancel,
  submitLabel,
}: GenericCreateFormProps) {
  const { t } = useLanguage();
  const resolvedSubmitLabel = submitLabel || t('common.save', 'shared') || 'حفظ';
  const { form: methods , errors , getValues} = useDynamicForm({ schema, defaultValues });
  const { handleSubmit, formState } = methods;
  const { isValid, isSubmitting } = formState;
  const { setDisableClose } = useDialogClose();
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDisableClose(isSubmitting);
  }, [isSubmitting, setDisableClose]);

  const handleFormSubmit = async (data: any) => {
    try {
      const result = await onSubmit(data);
      onSuccess(result?.data?.id, result);
      methods.reset();
    } catch (err: any) {
      applyServerValidationErrors(err, methods.setError);
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
    const { grouped, ungrouped } = buildGroupedFields(explicitFields, groups);

    const renderGroupItem = (g: GroupedItem): React.ReactNode => {
      if (g.children) {
        return (
          <div key={g.group} className="rounded-xl border border-border p-4">
            {g.title && <h3 className="text-lg font-bold text-text mb-4">{g.title}</h3>}
            <div className="space-y-3">
              {g.children.map((child) => renderGroupItem(child))}
            </div>
          </div>
        );
      }

      return (
        <div key={g.group} className="rounded-xl border border-border p-4">
          {g.title && <h3 className="text-lg font-bold text-text mb-4">{g.title}</h3>}
          {g.rows && g.rows.length > 0 ? (
            <div className="space-y-3">
              {g.rows.map((rowFieldNames, ri) => (
                <div
                  key={ri}
                  style={{ gridTemplateColumns: `repeat(${rowFieldNames.length}, 1fr)` }}
                  className="grid gap-3"
                >
                  {rowFieldNames.map((name) => {
                    const field = g.fields.find((f) => f.name === name);
                    if (!field) return null;
                    return field.render
                      ? <React.Fragment key={name}>{field.render(methods as any)}</React.Fragment>
                      : <FormInput key={name} {...field} label={field.label} />;
                  })}
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{ gridTemplateColumns: `repeat(${g.columns}, 1fr)` }}
              className="grid gap-3"
            >
              {g.fields.map((field) => (
                field.render
                  ? <React.Fragment key={field.name as string}>{field.render(methods as any)}</React.Fragment>
                  : <FormInput key={field.name as string} {...field} label={field.label} />
              ))}
            </div>
          )}
        </div>
      );
    };

    return (
      <FormProvider {...methods}>
        <div ref={formRef} className="space-y-4">
          <div className="space-y-3">
            {grouped.map((g) => renderGroupItem(g))}
            {ungrouped.map((field) => (
              field.render
                ? <React.Fragment key={field.name as string}>{field.render(methods as any)}</React.Fragment>
                : <FormInput key={field.name as string} {...field} label={field.label} />
            ))}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" disabled={isSubmitting} onClick={onCancel}>
              {t('common.cancel', 'shared') || 'إلغاء'}
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={!isValid || isSubmitting}
              onClick={methods.handleSubmit(handleFormSubmit)}
            >
              {isSubmitting ? (t('common.loading', 'shared') || 'جاري...') : resolvedSubmitLabel}
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
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={onCancel}>
            {t('common.cancel', 'shared') || 'إلغاء'}
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={!isValid || isSubmitting}
            onClick={methods.handleSubmit(handleFormSubmit)}
          >
            {isSubmitting ? (t('common.loading', 'shared') || 'جاري...') : resolvedSubmitLabel}
          </Button>
        </div>
      </div>
    </FormProvider>
  );
}
