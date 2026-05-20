import type { Faculty } from '../../../../domain/entities/education/Faculty';
import { useNestedEntityCrud } from '../useNestedEntityCrud';

export const FACULTY_REST_URL = 'shared-kernal/faculties';

export const facultyListUrl = (universityId: number) =>
  `shared-kernal/universities/${universityId}/faculties`;

export function useFaculties() {
  const nested = useNestedEntityCrud<Faculty>({
    buildListUrl: facultyListUrl,
    restUrl: FACULTY_REST_URL,
  });

  return {
    ...nested,
    universityId: nested.parentId,
    setUniversityId: nested.setParentId,
    getAllByUniversity: nested.getAllForParent,
  };
}
