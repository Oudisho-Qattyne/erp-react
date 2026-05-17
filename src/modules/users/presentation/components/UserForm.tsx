import { useState } from 'react'
import type { CreateUserInput } from '../../application/validators'
import { useLanguage } from '../../../../core/presentation/layouts/i18n/I18nProvider'

type UserFormProps = {
  onSubmit: (data: CreateUserInput) => void
  isLoading?: boolean
}

const UserForm = ({ onSubmit, isLoading = false }: UserFormProps) => {
  const { t } = useLanguage()
  const [formData, setFormData] = useState<CreateUserInput>({
    name: '',
    email: '',
    role: 'user',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof CreateUserInput, string>>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Basic validation (Zod will run in use case)
    if (!formData.name.trim()) {
      setErrors({ name: 'Name is required' })
      return
    }
    if (!formData.email.trim()) {
      setErrors({ email: 'Email is required' })
      return
    }
    setErrors({})
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-medium mb-1">{t('Name')}</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-border rounded-md bg-background"
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">{t('Email')}</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-3 py-2 border border-border rounded-md bg-background"
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">{t('Role')}</label>
        <select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' })}
          className="w-full px-3 py-2 border border-border rounded-md bg-background"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      
      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50"
      >
        {isLoading ? '...' : t('Submit')}
      </button>
    </form>
  )
}

export default UserForm