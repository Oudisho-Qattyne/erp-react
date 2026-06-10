import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApiClient } from '../../../../core/presentation/context/api/ApiClinetProvider';
import type { EmployeeData } from '../../domain/entities/employee';
import { Button } from '../../../../core/presentation/layouts/ui/buttons/Button';
import {
  User,
  Briefcase,
  GraduationCap,
  MapPin,
  Phone,
  Droplet,
  HeartPulse,
  ArrowRight,
  CreditCard,
  Building2,
  Calendar,
  Contact,
  Activity,
  Pencil
} from 'lucide-react';
import { useLanguage } from '../../../../core/presentation/context/i18n/I18nProvider';
import { useManageEmployee } from '../hooks/useEmployees';
import { getLocalizedName } from '../../../../core/presentation/utils/helpes';
import { LoadingState } from '../../../../core/presentation/layouts/ui/state/LoadingState';
import { ErrorState } from '../../../../core/presentation/layouts/ui/state/ErrorState';
import { EmptyState } from '../../../../core/presentation/layouts/ui/state/EmptyState';
import { useStorage } from '../../../../core/registry/storage/StorageProvider';

export function ShowEmployeePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const apiClient = useApiClient();
  const { language, t } = useLanguage();

  const [FileExplorerOpen, setFileExplorerOpen] = useState<boolean>(false)
  const [employeePhotoPickerOpen, setEmployeePhotoPickerOpen] = useState<boolean>(false)
  const storage = useStorage();

  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [photoUpdating, setPhotoUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getById , update } = useManageEmployee()
  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const res = await getById(Number(id))
      if (res) {
        const emp = res.data
        setEmployee(emp);
      } else {
        setError(t('show_employee.not_found', 'hr') || 'لم يتم العثور على الموظف');
      }
    } catch (err: any) {
      setError(err.message || t('show_employee.load_error', 'hr') || 'حدث خطأ أثناء تحميل بيانات الموظف');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchEmployee();
    }
  }, [id]);

  const handlePhotoSelect = async (items: any[]) => {
    if (items.length === 0) return;
    setPhotoUpdating(true);
    try {
      const  { ...newData } = employee
      await update(Number(id), { ...newData , photo_id: items[0]._id });
      await fetchEmployee();
      setEmployeePhotoPickerOpen(false);
    } catch (err: any) {
      console.error('Failed to update photo:', err);
    } finally {
      setPhotoUpdating(false);
    }
  };

  if (loading) return <LoadingState message={t('common.loading', 'shared') || 'Loading...'} />;

  if (error || !employee) {
    return (
      <ErrorState
        message={error || t('show_employee.not_found', 'hr') || 'الموظف غير موجود'}
        onRetry={() => navigate('/hr/employees')}
        retryLabel={t('show_employee.back_to_list', 'hr') || 'العودة للقائمة'}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 p-4">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => navigate('/hr/employees')}
          leftIcon={<ArrowRight size={18} />}
          className="text-text-muted hover:text-text"
        >
          {t('show_employee.back', 'hr') || 'العودة'}
        </Button>
        <div className="flex gap-3">
          {storage?.FileExplorerDialogComponent && employee?.folder && (
            <Button variant="outline" onClick={() => setFileExplorerOpen(true)}>
              {t('show_employee.folder', 'hr') || 'مجلد الموظف'}
            </Button>
          )}
          <Button variant="primary" onClick={() => navigate(`/hr/employees/${id}/edit`)}>
            {t('show_employee.edit', 'hr') || 'تعديل الموظف'}
          </Button>
        </div>
      </div>

      {/* Main Profile Header */}
      <div className="bg-card/60 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-border shadow-sm flex flex-col md:flex-row gap-6 items-center md:items-start relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary via-primary-light to-primary opacity-70"></div>
        <div className='relative flex justify-center items-center overflow-hidden rounded-full'>

          {
            employee.photo_id ?
              <div className="w-24 h-24 md:w-32 md:h-32 bg-primary/10 flex items-center justify-center border-4 border-card shadow-sm shrink-0">
                <img />
              </div>
              :

              <div className="w-24 h-24 md:w-32 md:h-32 bg-primary/10 flex items-center justify-center border-4 border-card shadow-sm shrink-0">
                <User size={48} className="text-primary opacity-80" />
              </div>

          }
          <div onClick={() => { if (!photoUpdating) setEmployeePhotoPickerOpen(true) }} className='absolute w-full h-full flex cursor-pointer opacity-0 justify-center items-center hover:opacity-50 transform duration-300'>
            {photoUpdating ? (
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
            ) : (
              <Pencil size={48} className="text-primary opacity-80" />
            )}
          </div>
        </div>
        <div className="flex-1 text-center md:text-start space-y-2 pt-2">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-text">
              {employee.first_name} {employee.father_name ? `${employee.father_name} ` : ''}{employee.grandfather_name ? `${employee.grandfather_name} ` : ''}{employee.last_name}
            </h1>
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full border border-primary/20 self-center md:self-auto">
              {employee.internal_id}
            </span>
          </div>
          <p className="text-text-muted text-lg flex items-center justify-center md:justify-start gap-2">
            <Briefcase size={18} />
            {employee.employment_details?.job_title || t('show_employee.not_specified', 'hr') || 'غير محدد'}
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4 text-sm text-text-muted/80">
            {employee.phone_number && (
              <div className="flex items-center gap-1.5 bg-background/50 px-3 py-1.5 rounded-lg border border-border/50">
                <Phone size={14} className="text-primary" />
                <span dir="ltr">{employee.phone_number}</span>
              </div>
            )}
            {employee.national_id && (
              <div className="flex items-center gap-1.5 bg-background/50 px-3 py-1.5 rounded-lg border border-border/50">
                <Contact size={14} className="text-primary" />
                <span>{employee.national_id}</span>
              </div>
            )}
            {employee.created_at && (
              <div className="flex items-center gap-1.5 bg-background/50 px-3 py-1.5 rounded-lg border border-border/50">
                <Calendar size={14} className="text-primary" />
                <span>{employee.created_at}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal & Health */}
        <div className="space-y-6 lg:col-span-1">
          {/* Personal Information */}
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-border shadow-sm">
            <h2 className="text-lg font-bold text-text flex items-center gap-2 mb-6 pb-4 border-b border-border/50">
              <User size={20} className="text-primary" />
              {t('show_employee.personal_info', 'hr') || 'المعلومات الشخصية'}
            </h2>
            <div className="space-y-4">
              <InfoRow label={t('employees.mother_name', 'hr') || 'اسم الأم'} value={employee.mother_name} />
              <InfoRow label={t('employees.grandfather_name', 'hr') || 'اسم الجد'} value={employee.grandfather_name} />
              <InfoRow label={t('employees.gender', 'hr') || 'الجنس'} value={employee.gender === 'male' ? (t('employees.gender_male', 'hr') || 'ذكر') : employee.gender === 'female' ? (t('employees.gender_female', 'hr') || 'أنثى') : employee.gender} />
              <InfoRow label={t('employees.date_birth', 'hr') || 'تاريخ الميلاد'} value={employee.date_birth} />
              <InfoRow label={t('employees.place_birth', 'hr') || 'مكان الميلاد'} value={employee.place_birth} />
              <InfoRow label={t('employees.assigned_job', 'hr') || 'العمل المكلف به'} value={employee.assigned_job} />
              <InfoRow label={t('employees.marital_status', 'hr') || 'الحالة الاجتماعية'} value={getMaritalStatus(employee.marital_status, t)} />
              {employee.marital_status === 'married' && (
                <>
                  <InfoRow label={t('employees.spouse_name', 'hr') || 'اسم الزوج/الزوجة'} value={employee.spouse_name} />
                  <InfoRow label={t('employees.spouse_workplace', 'hr') || 'جهة عمل الزوج/الزوجة'} value={employee.spouse_workplace} />
                  <InfoRow label={t('employees.number_of_children', 'hr') || 'عدد الأولاد'} value={employee.number_of_children} />
                </>
              )}
              <InfoRow label={t('employees.sham_cash_account', 'hr') || 'حساب الشام كاش'} value={employee.sham_cash_account} icon={<CreditCard size={14} />} />
              <InfoRow label={t('employees.civil_registry_record', 'hr') || 'رقم القيد المدني'} value={employee.civil_registry_record} />
            </div>
          </div>

          {/* Health & Location Information */}
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-border shadow-sm">
            <h2 className="text-lg font-bold text-text flex items-center gap-2 mb-6 pb-4 border-b border-border/50">
              <HeartPulse size={20} className="text-danger" />
              {t('show_employee.health_residence', 'hr') || 'المعلومات الصحية والسكن'}
            </h2>
            <div className="space-y-4">
              <InfoRow label={t('employees.blood_type', 'hr') || 'فصيلة الدم'} value={employee.blood_type} icon={<Droplet size={14} className="text-danger" />} />
              <InfoRow label={t('employees.health_status', 'hr') || 'الحالة الصحية'} value={employee.health_status} />
              {employee.injury_details && (
                <div className="bg-danger/5 border border-danger/10 p-3 rounded-lg mt-2">
                  <p className="text-xs text-text-muted mb-1 font-medium">{t('employees.injury_details', 'hr') || 'تفاصيل الإصابة'}</p>
                  <p className="text-sm text-text">{employee.injury_details}</p>
                  {employee.injury_date && (
                    <p className="text-xs text-text-muted mt-2 flex items-center gap-1">
                      <Calendar size={12} /> {employee.injury_date}
                    </p>
                  )}
                </div>
              )}
              {employee.chronic_diseases && employee.chronic_diseases.length > 0 && (
                <div className="pt-4 mt-4 border-t border-border/50">
                  <h3 className="text-sm font-semibold text-text-muted mb-3 flex items-center gap-1.5">
                    <Activity size={14} className="text-danger" />
                    {t('employees.chronic_diseases', 'hr') || 'الأمراض المزمنة'}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {employee.chronic_diseases.map((disease) => (
                      <span key={disease.id} className="px-3 py-1 bg-danger/5 text-danger text-sm rounded-full border border-danger/10">
                        {getLocalizedName(disease.name) || disease.id}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="pt-4 mt-4 border-t border-border/50">
                <h3 className="text-sm font-semibold text-text-muted mb-3 flex items-center gap-1.5">
                  <MapPin size={14} className="text-primary" />
                  {t('employees.residential_area_details', 'hr') || 'العنوان بالتفصيل'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoRow label={t('employees.country', 'hr') || 'الدولة'} value={employee.residence_region?.city?.country?.name || '-'} />
                  <InfoRow label={t('employees.city', 'hr') || 'المدينة'} value={employee.residence_region?.city?.name || '-'} />
                  <InfoRow label={t('employees.region', 'hr') || 'المنطقة'} value={employee.residence_region?.name || '-'} />
                  <InfoRow label={t('employees.residential_area_details', 'hr') || 'تفاصيل السكن'} value={employee.residential_area_details} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Employment & Education */}
        <div className="space-y-6 lg:col-span-2">
          {/* Employment Details */}
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-border shadow-sm">
            <h2 className="text-lg font-bold text-text flex items-center gap-2 mb-6 pb-4 border-b border-border/50">
              <Briefcase size={20} className="text-primary" />
              {t('show_employee.employment_details', 'hr') || 'التفاصيل الوظيفية'}
            </h2>
            {employee.employment_details ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <InfoRow label={t('employees.job_title', 'hr') || 'المسمى الوظيفي'} value={employee.employment_details.job_title} />
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm text-text-muted">{t('employees.status', 'hr') || 'حالة الموظف'}</span>
                  <div>
                    <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-md border ${getStatusColor(employee.employment_details.status)}`}>
                      {getStatusLabel(employee.employment_details.status, t)}
                    </span>
                  </div>
                </div>
                <InfoRow label={t('employees.appointment_date', 'hr') || 'تاريخ التعيين'} value={employee.employment_details.appointment_date} icon={<Calendar size={14} />} />
                <InfoRow label={t('employees.contract_type', 'hr') || 'نوع العقد'} value={getContractType(employee.employment_details.contract_type, t)} />
                <InfoRow label={t('employees.contract_nature', 'hr') || 'طبيعة العقد'} value={getContractNature(employee.employment_details.contract_nature, t)} />
                <InfoRow label={t('employees.job_category', 'hr') || 'التصنيف الوظيفي'} value={employee.employment_details.job_category} />
                <InfoRow label={t('employees.org_unit_id', 'hr') || 'الرقم التعريفي للوحدة التنظيمية'} value={employee.employment_details.org_unit_id} icon={<Building2 size={14} />} />
                <InfoRow label={t('employees.workplace_city', 'hr') || 'مدينة العمل'} value={employee.employment_details.workplace_city?.name || employee.employment_details.workplace_city_id || '-'} icon={<MapPin size={14} />} />
              </div>
            ) : (
              <EmptyState message={t('show_employee.no_employment_data', 'hr') || 'لا توجد معلومات وظيفية مسجلة'} />
            )}
          </div>

          {/* Education Details */}
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-border shadow-sm">
            <h2 className="text-lg font-bold text-text flex items-center gap-2 mb-6 pb-4 border-b border-border/50">
              <GraduationCap size={20} className="text-primary" />
              {t('show_employee.education_details', 'hr') || 'المؤهلات العلمية'}
            </h2>
            {employee.educations && employee.educations.length > 0 ? (
              <div className="space-y-4">
                {employee.educations.map((edu, idx) => (
                  <div key={edu.id || idx} className="bg-background/50 border border-border/60 rounded-xl p-5 hover:border-primary/30 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-lg text-text">{edu.degree_name || t('show_employee.not_specified', 'hr') || 'شهادة غير محددة'}</h3>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded border border-primary/20">
                        {edu.category === 'latest' ? (t('show_employee.edu_category_latest', 'hr') || 'أحدث') : (t('show_employee.edu_category_previous', 'hr') || 'سابقة')}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-text-muted">{t('employees.university', 'hr') || 'الجامعة'}</span>
                        <span className="text-sm font-medium">{getLocalizedName(edu.university?.name) || edu.university_id || '-'}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-text-muted">{t('employees.faculty', 'hr') || 'الكلية'}</span>
                        <span className="text-sm font-medium">{getLocalizedName(edu.faculty?.name) || edu.faculty_id || '-'}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-text-muted">{t('employees.specialization', 'hr') || 'التخصص'}</span>
                        <span className="text-sm font-medium">{getLocalizedName(edu.specialization?.name) || edu.specialization_id || '-'}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-text-muted">{t('employees.graduation_year', 'hr') || 'سنة التخرج'}</span>
                        <span className="text-sm font-medium">{edu.graduation_year || '-'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message={t('show_employee.no_education_data', 'hr') || 'لا توجد مؤهلات علمية مسجلة'} />
            )}
          </div>

          {/* Children Details */}
          {employee.children && employee.children.length > 0 && (
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-border shadow-sm">
              <h2 className="text-lg font-bold text-text flex items-center gap-2 mb-6 pb-4 border-b border-border/50">
                <User size={20} className="text-primary" />
                {t('employees.children', 'hr') || 'الأولاد'}
              </h2>
              <div className="space-y-4">
                {employee.children.map((child, idx) => (
                  <div key={child.id || idx} className="bg-background/50 border border-border/60 rounded-xl p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <InfoRow label={t('employees.child_name', 'hr') || 'اسم الابن'} value={child.name} />
                      <InfoRow label={t('employees.date_birth', 'hr') || 'تاريخ الميلاد'} value={child.birthdate} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {storage?.FileExplorerDialogComponent && employee?.folder &&
        <storage.FileExplorerDialogComponent isOpen={FileExplorerOpen} onClose={() => { setFileExplorerOpen(false) }} folderId={employee.folder} />
      }

      {storage?.FilePickerComponent && employee?.folder &&
        <storage.FilePickerComponent onSelect={handlePhotoSelect} multiple={false} isOpen={employeePhotoPickerOpen} onClose={() => { setEmployeePhotoPickerOpen(false) }} folderId={employee.folder} fileTypes={["image"]} />
      }
    </div>
  );
}

// Helper Components
function InfoRow({ label, value, icon }: { label: string; value: any; icon?: React.ReactNode }) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm text-text-muted flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <span className="text-base font-medium text-text">
        {value !== null && value !== undefined && value !== '' ? value : <span className="text-text-muted/50 italic">{t('show_employee.not_available', 'hr') || 'غير متوفر'}</span>}
      </span>
    </div>
  );
}

// Helper formatters
function getMaritalStatus(status: string | null | undefined, t: any) {
  switch (status) {
    case 'single': return t('employees.marital_single', 'hr') || 'أعزب';
    case 'married': return t('employees.marital_married', 'hr') || 'متزوج';
    case 'divorced': return t('employees.marital_divorced', 'hr') || 'مطلق';
    case 'widowed': return t('employees.marital_widowed', 'hr') || 'أرمل';
    default: return status;
  }
}

function getStatusLabel(status: string | undefined, t: any) {
  switch (status) {
    case 'active': return t('show_employee.status_active', 'hr') || 'نشط';
    case 'inactive': return t('show_employee.status_inactive', 'hr') || 'غير نشط';
    case 'suspended': return t('show_employee.status_suspended', 'hr') || 'موقوف';
    case 'terminated': return t('show_employee.status_terminated', 'hr') || 'منتهي';
    case 'on_leave': return t('show_employee.status_on_leave', 'hr') || 'في إجازة';
    default: return status || t('show_employee.status_unknown', 'hr') || 'غير معروف';
  }
}

function getStatusColor(status?: string) {
  switch (status) {
    case 'active': return 'bg-success/10 text-success border-success/20';
    case 'inactive': return 'bg-warning/10 text-warning border-warning/20';
    case 'suspended': return 'bg-danger/10 text-danger border-danger/20';
    case 'terminated': return 'bg-text-muted/10 text-text-muted border-text-muted/20';
    default: return 'bg-primary/10 text-primary border-primary/20';
  }
}

function getContractType(type: string | undefined, t: any) {
  switch (type) {
    case 'full-time': return t('show_employee.contract_full_time', 'hr') || 'دوام كامل';
    case 'part-time': return t('show_employee.contract_part_time', 'hr') || 'دوام جزئي';
    case 'temporary': return t('show_employee.contract_temporary', 'hr') || 'مؤقت';
    case 'contract': return t('show_employee.contract_contract', 'hr') || 'عقد';
    default: return type;
  }
}

function getContractNature(nature: string | undefined, t: any) {
  switch (nature) {
    case 'permanent': return t('show_employee.nature_permanent', 'hr') || 'دائم';
    case 'temporary': return t('show_employee.nature_temporary', 'hr') || 'مؤقت';
    case 'internship': return t('show_employee.nature_internship', 'hr') || 'تدريب';
    default: return nature;
  }
}
