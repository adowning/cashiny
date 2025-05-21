import { HonoEnv } from '@/create-app'
import { db } from '@cashflow/database'
import { UserWithProfile } from '@cashflow/types'
import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import { User as BetterAuthUser } from 'better-auth'
export const getUserFromBetterAuthUser = async (
  _user: Partial<UserWithProfile>
): Promise<UserWithProfile> => {
  const id = _user.id
  const user = await db.user.findUniqueOrThrow({
    where: { id },
    include: { profile: true },
  })

  return user as any
}

export default createMiddleware<HonoEnv>(async (c, next) => {
  if (!c.req.path.includes('/auth')) {
    console.log('in middleware')
    const _user = c.get('user') as Partial<BetterAuthUser>
    if (!_user || _user === null) {
      throw new HTTPException(401, { message: 'Unauthorized' })
    }
    const userwithProfile = await getUserFromBetterAuthUser(_user)
    c.set('user_with_profile', userwithProfile)

    if (!userwithProfile) {
      throw new HTTPException(401, { message: 'Unauthorized' })
    }
    await next()
  } else {
    console.log('skipped middleware')
    await next()
  }
})
