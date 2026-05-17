import { useEffect, useState } from 'react';
import { useFormContext, type FieldValues, type Path} from 'react-hook-form';

export interface FieldDependencyConfig<T extends FieldValues, K extends keyof any = any> {
  dependsOn: Path<T>[];                     // fields to watch
  compute: (values: Record<Path<T>, any>) => {
    options?: { value: string; label: string }[];
    disabled?: boolean;
    hidden?: boolean;
    value?: any;
    placeholder?: string;
    extra?: K;                              // any extra data you need
  };
  initialOptions?: { value: string; label: string }[];
}

export function useFieldDependency<T extends FieldValues>(
  config: FieldDependencyConfig<T>
) {
  const { watch, getValues, setValue } = useFormContext<T>();
  const [loading, setLoading] = useState(false);
  const [computed, setComputed] = useState(() => config.compute(getValues()));

  const watchedValues = watch(config.dependsOn);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const currentValues = getValues();
      const result = config.compute(currentValues);
      setComputed(result);
      setLoading(false);
    };
    run();
  }, [watchedValues, config, getValues]);

  return { ...computed, loading };
}