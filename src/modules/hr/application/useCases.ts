import {type UserRepository, UserId, Email, createUser } from '../domain'
import { createUserSchema, type CreateUserInput } from './validators'

export const createUserUseCase = async (
  repository: UserRepository,
  input: CreateUserInput
) => {
  // Validate with Zod
  const validated = createUserSchema.parse(input)
  
  const id = UserId.create(crypto.randomUUID())
  const email = Email.create(validated.email)
  
  const user = createUser(id, validated.name, email, validated.role)
  await repository.save(user)
  
  return user
}

export const getAllUsersUseCase = async (repository: UserRepository) => {
  return await repository.findAll()
}