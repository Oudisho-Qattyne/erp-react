'use client';

import React from 'react';
import { useFormContext, FieldValues } from 'react-hook-form';
import { FieldDependencyConfig, useFieldDependency } from '../../../hooks/useFieldDependency';

interface DependentFieldProps<T extends FieldValues> {
  name: string;
  children: (props: {
    value: any;
    onChange: (val: any) => void;
    onBlur: () => void;
    disabled?: boolean;
    hidden?: boolean;
    options?: { value: string; label: string }[];
    placeholder?: string;
    extra?: any;
    loading?: boolean;
  }) => React.ReactNode;
  dependency: FieldDependencyConfig<T>;
  fallback?: React.ReactNode; // shown while loading
}

export function DependentField<T extends FieldValues>({
  name,
  children,
  dependency,
  fallback = <div className="text-sm text-muted">loading...</div>,
}: DependentFieldProps<T>) {
  const { setValue, trigger, getValues } = useFormContext<T>();
  const currentValue = getValues()[name as any];
  const { options, disabled, hidden, placeholder, extra, loading } = useFieldDependency(dependency);

  const handleChange = (val: any) => {
    setValue(name as any, val, { shouldValidate: true });
    trigger(name as any);
  };

  const handleBlur = () => trigger(name as any);

  if (hidden) return null;
  if (loading && !options) return <>{fallback}</>;

  return children({
    value: currentValue,
    onChange: handleChange,
    onBlur: handleBlur,
    disabled,
    options,
    placeholder,
    extra,
    loading,
  });
}