import { z } from 'zod'

export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Invalid email format'),
  role: z.enum(['admin', 'user']),
})

export type CreateUserInput = z.infer<typeof createUserSchema>