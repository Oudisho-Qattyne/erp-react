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
import { GenericCreateForm } from '../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import { useLanguage } from '../../../../core/presentation/context/i18n/I18nProvider';

type Tab = 'countries' | 'cities' | 'regions' | 'universities' | 'faculties' | 'specializations';

export function SystemLookupsPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('countries');

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{t('lookups.title', 'hr') || 'إدارة البيانات الأساسية'}</h1>

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

  useEffect(() => { getAll(); }, [getAll]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{t('lookups.tabs.countries', 'hr') || 'الدول'}</h2>
      <GenericCreateForm
        fields={[{ name: 'name', label: t('employees.country', 'hr') || 'اسم الدولة', required: true }]}
        schema={CountryFormSchema}
        onSubmit={async (data) => {
          await create({ name: { ar: data.name } });
        }}
        submitLabel={t('employee_form.add_country', 'hr') || "إضافة دولة جديدة"}
      />
      <div className="mt-4 border rounded overflow-hidden">
        <ul className="divide-y">
          {countries.map((c: any) => (
            <li key={c.id} className="p-3 flex justify-between items-center">
              <span>{c.name}</span>
              <Button variant="danger" size="sm" onClick={() => remove(c.id)}>{t('common.delete') || 'حذف'}</Button>
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

  useEffect(() => { loadCountries(); }, [loadCountries]);
  useEffect(() => { if (selectedCountry) getAllByCountry(selectedCountry); }, [selectedCountry, getAllByCountry]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{t('lookups.tabs.cities', 'hr') || 'المدن'}</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">{t('employees.country', 'hr') || 'الدولة'}</label>
        <select
          className="w-full border rounded p-2 bg-background"
          onChange={(e) => setSelectedCountry(Number(e.target.value))}
          value={selectedCountry || ''}
        >
          <option value="" disabled>{t('common.select') || 'اختر...'}</option>
          {countries.map((c: any) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {selectedCountry ? (
        <>
          <GenericCreateForm
            fields={[{ name: 'name', label: t('employees.city', 'hr') || 'اسم المدينة', required: true }]}
            schema={CityFormSchema.omit({ country_id: true })}
            onSubmit={async (data) => {
              await create({ name: { ar: data.name }, country_id: selectedCountry });
            }}
            submitLabel={t('employee_form.add_city', 'hr') || "إضافة مدينة"}
          />
          <div className="mt-4 border rounded overflow-hidden">
            <ul className="divide-y">
              {cities.map((c: any) => (
                <li key={c.id} className="p-3 flex justify-between items-center">
                  <span>{c.name}</span>
                  <Button variant="danger" size="sm" onClick={() => remove(c.id)}>{t('common.delete') || 'حذف'}</Button>
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

  const [selectedCountry, setSelectedCountry] = useState<number | null>(null);
  const [selectedCity, setSelectedCity] = useState<number | null>(null);

  useEffect(() => { loadCountries(); }, [loadCountries]);
  useEffect(() => {
    if (selectedCountry) {
      getAllByCountry(selectedCountry);
      setSelectedCity(null);
    }
  }, [selectedCountry, getAllByCountry]);
  useEffect(() => { if (selectedCity) getAllByCity(selectedCity); }, [selectedCity, getAllByCity]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{t('lookups.tabs.regions', 'hr') || 'المناطق'}</h2>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">{t('employees.country', 'hr') || 'الدولة'}</label>
          <select
            className="w-full border rounded p-2 bg-background"
            onChange={(e) => setSelectedCountry(Number(e.target.value))}
            value={selectedCountry || ''}
          >
            <option value="" disabled>{t('common.select') || 'اختر...'}</option>
            {countries.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t('employees.city', 'hr') || 'المدينة'}</label>
          <select
            className="w-full border rounded p-2 bg-background"
            onChange={(e) => setSelectedCity(Number(e.target.value))}
            value={selectedCity || ''}
            disabled={!selectedCountry}
          >
            <option value="" disabled>{t('common.select') || 'اختر...'}</option>
            {cities.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedCity ? (
        <>
          <GenericCreateForm
            fields={[{ name: 'name', label: t('employees.region', 'hr') || 'اسم المنطقة', required: true }]}
            schema={RegionFormSchema.omit({ city_id: true })}
            onSubmit={async (data) => {
              await create({ name: { ar: data.name }, city_id: selectedCity });
            }}
            submitLabel={t('employee_form.add_region', 'hr') || "إضافة منطقة"}
          />
          <div className="mt-4 border rounded overflow-hidden">
            <ul className="divide-y">
              {regions.map((r: any) => (
                <li key={r.id} className="p-3 flex justify-between items-center">
                  <span>{r.name}</span>
                  <Button variant="danger" size="sm" onClick={() => remove(r.id)}>{t('common.delete') || 'حذف'}</Button>
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

  useEffect(() => { getAll(); }, [getAll]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{t('lookups.tabs.universities', 'hr') || 'الجامعات'}</h2>
      <GenericCreateForm
        fields={[{ name: 'name', label: t('employees.university', 'hr') || 'اسم الجامعة', required: true }]}
        schema={UniversityFormSchema}
        onSubmit={async (data) => {
          await create({ name: data.name });
        }}
        submitLabel={t('employee_form.add_university', 'hr') || "إضافة جامعة"}
      />
      <div className="mt-4 border rounded overflow-hidden">
        <ul className="divide-y">
          {universities.map((u: any) => (
            <li key={u.id} className="p-3 flex justify-between items-center">
              <span>{u.name}</span>
              <Button variant="danger" size="sm" onClick={() => remove(u.id)}>{t('common.delete') || 'حذف'}</Button>
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

  useEffect(() => { loadUniversities(); }, [loadUniversities]);
  useEffect(() => { if (selectedUniversity) getAllByUniversity(selectedUniversity); }, [selectedUniversity, getAllByUniversity]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{t('lookups.tabs.faculties', 'hr') || 'الكليات'}</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">{t('employees.university', 'hr') || 'الجامعة'}</label>
        <select
          className="w-full border rounded p-2 bg-background"
          onChange={(e) => setSelectedUniversity(Number(e.target.value))}
          value={selectedUniversity || ''}
        >
          <option value="" disabled>{t('common.select') || 'اختر...'}</option>
          {universities.map((u: any) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
      </div>

      {selectedUniversity ? (
        <>
          <GenericCreateForm
            fields={[{ name: 'name', label: t('employees.faculty', 'hr') || 'اسم الكلية', required: true }]}
            schema={FacultyFormSchema.omit({ university_id: true })}
            onSubmit={async (data) => {
              await create({ name: data.name, university_id: selectedUniversity });
            }}
            submitLabel={t('employee_form.add_faculty', 'hr') || "إضافة كلية"}
          />
          <div className="mt-4 border rounded overflow-hidden">
            <ul className="divide-y">
              {faculties.map((f: any) => (
                <li key={f.id} className="p-3 flex justify-between items-center">
                  <span>{f.name}</span>
                  <Button variant="danger" size="sm" onClick={() => remove(f.id)}>{t('common.delete') || 'حذف'}</Button>
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

  const [selectedUniversity, setSelectedUniversity] = useState<number | null>(null);
  const [selectedFaculty, setSelectedFaculty] = useState<number | null>(null);

  useEffect(() => { loadUniversities(); }, [loadUniversities]);
  useEffect(() => {
    if (selectedUniversity) {
      getAllByUniversity(selectedUniversity);
      setSelectedFaculty(null);
    }
  }, [selectedUniversity, getAllByUniversity]);
  useEffect(() => { if (selectedFaculty) getAllByFaculty(selectedFaculty); }, [selectedFaculty, getAllByFaculty]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{t('lookups.tabs.specializations', 'hr') || 'التخصصات'}</h2>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">{t('employees.university', 'hr') || 'الجامعة'}</label>
          <select
            className="w-full border rounded p-2 bg-background"
            onChange={(e) => setSelectedUniversity(Number(e.target.value))}
            value={selectedUniversity || ''}
          >
            <option value="" disabled>{t('common.select') || 'اختر...'}</option>
            {universities.map((u: any) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">{t('employees.faculty', 'hr') || 'الكلية'}</label>
          <select
            className="w-full border rounded p-2 bg-background"
            onChange={(e) => setSelectedFaculty(Number(e.target.value))}
            value={selectedFaculty || ''}
            disabled={!selectedUniversity}
          >
            <option value="" disabled>{t('common.select') || 'اختر...'}</option>
            {faculties.map((f: any) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedFaculty ? (
        <>
          <GenericCreateForm
            fields={[{ name: 'name', label: t('employees.specialization', 'hr') || 'اسم التخصص', required: true }]}
            schema={SpecializationFormSchema.omit({ faculty_id: true })}
            onSubmit={async (data) => {
              await create({ name: data.name, faculty_id: selectedFaculty });
            }}
            submitLabel={t('employee_form.add_specialization', 'hr') || "إضافة تخصص"}
          />
          <div className="mt-4 border rounded overflow-hidden">
            <ul className="divide-y">
              {specializations.map((s: any) => (
                <li key={s.id} className="p-3 flex justify-between items-center">
                  <span>{s.name}</span>
                  <Button variant="danger" size="sm" onClick={() => remove(s.id)}>{t('common.delete') || 'حذف'}</Button>
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
