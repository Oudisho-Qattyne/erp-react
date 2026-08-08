import type { FieldConfig, GroupConfig } from '../../../../core/presentation/layouts/ui/forms/GenericCreateForm';

type Translate = (key: string, module?: string) => string;

export const buildInvestorFormFields = (t: Translate, edit = false): FieldConfig[] => [
  { name: 'first_name', type: 'alpha', label: t('investors.first_name', 'investments') || 'First Name', required: true, group: 'personal' },
  { name: 'father_name', type: 'alpha', label: t('investors.father_name', 'investments') || 'Father Name', required: true, group: 'personal' },
  { name: 'grandfather_name', type: 'alpha', label: t('investors.grandfather_name', 'investments') || 'Grandfather Name', group: 'personal' },
  { name: 'last_name', type: 'alpha', label: t('investors.last_name', 'investments') || 'Last Name', required: true, group: 'personal' },
  { name: 'mother_name', type: 'alpha', label: t('investors.mother_name', 'investments') || 'Mother Name', required: true, group: 'personal' },
  { name: 'national_id', type: 'numeric', label: t('investors.national_id', 'investments') || 'National ID', group: 'personal' },
  { name: 'passport_number', type: 'numeric', label: t('investors.passport_number', 'investments') || 'Passport Number', group: 'personal' },
  { name: 'nationality', type: 'alpha', label: t('investors.nationality', 'investments') || 'Nationality', required: true, group: 'personal' },
  {
    name: 'gender',
    type: 'select',
    label: t('investors.gender', 'investments') || 'Gender',
    required: true,
    group: 'personal',
    options: [
      { value: 'male', label: t('investors.gender_male', 'investments') || 'Male' },
      { value: 'female', label: t('investors.gender_female', 'investments') || 'Female' }
    ]
  },
  { name: 'phone', type: 'numeric', label: t('investors.phone', 'investments') || 'Phone', group: 'contact' },
  { name: 'whatsapp_number', type: 'numeric', label: t('investors.whatsapp_number', 'investments') || 'WhatsApp', group: 'contact' },
  { name: 'email', type: 'email', label: t('investors.email', 'investments') || 'Email', group: 'contact' },
  { name: 'address', type: 'textarea', label: t('investors.address', 'investments') || 'Address' },
  { name: 'facebook', type: 'text', label: t('investors.facebook', 'investments') || 'Facebook', group: 'social' },
  { name: 'instagram', type: 'text', label: t('investors.instagram', 'investments') || 'Instagram', group: 'social' },
  { name: 'x', type: 'text', label: t('investors.x', 'investments') || 'X', group: 'social' },
  { name: 'linkedin', type: 'text', label: t('investors.linkedin', 'investments') || 'Linkedin', group: 'social' },
  ...(edit
    ? [{ name: 'is_possible_investor_in_future', type: 'checkbox' as const, label: t('investors.is_possible_investor_in_future', 'investments') || 'Is Possible Investor In Future' }]
    : []),
];

export const buildInvestorFormGroups = (t: Translate): GroupConfig[] => [
  {
    group: 'personal',
    title: t('investors.personal_info', 'investments') || 'Personal Info',
    rows: [
      ['first_name', 'father_name'],
      ['grandfather_name', 'last_name'],
      ['mother_name', 'national_id', 'passport_number'],
      ['nationality', 'gender'],
    ],
  },
  { group: 'contact', title: t('investors.contact_info', 'investments') || 'Contact Info', rows: [['phone', 'whatsapp_number', 'email']] },
  { group: 'social', title: t('investors.social_media', 'investments') || 'Social Media', rows: [['facebook', 'instagram', 'x', 'linkedin']] },
];