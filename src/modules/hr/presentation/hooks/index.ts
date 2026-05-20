export { useEntityCrud, type UseEntityCrudReturn } from '../../../../core/presentation/hooks/data/useEntity';
export {
  useNestedEntityCrud,
  type NestedEntityConfig,
  type UseNestedEntityCrudReturn,
} from '../../../../core/presentation/hooks/data/useNestedEntityCrud';

export { useCities, cityListUrl, CITY_REST_URL } from '../../../../core/presentation/hooks/data/regions/useCities';
export { useRegions, regionListUrl, REGION_REST_URL } from '../../../../core/presentation/hooks/data/regions/useRegions';
export { useFaculties, facultyListUrl, FACULTY_REST_URL } from '../../../../core/presentation/hooks/data/education/useFaculties';
export {
  useSpecializations,
  specializationListUrl,
  SPECIALIZATION_REST_URL,
} from '../../../../core/presentation/hooks/data/education/useSpecializations';

/** @deprecated Use useCities from './regions/useCities' */
export { useCities as useCity } from '../../../../core/presentation/hooks/data/regions/useCities';
