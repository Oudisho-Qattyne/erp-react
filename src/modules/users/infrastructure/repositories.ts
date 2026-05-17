import { type User, type UserRepository, UserId } from '../domain'

export const InMemoryUserRepository = (): UserRepository => {
  let users: User[] = []

  return {
    save: async (user: User) => {
      const index = users.findIndex(u => u.id === user.id)
      if (index >= 0) {
        users[index] = user
      } else {
        users.push(user)
      }
    },
    findById: async (id: UserId) => {
      return users.find(u => u.id === id) || null
    },
    findAll: async () => {
      return [...users]
    },
  }
}