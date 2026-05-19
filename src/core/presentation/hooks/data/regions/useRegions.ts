import type { Region } from '../../../../domain/entities/regions/Region';
import { useNestedEntityCrud } from '../useNestedEntityCrud';

export const REGION_REST_URL = 'shared-kernal/regions';

export const regionListUrl = (cityId: number) =>
  `shared-kernal/countries/cities/${cityId}/regions`;

export function useRegions() {
  const nested = useNestedEntityCrud<Region>({
    buildListUrl: regionListUrl,
    restUrl: REGION_REST_URL,
  });

  return {
    ...nested,
    cityId: nested.parentId,
    setCityId: nested.setParentId,
    getAllByCity: nested.getAllForParent,
  };
}
