import type { Specialization } from '../../../../domain/entities/education/Specialization';
import { useNestedEntityCrud } from '../useNestedEntityCrud';

export const SPECIALIZATION_REST_URL = '/shared-kernal/specializations';

export const specializationListUrl = (facultyId: number) =>
  `/shared-kernal/faculties/${facultyId}/specializations`;

export function useSpecializations() {
  const nested = useNestedEntityCrud<Specialization>({
    buildListUrl: specializationListUrl,
    restUrl: SPECIALIZATION_REST_URL,
  });

  return {
    ...nested,
    facultyId: nested.parentId,
    setFacultyId: nested.setParentId,
    getAllByFaculty: nested.getAllForParent,
  };
}
