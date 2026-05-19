import type { City } from '../../../../domain/entities/regions/City';
import { useNestedEntityCrud } from '../../../../../modules/hr/presentation/hooks/useNestedEntityCrud';

export const CITY_REST_URL = 'shared-kernal/cities';

export const cityListUrl = (countryId: number) =>
  `shared-kernal/countries/${countryId}/cities`;

export function useCities() {
  const nested = useNestedEntityCrud<City>({
    buildListUrl: cityListUrl,
    restUrl: CITY_REST_URL,
  });

  return {
    ...nested,
    countryId: nested.parentId,
    setCountryId: nested.setParentId,
    getAllByCountry: nested.getAllForParent,
  };
}
