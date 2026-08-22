import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useCities, useEntityCrud, useFaculties, useRegions, useSpecializations } from '../hooks';
import { CityFormSchema } from '../../../../core/presentation/schemas/regions/cityForm.schema';
import { RegionFormSchema } from '../../../../core/presentation/schemas/regions/regionForm.schema';
import type { University } from '../../../../core/domain/entities/education/University';
import { UniversityFormSchema } from '../../../../core/presentation/schemas/education/universityForm.schema';
import { FacultyFormSchema } from '../../../../core/presentation/schemas/education/facultyForm.schema';
import { SpecializationFormSchema } from '../../../../core/presentation/schemas/education/specializationForm.schema';
import type { Country } from '../../../../core/domain/entities/regions/Country';
import { CountryFormSchema } from '../../../../core/presentation/schemas/regions/countryForm.schema';
import { Button } from '../../../../core/presentation/layouts/ui/buttons/Button';
import { Dialog } from '../../../../core/presentation/layouts/ui/dialog/Dialog';
import { GenericCreateForm } from '../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import Input from '../../../../core/presentation/layouts/ui/inputs/Input';
import { inputBaseClasses } from '../../../../core/presentation/layouts/ui/inputs/styles';
import { useLanguage } from '../../../../core/presentation/context/i18n/I18nProvider';
import { toast } from 'sonner';
import { handleApiError } from '../../../../core/presentation/utils/handleApiError';

type Tab = 'countries' | 'cities' | 'regions' | 'universities' | 'faculties' | 'specializations';

export function SystemLookupsPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('countries');

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{t('lookups.title', 'hr') || 'إعدادات النطام'}</h1>

      <div className="flex space-x-2 space-x-reverse border-b border-border pb-2 overflow-x-auto">
        {(['countries', 'cities', 'regions', 'universities', 'faculties', 'specializations'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-t-md font-medium transition-colors ${activeTab === tab
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted text-muted-foreground'
              }`}
          >
            {t(`lookups.tabs.${tab}`, 'hr') || tab}
          </button>
        ))}
      </div>

      <div className="bg-card rounded-b-lg rounded-tl-lg p-6 border border-border">
        {activeTab === 'countries' && <CountriesSection />}
        {activeTab === 'cities' && <CitiesSection />}
        {activeTab === 'regions' && <RegionsSection />}
        {activeTab === 'universities' && <UniversitiesSection />}
        {activeTab === 'faculties' && <FacultiesSection />}
        {activeTab === 'specializations' && <SpecializationsSection />}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Countries Section
// -----------------------------------------------------------------------------
function CountriesSection() {
  const { t } = useLanguage();
  const { entities: countries, getAll, create, remove } = useEntityCrud<Country>('/shared-kernal/countries', '/shared-kernal/countries');
  const entity = t('lookups.tabs.countries', 'hr') || 'الدولة';
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const filtered = countries.filter((c: any) => c.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  useEffect(() => { getAll(); }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{t('lookups.tabs.countries', 'hr') || 'الدول'}</h2>
      <div className="flex gap-2">
        <Input
          type="text"
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t('common.search') || 'بحث'}
          baseClasses={inputBaseClasses}
          className="flex-1"
        />
        <Button onClick={() => setIsDialogOpen(true)}>{t('employee_form.add_country', 'hr') || "إضافة دولة جديدة"}</Button>
      </div>
      <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} title={t('employee_form.add_country', 'hr') || "إضافة دولة جديدة"}>
        <GenericCreateForm
          fields={[{ name: 'name', type: 'alpha', label: t('employees.country', 'hr') || 'اسم الدولة', required: true }]}
          schema={CountryFormSchema}
          onSubmit={async (data) => {
              try {
                return await create({ name: { ar: data.name } });
    } catch (err : any) {
      handleApiError(err, { module: "hr" });
              throw err;
            }
          }}
          onSuccess={() => {
            toast.success(t('lookups.created', 'hr').replace('{name}', entity));
            getAll();
            setIsDialogOpen(false);
          }}
          onCancel={() => setIsDialogOpen(false)}
          submitLabel={t('employee_form.add_country', 'hr') || "إضافة دولة جديدة"}
        />
      </Dialog>
      <div className="mt-4 border rounded overflow-hidden">
        <ul className="divide-y">
          {filtered.map((c: any) => (
            <li key={c.id} className="p-3 flex justify-between items-center">
              <span>{c.name}</span>
              <Button variant="danger" size="sm" onClick={async () => {
                try {
                  await remove(c.id);
                  toast.success(t('lookups.deleted', 'hr').replace('{name}', entity));
    } catch (err : any) {
      handleApiError(err, { module: "hr" });
                }
              }}>{t('common.delete') || 'حذف'}</Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Cities Section
// -----------------------------------------------------------------------------
function CitiesSection() {
  const { t } = useLanguage();
  const { entities: countries, getAll: loadCountries } = useEntityCrud<Country>('/shared-kernal/countries', '/shared-kernal/countries');
  const { entities: cities, getAllByCountry, create, remove } = useCities();
  const [selectedCountry, setSelectedCountry] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const entity = t('lookups.tabs.cities', 'hr') || 'المدينة';
  const filtered = cities.filter((c: any) => c.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  useEffect(() => { loadCountries(); }, []);
  useEffect(() => { if (selectedCountry) getAllByCountry(selectedCountry); }, [selectedCountry]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{t('lookups.tabs.cities', 'hr') || 'المدن'}</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">{t('employees.country', 'hr') || 'الدولة'}</label>
        <Input
          type="select"
          value={selectedCountry || ''}
          onChange={(v) => setSelectedCountry(Number(v))}
          options={countries.map((c: any) => ({ value: c.id, label: c.name }))}
          placeholder={t('common.select') || 'اختر...'}
          baseClasses={inputBaseClasses}
          searchable
        />
      </div>

      {selectedCountry ? (
        <>
          <div className="flex gap-2">
            <Input
              type="text"
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t('common.search') || 'بحث'}
              baseClasses={inputBaseClasses}
              className="flex-1"
            />
            <Button onClick={() => setIsDialogOpen(true)}>{t('employee_form.add_city', 'hr') || "إضافة مدينة"}</Button>
          </div>
          <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} title={t('employee_form.add_city', 'hr') || "إضافة مدينة"}>
            <GenericCreateForm
              fields={[{ name: 'name', type: 'alpha', label: t('employees.city', 'hr') || 'اسم المدينة', required: true }]}
              schema={CityFormSchema.omit({ country_id: true })}
              onSubmit={async (data) => {
                try {
                  return await create({ name: { ar: data.name }, country_id: selectedCountry });
                } catch (err : any) {
                  toast.error(t('lookups.create_error', 'hr').replace('{name}', entity));
                  throw err;
                }
              }}
              onSuccess={() => {
                toast.success(t('lookups.created', 'hr').replace('{name}', entity));
                getAllByCountry(selectedCountry!);
                setIsDialogOpen(false);
              }}
              onCancel={() => setIsDialogOpen(false)}
              submitLabel={t('employee_form.add_city', 'hr') || "إضافة مدينة"}
            />
          </Dialog>
          <div className="mt-4 border rounded overflow-hidden">
            <ul className="divide-y">
              {filtered.map((c: any) => (
                <li key={c.id} className="p-3 flex justify-between items-center">
                  <span>{c.name}</span>
                  <Button variant="danger" size="sm" onClick={async () => {
                    try {
                      await remove(c.id);
                      toast.success(t('lookups.deleted', 'hr').replace('{name}', entity));
                    } catch (err : any) {
                      handleApiError(err, { module: "hr" });
                    }
                  }}>{t('common.delete') || 'حذف'}</Button>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <p className="text-muted-foreground">{t('lookups.select_country_first', 'hr') || 'الرجاء اختيار دولة لعرض مدنها'}</p>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Regions Section
// -----------------------------------------------------------------------------
function RegionsSection() {
  const { t } = useLanguage();
  const { entities: countries, getAll: loadCountries } = useEntityCrud<Country>('/shared-kernal/countries', '/shared-kernal/countries');
  const { entities: cities, getAllByCountry } = useCities();
  const { entities: regions, getAllByCity, create, remove } = useRegions();
  const entity = t('lookups.tabs.regions', 'hr') || 'المنطقة';
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState<number | null>(null);
  const [selectedCity, setSelectedCity] = useState<number | null>(null);

  useEffect(() => { loadCountries(); }, []);
  useEffect(() => {
    if (selectedCountry) {
      getAllByCountry(selectedCountry);
      setSelectedCity(null);
    }
  }, [selectedCountry, ]);
  useEffect(() => { if (selectedCity) getAllByCity(selectedCity); }, [selectedCity]);

  const filtered = regions.filter((r: any) => r.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{t('lookups.tabs.regions', 'hr') || 'المناطق'}</h2>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">{t('employees.country', 'hr') || 'الدولة'}</label>
          <Input
            type="select"
            value={selectedCountry || ''}
            onChange={(v) => setSelectedCountry(Number(v))}
            options={countries.map((c: any) => ({ value: c.id, label: c.name }))}
            placeholder={t('common.select') || 'اختر...'}
            baseClasses={inputBaseClasses}
            searchable
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t('employees.city', 'hr') || 'المدينة'}</label>
          <Input
            type="select"
            value={selectedCity || ''}
            onChange={(v) => setSelectedCity(Number(v))}
            options={cities.map((c: any) => ({ value: c.id, label: c.name }))}
            placeholder={t('common.select') || 'اختر...'}
            disabled={!selectedCountry}
            baseClasses={inputBaseClasses}
            searchable
          />
        </div>
      </div>

      {selectedCity ? (
        <>
          <div className="flex gap-2">
            <Input
              type="text"
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t('common.search') || 'بحث'}
              baseClasses={inputBaseClasses}
              className="flex-1"
            />
            <Button onClick={() => setIsDialogOpen(true)}>{t('employee_form.add_region', 'hr') || "إضافة منطقة"}</Button>
          </div>
          <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} title={t('employee_form.add_region', 'hr') || "إضافة منطقة"}>
            <GenericCreateForm
              fields={[{ name: 'name', type: 'alpha', label: t('employees.region', 'hr') || 'اسم المنطقة', required: true }]}
              schema={RegionFormSchema.omit({ residence_city_id: true })}
              onSubmit={async (data) => {
                try {
                  return await create({ name: { ar: data.name }, residence_city_id: selectedCity });
                } catch (err : any) {
                  toast.error(t('lookups.create_error', 'hr').replace('{name}', entity));
                  throw err;
                }
              }}
              onSuccess={() => {
                toast.success(t('lookups.created', 'hr').replace('{name}', entity));
                getAllByCity(selectedCity!);
                setIsDialogOpen(false);
              }}
              onCancel={() => setIsDialogOpen(false)}
              submitLabel={t('employee_form.add_region', 'hr') || "إضافة منطقة"}
            />
          </Dialog>
          <div className="mt-4 border rounded overflow-hidden">
            <ul className="divide-y">
              {filtered.map((r: any) => (
                <li key={r.id} className="p-3 flex justify-between items-center">
                  <span>{r.name}</span>
                  <Button variant="danger" size="sm" onClick={async () => {
                    try {
                      await remove(r.id);
                      toast.success(t('lookups.deleted', 'hr').replace('{name}', entity));
                    } catch (err : any) {
                      handleApiError(err, { module: "hr" });
                    }
                  }}>{t('common.delete') || 'حذف'}</Button>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <p className="text-muted-foreground">{t('lookups.select_city_first', 'hr') || 'الرجاء اختيار مدينة أولاً'}</p>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Universities Section
// -----------------------------------------------------------------------------
function UniversitiesSection() {
  const { t } = useLanguage();
  const { entities: universities, getAll, create, remove } = useEntityCrud<University>('/shared-kernal/universities', '/shared-kernal/universities');
  const entity = t('lookups.tabs.universities', 'hr') || 'الجامعة';
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const filtered = universities.filter((u: any) => u.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  useEffect(() => { getAll(); }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{t('lookups.tabs.universities', 'hr') || 'الجامعات'}</h2>
      <div className="flex gap-2">
        <Input
          type="text"
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t('common.search') || 'بحث'}
          baseClasses={inputBaseClasses}
          className="flex-1"
        />
        <Button onClick={() => setIsDialogOpen(true)}>{t('employee_form.add_university', 'hr') || "إضافة جامعة"}</Button>
      </div>
      <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} title={t('employee_form.add_university', 'hr') || "إضافة جامعة"}>
        <GenericCreateForm
          fields={[{ name: 'name', type: 'alpha', label: t('employees.university', 'hr') || 'اسم الجامعة', required: true }]}
          schema={UniversityFormSchema}
          onSubmit={async (data) => {
            try {
              return await create({ name: data.name });
    } catch (err : any) {
      handleApiError(err, { module: "hr" });
              throw err;
            }
          }}
          onSuccess={() => {
            toast.success(t('lookups.created', 'hr').replace('{name}', entity));
            getAll();
            setIsDialogOpen(false);
          }}
          onCancel={() => setIsDialogOpen(false)}
          submitLabel={t('employee_form.add_university', 'hr') || "إضافة جامعة"}
        />
      </Dialog>
      <div className="mt-4 border rounded overflow-hidden">
        <ul className="divide-y">
          {filtered.map((u: any) => (
            <li key={u.id} className="p-3 flex justify-between items-center">
              <span>{u.name}</span>
              <Button variant="danger" size="sm" onClick={async () => {
                try {
                  await remove(u.id);
                  toast.success(t('lookups.deleted', 'hr').replace('{name}', entity));
    } catch (err : any) {
      handleApiError(err, { module: "hr" });
                }
              }}>{t('common.delete') || 'حذف'}</Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Faculties Section
// -----------------------------------------------------------------------------
function FacultiesSection() {
  const { t } = useLanguage();
  const { entities: universities, getAll: loadUniversities } = useEntityCrud<University>('/shared-kernal/universities', '/shared-kernal/universities');
  const { entities: faculties, getAllByUniversity, create, remove } = useFaculties();
  const [selectedUniversity, setSelectedUniversity] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const entity = t('lookups.tabs.faculties', 'hr') || 'الكلية';

  useEffect(() => { loadUniversities(); }, []);
  useEffect(() => { if (selectedUniversity) getAllByUniversity(selectedUniversity); }, [selectedUniversity]);

  const filtered = faculties.filter((f: any) => f.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{t('lookups.tabs.faculties', 'hr') || 'الكليات'}</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">{t('employees.university', 'hr') || 'الجامعة'}</label>
        <Input
          type="select"
          value={selectedUniversity || ''}
          onChange={(v) => setSelectedUniversity(Number(v))}
          options={universities.map((u: any) => ({ value: u.id, label: u.name }))}
          placeholder={t('common.select') || 'اختر...'}
          baseClasses={inputBaseClasses}
          searchable
        />
      </div>

      {selectedUniversity ? (
        <>
          <div className="flex gap-2">
            <Input
              type="text"
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t('common.search') || 'بحث'}
              baseClasses={inputBaseClasses}
              className="flex-1"
            />
            <Button onClick={() => setIsDialogOpen(true)}>{t('employee_form.add_faculty', 'hr') || "إضافة كلية"}</Button>
          </div>
          <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} title={t('employee_form.add_faculty', 'hr') || "إضافة كلية"}>
            <GenericCreateForm
              fields={[{ name: 'name', type: 'alpha', label: t('employees.faculty', 'hr') || 'اسم الكلية', required: true }]}
              schema={FacultyFormSchema.omit({ university_id: true })}
              onSubmit={async (data) => {
                try {
                  return await create({ name: data.name, university_id: selectedUniversity });
                } catch (err : any) {
                  toast.error(t('lookups.create_error', 'hr').replace('{name}', entity));
                  throw err;
                }
              }}
              onSuccess={() => {
                toast.success(t('lookups.created', 'hr').replace('{name}', entity));
                getAllByUniversity(selectedUniversity!);
                setIsDialogOpen(false);
              }}
              onCancel={() => setIsDialogOpen(false)}
              submitLabel={t('employee_form.add_faculty', 'hr') || "إضافة كلية"}
            />
          </Dialog>
          <div className="mt-4 border rounded overflow-hidden">
            <ul className="divide-y">
              {filtered.map((f: any) => (
                <li key={f.id} className="p-3 flex justify-between items-center">
                  <span>{f.name}</span>
                  <Button variant="danger" size="sm" onClick={async () => {
                    try {
                      await remove(f.id);
                      toast.success(t('lookups.deleted', 'hr').replace('{name}', entity));
                    } catch (err : any) {
                      handleApiError(err, { module: "hr" });
                    }
                  }}>{t('common.delete') || 'حذف'}</Button>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <p className="text-muted-foreground">{t('lookups.select_university_first', 'hr') || 'الرجاء اختيار جامعة أولاً'}</p>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Specializations Section
// -----------------------------------------------------------------------------
function SpecializationsSection() {
  const { t } = useLanguage();
  const { entities: universities, getAll: loadUniversities } = useEntityCrud<University>('/shared-kernal/universities', '/shared-kernal/universities');
  const { entities: faculties, getAllByUniversity } = useFaculties();
  const { entities: specializations, getAllByFaculty, create, remove } = useSpecializations();
  const entity = t('lookups.tabs.specializations', 'hr') || 'التخصص';
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [selectedUniversity, setSelectedUniversity] = useState<number | null>(null);
  const [selectedFaculty, setSelectedFaculty] = useState<number | null>(null);

  useEffect(() => { loadUniversities(); }, []);
  useEffect(() => {
    if (selectedUniversity) {
      getAllByUniversity(selectedUniversity);
      setSelectedFaculty(null);
    }
  }, [selectedUniversity, getAllByUniversity]);
  useEffect(() => { if (selectedFaculty) getAllByFaculty(selectedFaculty); }, [selectedFaculty]);

  const filtered = specializations.filter((s: any) => s.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{t('lookups.tabs.specializations', 'hr') || 'التخصصات'}</h2>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">{t('employees.university', 'hr') || 'الجامعة'}</label>
          <Input
            type="select"
            value={selectedUniversity || ''}
            onChange={(v) => setSelectedUniversity(Number(v))}
            options={universities.map((u: any) => ({ value: u.id, label: u.name }))}
            placeholder={t('common.select') || 'اختر...'}
            baseClasses={inputBaseClasses}
            searchable
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t('employees.faculty', 'hr') || 'الكلية'}</label>
          <Input
            type="select"
            value={selectedFaculty || ''}
            onChange={(v) => setSelectedFaculty(Number(v))}
            options={faculties.map((f: any) => ({ value: f.id, label: f.name }))}
            placeholder={t('common.select') || 'اختر...'}
            disabled={!selectedUniversity}
            baseClasses={inputBaseClasses}
            searchable
          />
        </div>
      </div>

      {selectedFaculty ? (
        <>
          <div className="flex gap-2">
            <Input
              type="text"
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t('common.search') || 'بحث'}
              baseClasses={inputBaseClasses}
              className="flex-1"
            />
            <Button onClick={() => setIsDialogOpen(true)}>{t('employee_form.add_specialization', 'hr') || "إضافة تخصص"}</Button>
          </div>
          <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} title={t('employee_form.add_specialization', 'hr') || "إضافة تخصص"}>
            <GenericCreateForm
              fields={[{ name: 'name', type: 'alpha', label: t('employees.specialization', 'hr') || 'اسم التخصص', required: true }]}
              schema={SpecializationFormSchema.omit({ Faculty_id: true })}
              onSubmit={async (data) => {
                try {
                  return await create({ name: data.name, faculty_id: selectedFaculty });
                } catch (err : any) {
                  toast.error(t('lookups.create_error', 'hr').replace('{name}', entity));
                  throw err;
                }
              }}
              onSuccess={() => {
                toast.success(t('lookups.created', 'hr').replace('{name}', entity));
                getAllByFaculty(selectedFaculty!);
                setIsDialogOpen(false);
              }}
              onCancel={() => setIsDialogOpen(false)}
              submitLabel={t('employee_form.add_specialization', 'hr') || "إضافة تخصص"}
            />
          </Dialog>
          <div className="mt-4 border rounded overflow-hidden">
            <ul className="divide-y">
              {filtered.map((s: any) => (
                <li key={s.id} className="p-3 flex justify-between items-center">
                  <span>{s.name}</span>
                  <Button variant="danger" size="sm" onClick={async () => {
                    try {
                      await remove(s.id);
                      toast.success(t('lookups.deleted', 'hr').replace('{name}', entity));
                    } catch (err : any) {
                      handleApiError(err, { module: "hr" });
                    }
                  }}>{t('common.delete') || 'حذف'}</Button>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <p className="text-muted-foreground">{t('lookups.select_faculty_first', 'hr') || 'الرجاء اختيار كلية أولاً'}</p>
      )}
    </div>
  );
}
