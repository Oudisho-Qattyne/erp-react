import type { FieldConfig, GroupConfig } from '../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import type { Facility } from '../../domain/entities/facility';

type Translate = (key: string, module?: string) => string;

export const buildFacilityFormFields = (t: Translate): FieldConfig[] => [
  { name: 'name', type: 'alpha', label: t('facilities.name', 'investments') || 'Name', required: true, group: 'basic_info' },
  { name: 'address', type: 'text', label: t('facilities.address', 'investments') || 'Address', required: true, group: 'basic_info' },
  { name: 'city', type: 'alpha', label: t('facilities.city', 'investments') || 'City', required: true, group: 'basic_info' },
  { name: 'first_phone_number', type: 'numeric', label: t('facilities.first_phone_number', 'investments') || 'Phone', required: true, group: 'contact' },
  { name: 'second_phone_number', type: 'numeric', label: t('facilities.second_phone_number', 'investments') || 'Phone 2', group: 'contact' },
  { name: 'email', type: 'email', label: t('facilities.email', 'investments') || 'Email', group: 'contact' },
  { name: 'capital_in_syp', type: 'number', label: t('facilities.capital_in_syp', 'investments') || 'Capital (SYP)', required: true, group: 'financial' },
  { name: 'capital_in_usd', type: 'number', label: t('facilities.capital_in_usd', 'investments') || 'Capital (USD)', required: true, group: 'financial' },
  { name: 'value_of_machines_in_syp', type: 'number', label: t('facilities.value_of_machines_in_syp', 'investments') || 'Machinery Value (SYP)', required: true, group: 'financial' },
  { name: 'value_of_machines_in_usd', type: 'number', label: t('facilities.value_of_machines_in_usd', 'investments') || 'Machinery Value (USD)', required: true, group: 'financial' },
  { name: 'number_of_workers', type: 'number', label: t('facilities.number_of_workers', 'investments') || 'Workers', required: true, group: 'production' },
  { name: 'daily_production_capacity', type: 'number', label: t('facilities.daily_production_capacity', 'investments') || 'Daily Capacity', required: true, group: 'production' },
  { name: 'monthly_production_capacity', type: 'number', label: t('facilities.monthly_production_capacity', 'investments') || 'Monthly Capacity', required: true, group: 'production' },
  { name: 'yearly_production_capacity', type: 'number', label: t('facilities.yearly_production_capacity', 'investments') || 'Annual Capacity', required: true, group: 'production' },
  { name: 'electrical_power_capacity', type: 'text', label: t('facilities.electrical_power_capacity', 'investments') || 'Power Capacity', required: true, group: 'utilities' },
  { name: 'yearly_estimated_water_consumption', type: 'number', label: t('facilities.yearly_estimated_water_consumption', 'investments') || 'Water Consumption', required: true, group: 'utilities' },
];

export const buildFacilityFormGroups = (t: Translate): GroupConfig[] => [
  {
    group: 'basic_info',
    title: t('facilities.group_basic_info', 'investments') || 'Basic Information',
    columns: 3,
    rows: [['name', 'address', 'city']],
  },
  {
    group: 'contact',
    title: t('facilities.group_contact', 'investments') || 'Contact Information',
    columns: 3,
    rows: [['first_phone_number', 'second_phone_number', 'email']],
  },
  {
    group: 'financial',
    title: t('facilities.group_financial', 'investments') || 'Financial Information',
    columns: 2,
    rows: [
      ['capital_in_syp', 'capital_in_usd'],
      ['value_of_machines_in_syp', 'value_of_machines_in_usd'],
    ],
  },
  {
    group: 'production',
    title: t('facilities.group_production', 'investments') || 'Production Capacity',
    columns: 2,
    rows: [
      ['number_of_workers', 'daily_production_capacity'],
      ['monthly_production_capacity', 'yearly_production_capacity'],
    ],
  },
  {
    group: 'utilities',
    title: t('facilities.group_utilities', 'investments') || 'Utilities',
    columns: 2,
    rows: [['electrical_power_capacity', 'yearly_estimated_water_consumption']],
  },
];

export const buildFacilityDefaultValues = (facility: Facility): Record<string, string | number | null | undefined> => ({
  name: facility.name,
  address: facility.address,
  city: facility.city,
  first_phone_number: facility.first_phone_number,
  second_phone_number: facility.second_phone_number ?? null,
  email: facility.email || '',
  capital_in_syp: facility.capital_in_syp,
  capital_in_usd: facility.capital_in_usd,
  value_of_machines_in_syp: facility.value_of_machines_in_syp,
  value_of_machines_in_usd: facility.value_of_machines_in_usd,
  number_of_workers: facility.number_of_workers,
  daily_production_capacity: facility.daily_production_capacity,
  monthly_production_capacity: facility.monthly_production_capacity,
  yearly_production_capacity: facility.yearly_production_capacity,
  electrical_power_capacity: String(facility.electrical_power_capacity ?? ''),
  yearly_estimated_water_consumption: facility.yearly_estimated_water_consumption,
});