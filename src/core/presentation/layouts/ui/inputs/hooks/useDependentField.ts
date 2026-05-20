import { useEffect, useState, useRef } from 'react';
import { useFormContext, type FieldValues, type Path} from 'react-hook-form';

export interface ComputedProps {
  value?: any;
  options?: { value: number | string; label: string }[]
  disabled?: boolean;
  hidden?: boolean;
  placeholder?: string;
  required?: boolean;
  [key: string]: any; // allow extra data
}

/**
 * useDependentField
 * A hook to compute field properties based on other field values.
 */
export function useDependentField<T extends FieldValues>(
  targetName: Path<T>,
  dependsOn: Path<T>[],
  compute: (values: Record<Path<T>, any>) => ComputedProps | Promise<ComputedProps>
) {
  const { watch, getValues, setValue } = useFormContext<T>();
  const [computed, setComputed] = useState<ComputedProps>({});
  const [loading, setLoading] = useState(false);

  // Watch only the specific fields we depend on
  const watchedValues = watch(dependsOn);
  const watchedValuesKey = JSON.stringify(watchedValues);

  // Keep compute function in a ref to avoid effect triggers on every render
  const computeRef = useRef(compute);
  useEffect(() => {
    computeRef.current = compute;
  }, [compute]);

  // Handle dependency changes and compute new props
  useEffect(() => {
    let isMounted = true;
    
    const update = async () => {
      setLoading(true);
      try {
        const currentValues = getValues();
        const result = await computeRef.current(currentValues);
        
        if (isMounted) {
          setComputed(prev => {
            if (JSON.stringify(prev) === JSON.stringify(result)) return prev;
            return result;
          });
          
          // Auto-sync value if compute returned one and it's different
          if (result.value !== undefined) {
            const currentVal = getValues(targetName);
            if (currentVal !== result.value) {
              setValue(targetName, result.value, { shouldValidate: true, shouldDirty: true });
            }
          } else if (result.options) {
            // If options changed, check if current value is still valid
            const currentVal = getValues(targetName);
            if (currentVal) {
              const isValid = result.options.some(opt => opt.value === currentVal);
              if (!isValid) {
                // Clear the field if the current value is no longer in the valid options
                setValue(targetName, '' as any, { shouldValidate: true, shouldDirty: true });
              }
            }
          }
          
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in dependent field computation:', error);
        if (isMounted) setLoading(false);
      }
    };

    update();
    return () => { isMounted = false; };
  }, [watchedValuesKey, targetName, getValues, setValue]);

  return { computed, loading };
}