import { useForm, type FieldValues, type Path, type PathValue, type UseFormProps, } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ZodSchema } from 'zod/v3';

export function useDynamicForm<T extends FieldValues>({
  schema,
  defaultValues,
  mode = 'onChange',
}: {
  schema: ZodSchema<T>;
  defaultValues?: UseFormProps<T>['defaultValues'];
  mode?: UseFormProps<T>['mode'];
}) {
  // Cast the resolver to 'any' to bypass the generic mismatch (safe at runtime)
  const form = useForm<T>({
    resolver: zodResolver(schema as any) as any,
    defaultValues,
    mode,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty, isSubmitting },
    reset,
    setValue,
    watch,
    getValues,
    trigger,
  } = form;

  // Get error message for a field (supports nested paths like 'user.name')
  const getFieldError = (fieldName: Path<T>): string | undefined => {
    const error = errors[fieldName];
    return error?.message as string | undefined;
  };

  // Create props for your Input component – fully typed with Path<T>
  const fieldProps = <K extends Path<T>>(
    fieldName: K,
    options?: { type?: string; placeholder?: string; label?: string }
  ) => ({
    name: fieldName,
    value: watch(fieldName) ?? '',
    onChange: (val: PathValue<T, K>) => setValue(fieldName, val, { shouldValidate: true }),
    onBlur: () => trigger(fieldName),
    error: getFieldError(fieldName),
    ...options,
  });

  return {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    getValues,
    trigger,
    errors,
    isValid,
    isDirty,
    isSubmitting,
    getFieldError,
    fieldProps,
    form,
  };
}