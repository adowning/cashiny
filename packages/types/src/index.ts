import { Profile, User } from './prisma/types'

export type { Transaction, Product } from './prisma/interfaces'
/**
 * Represents a User object fully populated with its associated Profile.
 * The profile can be null if a user might not have one.
 */
export type UserWithProfile = User & {
  profile: Profile // Or PrismaProfile if a profile is always expected
}

export * from './interface/index'

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page?: number
  limit?: number
  totalPages?: number
  hasNextPage?: boolean
  hasPrevPage?: boolean
}
export type GenericApiResponse<T = any> = {
  code: number
  data: T
  message: string
}

export * from './interface/auth.interface'
export * from './interface/auth.socket-interface'
export * from './interface/routes'

export type Fetcher = {
  fetch: (request: Request | URL | string) => Promise<Response>
}
