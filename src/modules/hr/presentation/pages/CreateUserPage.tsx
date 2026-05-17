import { Link, useNavigate } from 'react-router-dom'
import { InMemoryUserRepository } from '../../infrastructure/repositories'
import { createUserUseCase } from '../../application/useCases'
import UserForm from '../components/UserForm'
import { ZodError } from 'zod'
import { useState } from 'react'
import type { CreateUserInput } from '../../application/validators'
import { useLanguage } from '../../../../core/presentation/context/i18n/I18nProvider'

const CreateUserPage = () => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: CreateUserInput) => {
    setIsLoading(true)
    setError(null)
    try {
      const repository = InMemoryUserRepository()
      await createUserUseCase(repository, data)
      navigate('/users')
    } catch (err) {
      if (err instanceof ZodError) {
        setError(err.issues.map(e => e.message).join(', '))
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('An error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('Create a new user')}</h1>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <UserForm onSubmit={handleSubmit} isLoading={isLoading} />
      
      <div className="mt-4">
        <Link to="/users" className="text-primary hover:underline">
          ← {t('Back to users')}
        </Link>
      </div>
    </div>
  )
}

export default CreateUserPage