// import { AppEnv } from '@/types';
import { auth } from '@/auth';
import { HonoEnv } from '@/create-app';
import { User, UserWithProfile, db } from '@cashflow/database';
import type { User as BetterAuthUser } from 'better-auth';
// import type { User as BetterAuthUser } from 'better-auth';
import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';

// const kysely = createDbClient();

export const getUserFromBetterAuthUser = async (_user: Partial<User>): Promise<UserWithProfile> => {
  const id = _user.id;
  const user = await db.user.findUniqueOrThrow({
    where: { id },
    include: { profile: true },
  });
  // const profile = await db.profile.findUniqueOrThrow({
  //   where: {  },
  //   // include: {   },
  // });
  // const kuserArr = await kysely.selectFrom('User').where('User.id', '=', id).selectAll().execute();
  // const kuser = kuserArr[0];
  // const kProfileArr = await kysely
  //   .selectFrom('Profile')
  //   .where('User.activeProfileId', '=', kuser.activeProfileId)
  //   .selectAll()
  //   .execute();
  // const kprofile = kProfileArr[0];
  // if (!kuser) throw new Error('User not found');
  // kuser.profile = kprofile;
  return user as any;
};

export default createMiddleware<HonoEnv>(async (c, next) => {
  if (!c.req.path.startsWith('/auth')) {
    const _user = c.get('user') as Partial<User>;
    if (!_user || _user === null) {
      throw new HTTPException(401, { message: 'Unauthorized' });
    }
    const userwithProfile = await getUserFromBetterAuthUser(_user);
    c.set('user_with_profile', userwithProfile);

    if (!userwithProfile) {
      throw new HTTPException(401, { message: 'Unauthorized' });
    }
    await next();
  } else {
    await next();
  }
});
