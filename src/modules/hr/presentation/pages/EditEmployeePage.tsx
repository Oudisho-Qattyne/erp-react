import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApiClient } from '../../../../core/presentation/context/api/ApiClinetProvider';
import type { DomainResponse } from '../../../../core/domain/common/responce/DomainResponse';
import type { EmployeeData } from '../../domain/entities/employee';
import type { EmployeeFormValues } from '../schemas/employeeForm';
import { EmployeeForm } from './EmployeeForm';
import { Button } from '../../../../core/presentation/layouts/ui/buttons/Button';
import { LoadingState } from '../../../../core/presentation/layouts/ui/state/LoadingState';
import { ErrorState } from '../../../../core/presentation/layouts/ui/state/ErrorState';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../../../core/presentation/context/i18n/I18nProvider';
import { useManageEmployee } from '../hooks/useEmployees';

export function EditEmployeePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const apiClient = useApiClient();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [defaultValues, setDefaultValues] = useState<Partial<EmployeeFormValues> | null>(null);
  const {getById} = useManageEmployee();
  
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true);
        const result = await getById(Number(id))
        if (result) {
          const emp = result.data
          // Map API data to Form Values
          const mappedValues: Partial<EmployeeFormValues> = {
            internal_id: emp.internal_id,
            national_id: emp.national_id,
            first_name: emp.first_name,
            father_name: emp.father_name || '',
            grandfather_name: emp.grandfather_name || '',
            last_name: emp.last_name,
            mother_name: emp.mother_name || '',
            gender: emp.gender,
            date_birth: emp.date_birth || '',
            place_birth: emp.place_birth || '',
            assigned_job: emp.assigned_job || '',
            marital_status: emp.marital_status || 'single',
            number_of_children: emp.number_of_children || 0,
            spouse_name: emp.spouse_name || '',
            spouse_workplace: emp.spouse_workplace || '',
            blood_type: emp.blood_type || 'A+',
            phone_number: emp.phone_number || '',
            sham_cash_account: emp.sham_cash_account || '',
            residence_country_id: emp.residence_region?.city?.country?.id || 0,
            residence_city_id: emp.residence_region?.city?.id || 0,
            residence_region_id: emp.residence_region?.id ?? emp.residence_region_id ?? 0,
            residential_area_details: emp.residential_area_details || '',
            civil_registry_record: emp.civil_registry_record || '',
            health_status: emp.health_status || '',
            injury_details: emp.injury_details || null,
            injury_date: emp.injury_date || null,
            chronic_disease_ids: emp.chronic_diseases?.map((d: any) => d.id) || [],

            employment_details: emp.employment_details ? {
              job_title: emp.employment_details.job_title,
              org_unit_id: emp.employment_details.org_unit_id,
              status: emp.employment_details.status,
              appointment_date: emp.employment_details.appointment_date,
              contract_type: emp.employment_details.contract_type,
              contract_nature: emp.employment_details.contract_nature,
              job_category: emp.employment_details.job_category,
              workplace_city_id: emp.employment_details.workplace_city_id,
            } : undefined,

            educations: emp.educations?.map((edu: any) => ({
              category: edu.category || 'latest',
              degree_name: edu.degree_name || '',
              university_id: edu.university_id || 0,
              faculty_id: edu.faculty_id || 0,
              specialization_id: edu.specialization_id || 0,
              graduation_year: edu.graduation_year || '',
              academic_stage: edu.academic_stage || null,
              study_status: edu.study_status || null,
            })) || [],

            children: emp.children?.map((child: any) => ({
              name: child.name || '',
              birthdate: child.birthdate || '',
            })) || [],
          };
          setDefaultValues(mappedValues);
        } else {
          setError(t('edit_employee.not_found', 'hr') || 'لم يتم العثور على الموظف');
        }
      } catch (err: any) {
        setError(err.message || t('edit_employee.load_error', 'hr') || 'حدث خطأ أثناء تحميل بيانات الموظف');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEmployee();
    }
  }, [id, apiClient]);

  const handleSubmit = async (data: EmployeeFormValues) => {
    try {
      setSaving(true);
      setError(null);
      await apiClient.put(`/hr/employees/${id}`, data);
      navigate(`/hr/employees/${id}`);
    } catch (err: any) {
      setError(err.message || t('edit_employee.update_error', 'hr') || 'فشل في تحديث بيانات الموظف');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState />;

  if (error && !defaultValues) {
    return (
      <ErrorState
        message={error}
        onRetry={() => navigate('/hr/employees')}
        retryLabel={t('edit_employee.back_to_list', 'hr') || 'العودة للقائمة'}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/hr/employees/${id}`)}
            leftIcon={<ArrowRight size={18} />}
            className="text-text-muted hover:text-text"
          >
            {t('edit_employee.back', 'hr') || 'العودة'}
          </Button>
          <h1 className="text-2xl font-bold text-text">{t('edit_employee.title', 'hr') || 'تعديل الموظف'}</h1>
        </div>
      </div>

      {error && (
        <div className="bg-danger/10 text-danger p-4 rounded-lg border border-danger/20">
          {error}
        </div>
      )}

      {defaultValues && (
        <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 border border-border shadow-sm">
          <EmployeeForm
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            onCancel={() => navigate(`/hr/employees/${id}`)}
            loading={saving}
            submitLabel={t('edit_employee.submit', 'hr') || "تحديث الموظف"}
          />
        </div>
      )}
    </div>
  );
}
