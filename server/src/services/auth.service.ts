import {
  KeyMode, // Role,
  UserStatus,
  basePrisma,
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
  return user as UserWithProfile
}

export async function findOrCreateUserByGoogleProfile(
  req: HonoRequest
): Promise<GoogleSignInResponse> {
  // console.log(req)
  const json = await req.json()
  // console.log(json.idToken)
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
    throw e
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
    user: user as UserWithProfile,
  }

  return resp
  // return { user: user as AppUserWithDetails, isNewUser };
}
export async function createUserWithProfileAndAccount(userData: {
  email: string
  username: string
  password: string
}) {
  console.log('createUserWithProfileAndAccount')
  return prisma.$transaction(async () => {
    console.log('transaction')
    let defaultOperator: any = await prisma.operatorAccess.findFirst()
    let defaultOwnerUser: any = null
    const defaultBank: any = null
    const hashedPassword = await Bun.password.hash(userData.password)

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
          callbackUrl: faker.internet.url() + '/callback',
          active: faker.datatype.boolean(0.9),
          ownedById: defaultOwnerUser.id,
          permissions: getRandomSubset(Object.values(KeyMode), 3),
          ips: [faker.internet.ip(), faker.internet.ip()],
          description: faker.lorem.sentence(),
          lastUsedAt: faker.datatype.boolean(0.5) ? faker.date.recent({ days: 10 }) : null,
        },
      })
      console.log(
        `Created default operator: ${defaultOperator.name} and owner: ${defaultOwnerUser.username} and bank: ${defaultBank.name}`
      )
    }
    try {
      const { response } = await auth.api.signUpEmail({
        returnHeaders: true,
        body: {
          // id: faker.string.uuid(),
          email: userData.email,
          password: userData.password,
          name: userData.username,
          username: userData.username,
        } as any,
      })
      let signInUsername
      const password = userData.password
      const username = userData.username
      signInUsername = await auth.api.signInUsername({
        body: { password, username },
      })

      if (signInUsername == null) throw new Error('signInUsername is null')
      console.log('response', response)
      console.log('signInUsername', signInUsername)
      // console.log('headers', headers)
      const betterAuthUser = signInUsername.user
      const accessToken = signInUsername.token

      // Create the profile linked to the new user and the default operator/bank
      const newProfile = await prisma.profile.create({
        data: {
          balance: 0,
          activeCurrencyType: 'USD',
          user: {
            connect: { id: betterAuthUser.id },
          },
          operator: {
            connect: { id: defaultOperator.id },
          },
        },
      })

      // Create the account linked to the new user
      const newAccount = await prisma.account.create({
        data: {
          accountId: betterAuthUser.id, // Use betterAuthUser.id here
          providerId: 'credential',
          userId: betterAuthUser.id, // Use betterAuthUser.id here
          password: hashedPassword, // Again, consider security implications
          createdAt: new Date(),
          updatedAt: new Date(),
          // Add any other required fields for Account
        },
      })
      const user = await prisma.user.findUnique({
        where: { id: betterAuthUser.id },
        include: {
          profile: true,
        },
      })
      if (user == null) {
        throw new Error('User not found')
      }
      console.log(
        `Created user: ${user.name}, profile: ${newProfile.id}, and account for provider: ${newAccount.id}`
      )

      return {
        accessToken,
        user,
        refreshToken: accessToken,
        code: 200,
        error: null,
      }
    } catch (e: any) {
      console.log(e)
      return { isAuthenticated: false, error: e.message, code: 500 }
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
  user?: UserWithProfile
  access_token?: string
  code: number
  status?: number
  message?: string
}

export async function getSession(req: HonoRequest): Promise<GetSessionResponse> {
  console.log('getting session')
  const session = await auth.api.getSession({
    headers: req.raw.headers,
  })
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
      where: { id: userWprofile.id },
      data: {
        isOnline: true,
        status: UserStatus.ONLINE,
        profile: {
          create: {
            balance: 0,
            totalXpFromOperator: 0,
            activeCurrencyType: 'USD', // Ensure these match Currency enum
          },
        },
      },
      include: {
        profile: true,
      },
    })

  if (!userWprofile.profile) {
    return {
      message: 'Failed to create profile',
      code: 500,
    }
  }

  return {
    user: userWprofile as UserWithProfile,
    access_token: session?.session.token,
    code: 200,
    // }),
    status: 200,
  }
}

// app.post('/auth/register', async (c: Context) => {
export async function register(req: HonoRequest) {
  console.log('register')
  const { password, username } = await req.json()
  const email = username + '@cashflow.com'

  return await createUserWithProfileAndAccount({
    email,
    username,
    password,
  })

  // return { refreshToken: accessToken, accessToken: accessToken, user, code: 200 }
}

export async function login(req: HonoRequest) {
  console.log('login')
  const { username, password } = await req.json()
  if (username === undefined || password === undefined) {
    return new Response(JSON.stringify({ message: 'Missing username or password', code: 402 }))
  }
  let signInUsername
  try {
    signInUsername = await auth.api.signInUsername({
      body: { password, username },
    })
  } catch (e) {
    console.log(e)
  }
  console.log(signInUsername)
  const accessToken = (signInUsername as any)?.token
  const ruser = (signInUsername as any)?.user
  const user = await db.user.findUniqueOrThrow({
    where: { id: ruser.id },
    include: { profile: true },
  })
  console.log(user)

  return { refreshToken: accessToken, accessToken: accessToken, user, code: 200 }
}

export async function logout() {
  console.log('logout')
}
