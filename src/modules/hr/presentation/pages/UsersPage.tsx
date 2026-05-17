import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { InMemoryUserRepository } from '../../infrastructure/repositories'
import { getAllUsersUseCase } from '../../application/useCases'
import {type User } from '../../domain'
import { useLanguage } from '../../../../core/presentation/context/i18n/I18nProvider'

const UsersPage = () => {
  const { t } = useLanguage()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const repository = InMemoryUserRepository()
    getAllUsersUseCase(repository).then((fetchedUsers) => {
      setUsers(fetchedUsers)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('Users')}</h1>
        <Link
          to="/users/create"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90"
        >
          {t('Create User')}
        </Link>
      </div>
      
      {users.length === 0 ? (
        <p className="text-muted-foreground">No users yet.</p>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-border">
                  <td className="px-4 py-2">{user.name}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2 capitalize">{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default UsersPage