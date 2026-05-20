import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApiClient } from '../../../../core/presentation/context/api/ApiClinetProvider';
import type { DomainResponse } from '../../../../core/domain/common/responce/DomainResponse';
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
  Activity
} from 'lucide-react';
import { useLanguage } from '../../../../core/presentation/context/i18n/I18nProvider';

export function ShowEmployeePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const apiClient = useApiClient();
  const { language } = useLanguage();

  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true);
        // The API endpoint according to docs is GET /hr/employees/{id}
        const response = await apiClient.get<DomainResponse<EmployeeData>>(`hr/employees/${id}`);
        if (response.data) {
          setEmployee(response.data);
        } else {
          setError('لم يتم العثور على الموظف');
        }
      } catch (err: any) {
        setError(err.message || 'حدث خطأ أثناء تحميل بيانات الموظف');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEmployee();
    }
  }, [id, apiClient]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="bg-danger/10 border border-danger/20 text-danger p-6 rounded-xl flex flex-col items-center gap-4">
        <p className="text-lg font-medium">{error || 'الموظف غير موجود'}</p>
        <Button onClick={() => navigate('/hr/employees')} variant="outline">
          العودة للقائمة
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => navigate('/hr/employees')}
          leftIcon={<ArrowRight size={18} />}
          className="text-text-muted hover:text-text"
        >
          العودة
        </Button>
        <div className="flex gap-3">
          <Button variant="primary" onClick={() => navigate(`/hr/employees/${id}/edit`)}>
            تعديل الموظف
          </Button>
        </div>
      </div>

      {/* Main Profile Header */}
      <div className="bg-card/60 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-border shadow-sm flex flex-col md:flex-row gap-6 items-center md:items-start relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary-light to-primary opacity-70"></div>
        <div className="w-24 h-24 md:w-32 md:h-32 bg-primary/10 rounded-full flex items-center justify-center border-4 border-card shadow-sm shrink-0">
          <User size={48} className="text-primary opacity-80" />
        </div>
        <div className="flex-1 text-center md:text-start space-y-2 pt-2">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-text">
              {employee.first_name} {employee.father_name ? `${employee.father_name} ` : ''}{employee.last_name}
            </h1>
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full border border-primary/20 self-center md:self-auto">
              {employee.internal_id}
            </span>
          </div>
          <p className="text-text-muted text-lg flex items-center justify-center md:justify-start gap-2">
            <Briefcase size={18} />
            {employee.employment_details?.job_title || 'غير محدد'}
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
              المعلومات الشخصية
            </h2>
            <div className="space-y-4">
              <InfoRow label="اسم الأم" value={employee.mother_name} />
              <InfoRow label="الجنس" value={employee.gender === 'male' ? 'ذكر' : employee.gender === 'female' ? 'أنثى' : employee.gender} />
              <InfoRow label="تاريخ الميلاد" value={employee.date_birth} />
              <InfoRow label="مكان الميلاد" value={employee.place_birth} />
              <InfoRow label="الحالة الاجتماعية" value={getMaritalStatus(employee.marital_status)} />
              {employee.marital_status === 'married' && (
                <>
                  <InfoRow label="اسم الزوج/الزوجة" value={employee.spouse_name} />
                  <InfoRow label="جهة عمل الزوج/الزوجة" value={employee.spouse_workplace} />
                </>
              )}
              <InfoRow label="حساب الشام كاش" value={employee.sham_cash_account} icon={<CreditCard size={14} />} />
              <InfoRow label="رقم القيد المدني" value={employee.civil_registry_record} />
            </div>
          </div>

          {/* Health & Location Information */}
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-border shadow-sm">
            <h2 className="text-lg font-bold text-text flex items-center gap-2 mb-6 pb-4 border-b border-border/50">
              <HeartPulse size={20} className="text-danger" />
              المعلومات الصحية والسكن
            </h2>
            <div className="space-y-4">
              <InfoRow label="فصيلة الدم" value={employee.blood_type} icon={<Droplet size={14} className="text-danger" />} />
              <InfoRow label="الحالة الصحية" value={employee.health_status} />
              {employee.injury_details && (
                <div className="bg-danger/5 border border-danger/10 p-3 rounded-lg mt-2">
                  <p className="text-xs text-text-muted mb-1 font-medium">تفاصيل الإصابة</p>
                  <p className="text-sm text-text">{employee.injury_details}</p>
                  {employee.injury_date && (
                    <p className="text-xs text-text-muted mt-2 flex items-center gap-1">
                      <Calendar size={12} /> {employee.injury_date}
                    </p>
                  )}
                </div>
              )}
              <div className="pt-4 mt-4 border-t border-border/50">
                <h3 className="text-sm font-semibold text-text-muted mb-3 flex items-center gap-1.5">
                  <MapPin size={14} className="text-primary" />
                  العنوان بالتفصيل
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoRow label="الدولة" value={employee.residence_region?.city?.country?.name?.ar || '-'} />
                  <InfoRow label="المدينة" value={employee.residence_region?.city?.name?.ar || '-'} />
                  <InfoRow label="المنطقة" value={employee.residence_region?.name?.ar || '-'} />
                  <InfoRow label="تفاصيل السكن" value={employee.residential_area_details} />
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
              التفاصيل الوظيفية
            </h2>
            {employee.employment_details ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <InfoRow label="المسمى الوظيفي" value={employee.employment_details.job_title} />
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm text-text-muted">حالة الموظف</span>
                  <div>
                    <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-md border ${getStatusColor(employee.employment_details.status)}`}>
                      {getStatusLabel(employee.employment_details.status)}
                    </span>
                  </div>
                </div>
                <InfoRow label="تاريخ التعيين" value={employee.employment_details.appointment_date} icon={<Calendar size={14} />} />
                <InfoRow label="نوع العقد" value={getContractType(employee.employment_details.contract_type)} />
                <InfoRow label="طبيعة العقد" value={getContractNature(employee.employment_details.contract_nature)} />
                <InfoRow label="التصنيف الوظيفي" value={employee.employment_details.job_category} />
                <InfoRow label="الرقم التعريفي للوحدة التنظيمية" value={employee.employment_details.org_unit_id} icon={<Building2 size={14} />} />
                <InfoRow label="مدينة العمل" value={employee.employment_details.workplace_city?.name?.ar || employee.employment_details.workplace_city_id || '-'} icon={<MapPin size={14} />} />
              </div>
            ) : (
              <div className="text-center py-8 text-text-muted bg-background/30 rounded-xl border border-dashed border-border">
                لا توجد معلومات وظيفية مسجلة
              </div>
            )}
          </div>

          {/* Education Details */}
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-border shadow-sm">
            <h2 className="text-lg font-bold text-text flex items-center gap-2 mb-6 pb-4 border-b border-border/50">
              <GraduationCap size={20} className="text-primary" />
              المؤهلات العلمية
            </h2>
            {employee.educations && employee.educations.length > 0 ? (
              <div className="space-y-4">
                {employee.educations.map((edu, idx) => (
                  <div key={edu.id || idx} className="bg-background/50 border border-border/60 rounded-xl p-5 hover:border-primary/30 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-lg text-text">{edu.degree_name || 'شهادة غير محددة'}</h3>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded border border-primary/20">
                        {edu.category === 'latest' ? 'أحدث' : 'سابقة'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-text-muted">الجامعة</span>
                        <span className="text-sm font-medium">{edu.university?.name?.ar || edu.university_id || '-'}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-text-muted">الكلية</span>
                        <span className="text-sm font-medium">{edu.faculty?.name?.ar || edu.faculty_id || '-'}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-text-muted">التخصص</span>
                        <span className="text-sm font-medium">{edu.specialization?.name?.ar || edu.specialization_id || '-'}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-text-muted">سنة التخرج</span>
                        <span className="text-sm font-medium">{edu.graduation_year || '-'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-text-muted bg-background/30 rounded-xl border border-dashed border-border flex flex-col items-center gap-2">
                <GraduationCap size={24} className="opacity-50" />
                <span>لا توجد مؤهلات علمية مسجلة</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function InfoRow({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm text-text-muted flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <span className="text-base font-medium text-text">
        {value !== null && value !== undefined && value !== '' ? value : <span className="text-text-muted/50 italic">غير متوفر</span>}
      </span>
    </div>
  );
}

// Helper formatters
function getMaritalStatus(status?: string | null) {
  switch (status) {
    case 'single': return 'أعزب';
    case 'married': return 'متزوج';
    case 'divorced': return 'مطلق';
    case 'widowed': return 'أرمل';
    default: return status;
  }
}

function getStatusLabel(status?: string) {
  switch (status) {
    case 'active': return 'نشط';
    case 'inactive': return 'غير نشط';
    case 'suspended': return 'موقوف';
    case 'terminated': return 'منتهي';
    case 'on_leave': return 'في إجازة';
    default: return status || 'غير معروف';
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

function getContractType(type?: string) {
  switch (type) {
    case 'full-time': return 'دوام كامل';
    case 'part-time': return 'دوام جزئي';
    case 'temporary': return 'مؤقت';
    case 'contract': return 'عقد';
    default: return type;
  }
}

function getContractNature(nature?: string) {
  switch (nature) {
    case 'permanent': return 'دائم';
    case 'temporary': return 'مؤقت';
    case 'internship': return 'تدريب';
    default: return nature;
  }
}
