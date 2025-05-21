import {
  KeyMode, // Role,
  UserStatus,
  basePrisma,
  createDbClient,
  db,
} from '@cashflow/database'
import { GoogleSignInResponse, UserWithProfile } from '@cashflow/types'
import { faker } from '@faker-js/faker'
import type { User as BetterAuthUser } from 'better-auth'
import { Context, HonoRequest } from 'hono'

// Google's library
import { auth } from '../auth'
import { decodeToken } from '../utils/jwt'

const prisma = basePrisma
const kysely = createDbClient()
// const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomSubset = <T>(arr: T[], count?: number): T[] =>
  faker.helpers.arrayElements(
    arr,
    faker.number.int({
      min: 1,
      max: count !== undefined && count < arr.length ? count : arr.length,
    })
  )
// Define a more complete user type including relations expected by the client
export type AppUserWithDetails = UserWithProfile & {
  Balance?: number | null
  // VipInfo?: VipInfo | null;
  // UserSettings?: UserSettings | null;
  // Add any other relations your client's User object might need
}

// Auth utility stubs - TODO: Implement properly
export const getUserFromBetterAuthUser = async (
  _user: BetterAuthUser
): Promise<UserWithProfile> => {
  const id = _user.id
  const user = await db.user.findUniqueOrThrow({
    where: { id },
    include: { profile: true },
  })
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
  // return kuser as any;
  return user as UserWithProfile
}
// async findOrCreateUserByGoogleProfile(
//   req: Request
// ): Promise<{ user: AppUserWithDetails; isNewUser: boolean }> {
export async function findOrCreateUserByGoogleProfile(
  req: HonoRequest
): Promise<GoogleSignInResponse> {
  console.log(req)
  const json = await req.json()
  console.log(json.idToken)
  // if (username === undefined || password === undefined) {
  //   return new Response(
  //     JSON.stringify({ message: "Missing username or password", code: 401 }),
  //     { status: 401 }
  //   );
  // }
  let signInUsername
  // const salt = crypto.randomBytes(16).toString('hex')
  try {
    signInUsername = await auth.api.signInSocial({
      body: {
        provider: 'google',
        callbackURL: 'http://localhost:3000/google',
        idToken: {
          token: json.idToken, // Google Access Token
        },
      },
    })
  } catch (e) {
    // console.log(e)
    // const email = `${username}@asdf.com`
    // signInUsername = await auth.api.signInEmail({
    //   body: { password, email },
    // })
    console.log(e)
  }
  console.log(signInUsername)
  const isNewUser = false
  let user
  if (signInUsername !== undefined && signInUsername !== null) {
    // No user with this Google ID, try to find by email
    user = await db.user.findUnique({
      where: { email: (signInUsername as any)?.user.email },
      include: {
        profile: true,
      },
    })
    console.log(user)
    if (user) {
      // User found by email, link Google ID and update info
      user = await db.user.update({
        where: { id: user.id },
        data: {
          // googleId: profile.googleId,
          // avatar: profile.profileImage !== undefined ? profile.profileImage : user.profileImage,
          // lastLoginAt: new Date(),
          lastLogin: new Date(),
          // emailVerified: (profile.emailVerified && profile.email) ? new Date() : user.emailVerified,
        },
        // include: { Balance: true, VipInfo: true, UserSettings: true },
      })
    }
  } else {
    throw new Error('User find or create operation failed unexpectedly.')
  }

  if (!user) {
    // This case should ideally not be reached if logic is correct
    throw new Error('User find or create operation failed unexpectedly.')
  }

  const token = (signInUsername as any)?.token
  console.log('returning ', user.id)
  console.log('isNewUser ', isNewUser)
  // const cookieOptions = {
  //   httpOnly: true,
  //   secure: true,
  //   sameSite: 'strict',
  //   maxAge: 60 * 60 * 24 * 7, // 1 week
  //   path: '/',
  // };
  const resp: GoogleSignInResponse = {
    authenticated: true,
    accessToken: token,
    refreshToken: token,
    code: 200,
    user: user as unknown as UserWithProfile,
  }

  return resp
  // return { user: user as AppUserWithDetails, isNewUser };
}
export async function createUserWithProfileAndAccount(userData: {
  email: string
  // email: string
  username: string
  password: string
  // name?: string
  // avatar?: string
  /// 800
}) {
  console.log(userData)
  return prisma.$transaction(async () => {
    console.log('transaction')
    let defaultOperator: any = await prisma.operatorAccess.findFirst()
    let defaultOwnerUser: any = null
    const defaultBank: any = null
    const hashedPassword = await Bun.password.hash(userData.password)
    console.log(defaultOperator)
    console.log(hashedPassword)

    // Check if any operators exist
    if (!defaultOperator) {
      console.log('No operators found. Creating a default owner, operator, and bank.')
      const hashedPasswordForOwner = await Bun.password.hash('hashed_password_for_owner')

      // Create a default owner user
      defaultOwnerUser = await prisma.user.create({
        data: {
          username: 'default_operator_owner',
          email: 'owner@example.com', // Use a placeholder or generate dynamically
          passwordHash: hashedPasswordForOwner, // Generate and hash a secure password
          name: 'default_operator_owner',
          status: 'ACTIVE', // Set a default status
          // Add any other required fields for User
        },
      })
      const secret = faker.string.uuid()

      defaultOperator = await prisma.operatorAccess.create({
        data: {
          name: `house`,
          operator_secret: await Bun.password.hash(secret),
          operator_access: 'ip_whitelist',
          callback_url: faker.internet.url() + '/callback',
          active: faker.datatype.boolean(0.9),
          ownedById: defaultOwnerUser.id,
          permissions: getRandomSubset(Object.values(KeyMode), 3),
          ips: [faker.internet.ip(), faker.internet.ip()],
          description: faker.lorem.sentence(),
          last_used_at: faker.datatype.boolean(0.5) ? faker.date.recent({ days: 10 }) : null,
        },
      })
      console.log(
        `Created default operator: ${defaultOperator.name} and owner: ${defaultOwnerUser.username} and bank: ${defaultBank.name}`
      )
    }
    // Create the main user
    // console.log('email ', userData.email);
    // const newUser = await prisma.user.create({
    //   data: {
    //     username: userData.username,
    //     email: `${userData.username}@asdf.com`, //`${userData.username}@asdf.com`,
    //     passwordHash: hashedPassword,
    //     name: userData.username,
    //     avatar: `blahblah.username.webp`,
    //     status: 'ACTIVE', // Set a default status
    //     // balance: 0, // Initialize balance as Decimal
    //     // Set activeProfileId later after creating the profile if needed, or handle separately
    //     // Add any other required fields for User
    //   },
    // })
    try {
      const { headers, response } = await auth.api.signUpEmail({
        returnHeaders: true,
        //@ts-ignore
        body: {
          // id: clientId,
          email: userData.email,
          password: userData.password,
          name: userData.username, // Assuming username is used as name for signup
          username: userData.username,
          displayUsername: userData.username,
          // passwordHash: hashedPassword,
          emailVerified: true,
          image: 'avatar-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          // totalXp: 0,
          // balance: 0,
          // isVerified: true,
          // role: Role.MEMBER,
          // status: UserStatus.ACTIVE,
          lastLogin: new Date(),
          // verificationToken: '',
          // avatar: '',
          // activeProfileId: '',
          // gender: 'BOY',
          // status: 'ACTIVE',
          // cashtag: '',
          // phpId: Math.random() * 10000,
          // accessToken: '',
          // twoFactorEnabled: true,
          // banned: true,
          // banReason: '',
          // banExpires: new Date(),
          // lastDailySpin: new Date(),
        },
      })
      console.log('response', response)
      console.log('headers', headers)
      const newUser = response.user
      const token = response.token
      console.log(response)
      // Create the profile linked to the new user and the default operator/bank
      const newProfile = await prisma.profile.create({
        data: {
          // profileNumber: profileData.profileNumber,
          userId: newUser.id,
          balance: 0,
          activeCurrencyType: 'USD',

          // shopId: defaultOperator.id, // Link to the default operator
          // bankId: defaultBank.id, // Link to the default bank
          // balance: profileData.balance ?? 0, // Use provided balance or default to 0 (Int)
          // xpEarned: profileData.xpEarned ?? 0,
          // isActive: profileData.isActive ?? true,
          // lastPlayed: profileData.lastPlayed,
          // phpId: profileData.phpId,
          // Add any other required fields for Profile
        },
      })

      // Optionally update the user's activeProfileId to the newly created profile's ID
      // await prisma.user.update({
      //   where: { id: newUser.id },
      //   data: {
      //     // activeProfileId: newProfile.id,
      //   },
      // });

      // Create the account linked to the new user
      const newAccount = await prisma.account.create({
        data: {
          accountId: newUser.id,
          providerId: 'credential',
          userId: newUser.id,
          // accessToken: accountData.accessToken,
          // refreshToken: accountData.refreshToken,
          // idToken: accountData.idToken,
          // accessTokenExpiresAt: accountData.accessTokenExpiresAt,
          // refreshTokenExpiresAt: accountData.refreshTokenExpiresAt,
          // scope: accountData.scope,
          password: hashedPassword, // Again, consider security implications
          createdAt: new Date(),
          updatedAt: new Date(),
          // Add any other required fields for Account
        },
      })

      console.log(
        `Created user: ${newUser.name}, profile: ${newProfile.id}, and account for provider: ${newAccount.id}`
      )

      return {
        user: newUser,
        profile: newProfile,
        account: newAccount,
        operator: defaultOperator, // Return the operator used
        ownerUser: defaultOwnerUser, // Return the owner user if created
        token,
      }
    } catch (e) {
      console.log(e)
      return null
    }
  })
}

export const getUserFromHeader = async (req: any): Promise<UserWithProfile | null> => {
  console.log('getUserFromHeader')

  const authHeader = req.headers.get('Authorization')

  if (!authHeader) {
    return null
  }
  const token = authHeader.split(' ')[1]
  if (!token) {
    return null
  }
  const payload = decodeToken(token)
  if (payload.id === null || payload.id === undefined) return null
  const user: any = await (db as any).user.findUnique({
    where: { id: payload.id },
    include: {
      //vipInfo: true,
      activeProfile: { include: { transactions: true } },
    },
  })

  if (user === null) {
    throw new Error('no user found')
    // return null;
  }
  if (user.activeProfile === null) {
    return null
  } else {
    user.activeProfile = user.activeProfile[0]
  }
  return user
}

export const getUserFromToken = async (token: string): Promise<UserWithProfile | null> => {
  console.log('getUserFromHeader')
  if (!token) {
    return null
  }
  const payload = decodeToken(token)
  if (payload.id === null || payload.id === undefined) return null
  const user = await db.user.findUnique({
    where: { id: payload.id },
    include: { profile: true },
  })

  if (user === null) {
    return null
  }
  if (user.profile === null) {
    return null
  }

  return user as UserWithProfile
}

export async function google(c: Context, req: HonoRequest): Promise<any> {
  console.log('in google')
  const json = await req.json()
  let signInUsername
  try {
    signInUsername = await auth.api.signInSocial({
      body: {
        provider: 'google',
        callbackURL: 'http://localhost:3000/google',
        idToken: {
          token: json.idToken, // Google Access Token
        },
      },
    })
  } catch (e) {
    console.log(e)
  }
  console.log(signInUsername)
  let user
  if (signInUsername !== undefined && signInUsername !== null) {
    // User found by Google ID, update their info
    // user = await this.db.user.update({
    //   where: { id: user.id },
    //   data: {
    //     email: profile.email, // Keep email synced with Google
    //     profileImage: profile.profileImage !== undefined ? profile.profileImage : user.profileImage,
    //     lastLoginAt: new Date(),
    //     emailVerified: (profile.emailVerified && profile.email) ? new Date() : user.emailVerified,
    //   },
    //   include: { Balance: true, VipInfo: true, UserSettings: true },
    // });

    // No user with this Google ID, try to find by email
    user = await db.user.findUnique({
      where: { email: (signInUsername as any)?.user.email },
    })
    console.log(user)
    if (user) {
      // User found by email, link Google ID and update info
      user = await db.user.update({
        where: { id: user.id },
        data: {
          // googleId: profile.googleId,
          // avatar: profile.profileImage !== undefined ? profile.profileImage : user.profileImage,
          // lastLoginAt: new Date(),
          lastLogin: new Date(),
          isOnline: true,

          // emailVerified: (profile.emailVerified && profile.email) ? new Date() : user.emailVerified,
        },
        // include: { Balance: true, VipInfo: true, UserSettings: true },
      })
      const token = (signInUsername as any)?.token

      const resp: GoogleSignInResponse = {
        authenticated: true,
        accessToken: token,
        refreshToken: token,
        code: 200,
        user: user as unknown as UserWithProfile,
      }
      return c.json(resp)
    } else {
      throw new Error('User find or create operation failed unexpectedly.')
    }
  }
}

type GetSessionResponse = {
  user?: any
  access_token?: string
  code: number
  status?: number
  message?: string
}

export async function getSession(req: HonoRequest): Promise<GetSessionResponse> {
  const session = await auth.api.getSession({
    headers: req.raw.headers,
  })
  console.log(session)
  if (!session || session == null) {
    return {
      message: 'Not Authorized',
      code: 401,
      status: 401,
    }
  }
  let userWprofile = await db.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true },
  })
  if (!userWprofile || userWprofile == null) {
    return {
      message: 'User not found',
      code: 401,
    }
  }
  if (userWprofile.profile == undefined || userWprofile.profile == null)
    userWprofile = await db.user.update({
      where: { id: user.id },
      data: {
        isOnline: true,
        status: UserStatus.ONLINE,
        profile: {
          create: {
            balance: 0,
            totalXpFromOperator: 0,
            // isActive: true,
            // lastPlayed: new Date(),
            // phpId: 0,
            // shopId: 'cmaldhvn8000cliybhdhfy2b1',
            activeCurrencyType: 'USD', // Ensure these match Currency enum
          },
        },
      },
      include: {
        profile: true,
      },
    })

  return {
    user: userWprofile,
    access_token: session?.session.token,
    code: 200,
    // }),
    status: 200,
  }
}

// app.post('/auth/register', async (c: Context) => {
export async function register(req: HonoRequest) {
  console.log('register')
  const { password, email } = await req.json()
  const username = email.split('@')[0]

  // const email = `${username}@cashflow.com`;
  //@ts-ignore
  // const cookies = req.cookies;
  // if (email === undefined || password === undefined) {
  //   return new Response(
  //     JSON.stringify({ message: 'Missing username or password', code: 402 }),
  //   )
  // }

  const response = await createUserWithProfileAndAccount({
    email,
    password,
    username,
  })
  console.log('response', response)
  // const clientId = randomUUIDv7();

  // console.log(headers)
  console.log(response)
  // const token = await generateAccessToken(user.user.id)
  if (!response || response == null) {
    return new Response(JSON.stringify({ message: 'Registration failed', code: 500 }), {
      status: 500,
    })
  }
  // const token = response.token;
  const user = response.user
  // cookies.set('cookie', token)
  //@ts-ignore
  // delete user.user.passwordHash
  // return new Response(
  //   JSON.stringify({ authenticated: true, token, user: user, code: 200 }),
  // )
  // const cookieOptions = {
  //   httpOnly: true,
  //   secure: true,
  //   sameSite: 'strict',
  //   maxAge: 60 * 60 * 24 * 7, // 1 week
  //   path: '/',
  // };
  return new Response(JSON.stringify({ authenticated: true, user, code: 200 }), {
    status: 200,
    // headers: {
    //   'Set-Cookie': `token=${token}; ${Object.entries(cookieOptions)
    //     .map(([k, v]) => `${k}=${v}`)
    //     .join('; ')}`,
    // },
  })
  // }
}

export async function login(req: HonoRequest) {
  console.log('login')
  let { username, password, email } = await req.json()
  password = password || ''
  if (password === undefined || password === '') {
    return new Response(JSON.stringify({ message: 'Missing password', code: 401 }), {
      status: 401,
    })
  }
  if (username === undefined && email === undefined) {
    return new Response(JSON.stringify({ message: 'Missing username or email', code: 401 }), {
      status: 401,
    })
  }
  if (username === undefined) {
    username = email.split('@')[0]
  }
  if (email === undefined) {
    email = `${username}@cashflowcasino.com`
  }

  let signInUsername

  // const salt = crypto.randomBytes(16).toString('hex')
  console.log(password, username)
  try {
    signInUsername = await auth.api.signInUsername({
      body: { password, username },
    })
  } catch (e: any) {
    throw new Error(e)
    // console.log(e)
    // const email = `${username}@asdf.com`
    // signInUsername = await auth.api.signInEmail({
    //   body: { password, email },
    // })
    // console.log(e)
    return (
      JSON.stringify(e),
      {
        status: 403,
        statusText: '403',
        headers: {
          'content-type': 'application/json',
        },
      }
    )
  }
  console.log('signInUsername', signInUsername)
  // const user = await validateUser(username, password)
  const user = signInUsername && 'user' in signInUsername ? signInUsername.user : null
  const token = signInUsername && 'token' in signInUsername ? signInUsername.token : undefined
  console.log(user)
  if (user == null) {
    return new Response(JSON.stringify({ message: 'Invalid credentials', code: 401 }), {
      status: 401,
    })
  }
  const ruser = await db.user.update({
    where: { id: user.id },
    include: { profile: true },
    data: { lastLogin: new Date(), isOnline: true },
  })
  // const token = generateAccessToken(user.id)

  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  }

  return new Response(
    JSON.stringify({ authenticated: true, access_token: token, ruser, code: 200 }),
    {
      status: 200,
      headers: {
        'Set-Cookie': `token=${token}; ${Object.entries(cookieOptions)
          .map(([k, v]) => `${k}=${v}`)
          .join('; ')}`,
      },
    }
  )
}
export async function logout() {
  return new Response(JSON.stringify('ok'), {
    status: 200,
    headers: {
      'Set-Cookie': `token=;`,
    },
  })
}
// export default app
