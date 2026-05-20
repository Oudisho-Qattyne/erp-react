import React, { useEffect } from 'react';
import { Download, Filter, Calendar } from 'lucide-react';
import { Badge } from '../../../../core/presentation/layouts/ui/badges/Badge';
import { Button } from '../../../../core/presentation/layouts/ui/buttons/Button';
import { TrendChart } from '../../../../core/presentation/layouts/ui/statistics/TrendChart';
import { ComparisonChart } from '../../../../core/presentation/layouts/ui/statistics/ComparisonChart';
import { DistributionCard } from '../../../../core/presentation/layouts/ui/statistics/DistributionCard';
import { useEntityCrud } from '../../../../core/presentation/hooks/data/useEntity';
import type { Country } from '../../../../core/domain/entities/regions/Country';
import type { City } from '../../../../core/domain/entities/regions/City';
import type { OrganizationalLevels } from '../../../../core/domain/entities/organizationalLevels/organizationalLevels';
import Input from '../../../../core/presentation/layouts/ui/inputs/Input';


export function ReportsPage() {
  const { getById , getAll:getAllCountries , entities : countries} = useEntityCrud<OrganizationalLevels>('hr/organizational-levels','hr/organizational-levels')
  const { getAll : getAllCities , entities : cities} = useEntityCrud<City>(`shared-kernal/countries/${1}/cities` , 'shared-kernal/cities')
  const fetchUniversities = async () => {
    await getAllCountries()
    await getAllCities()
    const OL = await getById(1)
    console.log(OL);
    
  }
  console.log(countries);
  console.log(cities);
  useEffect(() => {
    fetchUniversities()
  } , [])
  const monthlyData = [
    { m: 'كانون 2', rev: 450000, exp: 320000, occ: 72 },
    { m: 'شباط', rev: 520000, exp: 340000, occ: 75 },
    { m: 'آذار', rev: 480000, exp: 310000, occ: 74 },
    { m: 'نيسان', rev: 610000, exp: 380000, occ: 78 },
    { m: 'أيار', rev: 590000, exp: 360000, occ: 80 },
    { m: 'حزيران', rev: 720000, exp: 410000, occ: 85 },
  ];

  const plotOccupancy = [
    { name: 'المنطقة A', allocated: 45, available: 5 },
    { name: 'المنطقة B', allocated: 32, available: 18 },
    { name: 'المنطقة C', allocated: 28, available: 22 },
    { name: 'المنطقة D', allocated: 55, available: 5 },
    { name: 'المنطقة E', allocated: 12, available: 38 },
  ];

  const sectorDistribution = [
    { label: 'القطاع الغذائي', value: 15, total: 42, color: '#f59e0b' },
    { label: 'القطاع الكيميائي', value: 10, total: 42, color: '#3b82f6' },
    { label: 'القطاع الهندسي', value: 8, total: 42, color: '#10b981' },
    { label: 'القطاع النسيجي', value: 9, total: 42, color: '#8b5cf6' },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <Input onChange={() => {}} type='select-or-create' />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-black text-primary tracking-tight">التقارير والتحليلات</h1>
            <Badge label="محدثة للتو" variant="success" pulse />
          </div>
          <p className="text-sm text-text-muted">مراقبة الأداء المالي والإنتاجي للمدينة الصناعية.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="flex items-center gap-2 text-xs">
            <Filter size={16} /> تصفية
          </Button>
          <Button variant="ghost" className="flex items-center gap-2 text-xs">
            <Calendar size={16} /> الفترة الزمنية
          </Button>
          <Button variant="primary" className="flex items-center gap-2 text-xs shadow-lg shadow-primary/20">
            <Download size={16} /> تصدير PDF
          </Button>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart 
          title="الإيرادات والمصروفات الشهرية (ل.س)" 
          data={monthlyData} 
          xKey="m" 
          yKey="rev" 
          color="var(--color-success)"
        />
        
        <ComparisonChart 
          title="إشغال الأراضي حسب المنطقة" 
          data={plotOccupancy} 
          xKey="name" 
          bars={[
            { key: 'allocated', label: 'مخصص', color: 'var(--color-primary)' },
            { key: 'available', label: 'متاح', color: 'var(--color-warning)' }
          ]}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <TrendChart 
            title="نسبة الإشغال الإجمالية (%)" 
            data={monthlyData} 
            xKey="m" 
            yKey="occ" 
            color="var(--color-warning)"
            height={300}
          />
        </div>
        <div className="space-y-6">
          <DistributionCard title="توزيع القطاعات الصناعية" items={sectorDistribution} />
          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 relative overflow-hidden">
             <div className="relative z-10">
               <h4 className="text-sm font-black text-primary mb-2">تقرير الكفاءة</h4>
               <p className="text-xs text-text-muted leading-relaxed">
                 تحسن بنسبة <span className="text-success font-bold">15%</span> في سرعة معالجة الطلبات مقارنة بالشهر الماضي.
               </p>
             </div>
             <div className="absolute -right-4 -bottom-4 opacity-5">
               <TrendingUp size={100} className="text-primary" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Dummy icon for the trend box
function TrendingUp({ size, className }: { size: number, className: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
