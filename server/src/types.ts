import type { Env, Hono } from 'hono'

import type { auth } from './auth'
import type { BASE_PATH } from './constans'

export type Fetcher = {
  fetch: (request: Request | URL | string) => Promise<Response>
}

export type AppEnv = {
  Variables: {
    user: typeof auth.$Infer.Session.user | null
    session: typeof auth.$Infer.Session.session | null
  }
  Bindings: {
    ASSETS: Fetcher
  }
} & Env

// eslint-disable-next-line ts/no-empty-object-type
export type AppApi = Hono<AppEnv, {}, typeof BASE_PATH>

export type ErrorResponse = {
  success: false
  error: string
  isJsonError?: boolean
}

export type SuccessResponse<T = void> = {
  success: true
  message: string
  // eslint-disable-next-line ts/no-empty-object-type
} & (T extends void ? {} : { data: T })
