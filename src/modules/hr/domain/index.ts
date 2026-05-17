// Branded types
export type UserId = string & { __brand: 'UserId' }
export type Email = string & { __brand: 'Email' }

export const UserId = {
  create: (value: string): UserId => {
    if (!value.trim()) throw new Error('User ID cannot be empty')
    return value as UserId
  },
}

export const Email = {
  create: (value: string): Email => {
    const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/
    if (!emailRegex.test(value)) throw new Error('Invalid email format')
    return value as Email
  },
}

// Entity interface
export interface User {
  id: UserId
  name: string
  email: Email
  role: 'admin' | 'user'
}

// Factory function
export const createUser = (
  id: UserId,
  name: string,
  email: Email,
  role: 'admin' | 'user'
): User => ({
  id,
  name,
  email,
  role,
})

// Repository interface
export interface UserRepository {
  save(user: User): Promise<void>
  findById(id: UserId): Promise<User | null>
  findAll(): Promise<User[]>
}