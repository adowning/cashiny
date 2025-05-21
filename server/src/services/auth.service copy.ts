import { createDbClient, db } from '@cashflow/database';
import { GoogleSignInResponse, User, UserType } from '@cashflow/types';
import type { User as BetterAuthUser } from 'better-auth';
import { Context, HonoRequest } from 'hono';

// Google's library
import { auth } from '../auth';
import { decodeToken } from '../utils/jwt';

const kysely = createDbClient();

// Define the expected request body schema
// const googleSignInSchema = z.object({
//   idToken: z.string().min(1, 'ID token is required'),
// });

// const { scrypt } = await import('node:crypto');
// const crypto = await import('node:crypto');

// const salt = '82f13bc7362b2778b6dabc9dc93c0d15';
// For generating JWT

// Define the structure of the Google profile data we'll work with
// interface GoogleProfileData {
//   googleId: string;
//   email: string;
//   username?: string | null; // Typically 'name' from Google payload
//   profileImage?: string | null;
//   emailVerified?: boolean;
// }

// Define a more complete user type including relations expected by the client
export type AppUserWithDetails = User & {
  Balance?: number | null;
  // VipInfo?: VipInfo | null;
  // UserSettings?: UserSettings | null;
  // Add any other relations your client's User object might need
};

// Auth utility stubs - TODO: Implement properly
export const getUserFromBetterAuthUser = async (_user: BetterAuthUser): Promise<User> => {
  const id = _user.id;
  // const user = await db.user.findUniqueOrThrow({
  //   where: { id },
  //   // include: {   },
  // });
  const kuserArr = await kysely.selectFrom('User').where('User.id', '=', id).selectAll().execute();
  const kuser = kuserArr[0];
  const kProfileArr = await kysely
    .selectFrom('Profile')
    .where('User.activeProfileId', '=', kuser.activeProfileId)
    .selectAll()
    .execute();
  const kprofile = kProfileArr[0];
  if (!kuser) throw new Error('User not found');
  kuser.profile = kprofile;
  return kuser as any;
};
// async findOrCreateUserByGoogleProfile(
//   req: Request
// ): Promise<{ user: AppUserWithDetails; isNewUser: boolean }> {
export async function findOrCreateUserByGoogleProfile(req: HonoRequest, c: Context): Promise<any> {
  console.log(req);
  const json = await req.json();
  console.log(json.idToken);
  // if (username === undefined || password === undefined) {
  //   return new Response(
  //     JSON.stringify({ message: "Missing username or password", code: 401 }),
  //     { status: 401 }
  //   );
  // }
  let signInUsername;
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
    });
  } catch (e) {
    // console.log(e)
    // const email = `${username}@asdf.com`
    // signInUsername = await auth.api.signInEmail({
    //   body: { password, email },
    // })
    console.log(e);
  }
  console.log(signInUsername);
  const isNewUser = false;
  let user;
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
    });
    console.log(user);
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
      });
    } else {
      // No existing user, create a new one
      // isNewUser = true;
      // const baseUsername = profile.username || profile.email.split('@')[0];
      // const uniqueUsername = await this.generateUniqueUsername(baseUsername);
      // const createData: Prisma.UserCreateInput = {
      //   email: profile.email,
      //   username: uniqueUsername,
      //   googleId: profile.googleId,
      //   profileImage: profile.profileImage,
      //   role: Role.USER, // Default role
      //   emailVerified: (profile.emailVerified && profile.email) ? new Date() : null,
      //   lastLoginAt: new Date(),
      //   Balance: { create: { amount: 0, currency: 'USD' /* Or your default currency */ } },
      //   VipInfo: { create: { level: 0, points: 0, progress: 0 } },
      //   UserSettings: { create: { /* Default user settings */ } },
      // };
      // user = await this.db.user.create({
      //   data: createData,
      //   include: { Balance: true, VipInfo: true, UserSettings: true },
      // });
    }
  }

  if (!user) {
    // This case should ideally not be reached if logic is correct
    throw new Error('User find or create operation failed unexpectedly.');
  }

  // Ensure essential relations for existing users if they were somehow missed (defensive)
  // This is more for data integrity for users created before these relations were default
  if (isNewUser === false) {
    // if (!user.Balance) {
    //     await this.db.balance.create({ data: { userId: user.id, amount: 0, currency: 'USD' } });
    // }
    // if (!user.VipInfo) {
    //     await this.db.vipInfo.create({ data: { userId: user.id, level: 0, points: 0, progress: 0 } });
    // }
    // if (!user.UserSettings) {
    //     await this.db.userSettings.create({ data: { userId: user.id } });
    // }
    // Re-fetch to get potentially created relations above for an existing user
    // user = await this.db.user.findUniqueOrThrow({
    //     where: { id: user.id },
    //     include: { Balance: true, VipInfo: true, UserSettings: true }
    // });
  }
  const token = (signInUsername as any)?.token;
  console.log('returning ', user.id);
  console.log('isNewUser ', isNewUser);
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
    user: user as UserType,
  };

  return c.json(resp);
  // return { user: user as AppUserWithDetails, isNewUser };
}
export async function createUserWithProfileAndAccount(userData: {
  email: string;
  // email: string
  username: string;
  password: string;
  // name?: string
  // avatar?: string
  /// 800
}) {
  return db.$transaction(async () => {
    console.log('transaction');
    let defaultOperator: any = await (db as any).operator.findFirst();
    let defaultOwnerUser: any = null;
    const defaultBank: any = null;
    const hashedPassword = await Bun.password.hash(userData.password);

    // Check if any operators exist
    if (!defaultOperator) {
      console.log('No operators found. Creating a default owner, operator, and bank.');

      // Create a default owner user
      defaultOwnerUser = await db.user.create({
        data: {
          username: 'default_operator_owner',
          email: 'owner@example.com', // Use a placeholder or generate dynamically
          passwordHash: 'hashed_password_for_owner', // Generate and hash a secure password
          //name: 'Default Operator Owner',
          status: 'ACTIVE', // Set a default status
          // Add any other required fields for User
        },
      });

      // Create a default operator
      defaultOperator = await (db as any).operator.create({
        data: {
          name: 'Default Operator',
          slug: 'default-operator', // Generate a unique slug
          owner: {
            connect: {
              id: defaultOwnerUser.id,
            },
          },
          isActive: true, // Set default status
          // Add any other required fields for Operator
        },
      });

      // Create a default bank for the new operator
      // defaultBank = await db.bank.create({
      //   data: {
      //     name: "Default Bank",
      //     currency: "USD", // Set a default currency
      //     operatorId: defaultOperator.id,
      //     isActive: true,
      //   },
      // });

      console.log(
        `Created default operator: ${defaultOperator.name} and owner: ${defaultOwnerUser.username} and bank: ${defaultBank.name}`,
      );
    } else {
      // If operators exist, find a default bank linked to one of them
      // Assuming the first found operator has at least one bank, or find a bank directly
      // defaultBank = await db.bank.findFirst({
      //   where: {
      //     operatorId: defaultOperator.id, // Find a bank linked to the found operator
      //   },
      // });
      // if (!defaultBank) {
      //   // If no bank is found for the existing operator, create one
      //   defaultBank = await db.bank.create({
      //     data: {
      //       name: "Default Bank",
      //       currency: "USD", // Set a default currency
      //       operatorId: defaultOperator.id,
      //       isActive: true,
      //     },
      //   });
      //   console.log(`Created a default bank for existing operator: ${defaultOperator.name}`);
      // }
    }

    // Create the main user
    console.log('email ', userData.email);
    // const newUser = await db.user.create({
    //   data: {
    //     username: userData.username,
    //     email: `${userData.username}@asdf.com`, //`${userData.username}@asdf.com`,
    //     passwordHash: hashedPassword,
    //     name: userData.username,
    //     avatar: `blahblah.username.webp`,
    //     status: 'ACTIVE', // Set a default status
    //     balance: 0, // Initialize balance as Decimal
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
          emailVerified: true,
          image: '',
          createdAt: new Date(),
          updatedAt: new Date(),
          totalXp: 0,
          balance: 0,
          isVerified: true,
          role: 'MEMBER',
          active: true,
          lastLogin: new Date(),
          verificationToken: '',
          avatar: '',
          // activeProfileId: '',
          gender: 'BOY',
          status: 'ACTIVE',
          cashtag: '',
          phpId: Math.random() * 10000,
          accessToken: '',
          twoFactorEnabled: true,
          banned: true,
          banReason: '',
          banExpires: new Date(),
          lastDailySpin: new Date(),
        },
      });
      console.log('response', response);
      console.log('headers', headers);
      const newUser = response.user;
      const token = response.token;
      console.log(response);
      // Create the profile linked to the new user and the default operator/bank
      const newProfile = await (db as any).profile.create({
        data: {
          // profileNumber: profileData.profileNumber,
          userId: newUser.id,
          shopId: defaultOperator.id, // Link to the default operator
          // bankId: defaultBank.id, // Link to the default bank
          // balance: profileData.balance ?? 0, // Use provided balance or default to 0 (Int)
          // xpEarned: profileData.xpEarned ?? 0,
          // isActive: profileData.isActive ?? true,
          // lastPlayed: profileData.lastPlayed,
          // phpId: profileData.phpId,
          // Add any other required fields for Profile
        },
      });

      // Optionally update the user's activeProfileId to the newly created profile's ID
      await (db as any).user.update({
        where: { id: newUser.id },
        data: {
          activeProfileId: newProfile.id,
        },
      });

      // Create the account linked to the new user
      const newAccount = await (db as any).account.create({
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
      });

      console.log(
        `Created user: ${newUser.name}, profile: ${newProfile.id}, and account for provider: ${newAccount.id}`,
      );

      return {
        user: newUser,
        profile: newProfile,
        account: newAccount,
        operator: defaultOperator, // Return the operator used
        ownerUser: defaultOwnerUser, // Return the owner user if created
        token,
      };
    } catch (e) {
      console.log(e);
      return null;
    }
  });
}

export const getUserFromHeader = async (req: any): Promise<User | null> => {
  console.log('getUserFromHeader');

  const authHeader = req.headers.get('Authorization');

  if (!authHeader) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return null;
  }
  const payload = decodeToken(token);
  if (payload.id === null || payload.id === undefined) return null;
  const user: any = await (db as any).user.findUnique({
    where: { id: payload.id },
    include: {
      //vipInfo: true,
      activeProfile: { include: { transactions: true } },
    },
  });

  if (user === null) {
    throw new Error('no user found');
    // return null;
  }
  if (user.activeProfile === null) {
    return null;
  } else {
    user.activeProfile = user.activeProfile[0];
  }
  return user;
};

export const getUserFromToken = async (token: string): Promise<User | null> => {
  console.log('getUserFromHeader');
  if (!token) {
    return null;
  }
  const payload = decodeToken(token);
  if (payload.id === null || payload.id === undefined) return null;
  const user = await db.user.findUnique({
    where: { id: payload.id },
    include: { profile: true },
  });

  if (user === null) {
    return null;
  }
  if (user.profile === null) {
    return null;
  }

  return user;
};

// interface PatchedVipInfo extends VipInfo {
//   level_up_exp?: number | null;
//   level_up_balance?: number | null;
//   createdAt?: Date | null;
//   updatedAt?: Date | null;
//   userId?: string | null;
//   gamesession?: any[] | null;
//   operator?: any | null;
//   transactions?: any[] | null;
//   user?: any | null;
//   operatorId?: string | null;
// }

export async function google(
  c: Context,
  req: HonoRequest,
): Promise<any> {
  const json = await req.json();
  const _token = json.idToken;
  const signInUsername = await auth.api.signInSocial({
    body: {
      provider: 'google',
      callbackURL: 'http://localhost:3000/google',
      idToken: {
        token: _token, // Google Access Token
      },
    },
  });
  const session = await auth.api.getSession({
    headers: req.raw.headers,
  });
  if (!session || session == null) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }));
  }
}
//   const authService = new AuthService(db, jwtSecret);
//   const googleOAuthClient = new OAuth2Client(googleClientId);
//   const { idToken } = c.req.valid('json');
//   const db = c.env.DB;
//   const jwtSecret = c.env.JWT_SECRET;
//   const googleClientId = c.env.GOOGLE_CLIENT_ID;

//   try {
//     // 1. Verify the Google ID token
//     let googleTicket;
//     try {
//       googleTicket = await googleOAuthClient.verifyIdToken({
//         idToken: idToken,
//         audience: googleClientId,
//       });
//     } catch (tokenError: any) {
//       console.warn('Google ID token verification failed:', tokenError.message);
//       return new Response(JSON.stringify({ code: 405, success: false, message: 'User not found' }));
//     }

//     const googlePayload = googleTicket.getPayload();
//     if (!googlePayload || !googlePayload.sub || !googlePayload.email) {
//       return new Response(JSON.stringify({ code: 405, success: false, message: 'User not found' }));
//     }

//     // const { user: appUser, isNewUser } =
//     //   await authService.findOrCreateUserByGoogleProfile({
//     //     googleId: googlePayload.sub,
//     //     email: googlePayload.email,
//     //     username: googlePayload.name,
//     //     profileImage: googlePayload.picture,
//     //     emailVerified: googlePayload.email_verified,
//     //   });
//     const { user: appUser, isNewUser } = await authService.findOrCreateUserByGoogleProfile({
//       googleId: googlePayload.sub,
//       email: googlePayload.email,
//       username: googlePayload.name,
//       profileImage: googlePayload.picture,
//       emailVerified: googlePayload.email_verified,
//     });

//     // 3. Generate access token for your application
//     const accessToken = await authService.generateAccessToken(appUser.id);
//     // Potentially generate and handle refresh token here if using that pattern

//     // 4. Prepare the user data for the client, matching UserIdentity['user']
//     const clientUser: UserIdentity['user'] = {
//       id: appUser.id,
//       username: appUser.username,
//       email: appUser.email,
//       profileImage: appUser.avatar,
//       role: 'USER', // Cast based on your type, PrismaRole is an enum
//       // --- Map related data carefully ---
//       balance: appUser.Balance
//         ? {
//             id: appUser.Balance.id, // Assuming Balance type has these fields
//             userId: appUser.Balance.userId,
//             currency: appUser.Balance.currency,
//             amount: appUser.Balance.amount.toNumber(), // Convert Prisma.Decimal to number
//             createdAt: appUser.Balance.createdAt.toISOString(),
//             updatedAt: appUser.Balance.updatedAt.toISOString(),
//           }
//         : undefined,
//       vipLevel: appUser.VipInfo?.level,
//       // settings: appUser.UserSettings ? { /* map settings if needed by client */ } : undefined,
//       // emailVerified: appUser.emailVerified?.toISOString(),
//       // createdAt: appUser.createdAt.toISOString(),
//       // lastLoginAt: appUser.lastLoginAt?.toISOString(),
//       // Ensure all fields expected by your client's `userStore` are included here.
//     };

//     const responsePayload: LoginResponse = {
//       success: true,
//       accessToken: accessToken,
//       user: clientUser,
//       // message: isNewUser ? "Welcome! Your account has been created." : "Successfully signed in.",
//     };

//     return c.json(responsePayload);
//   } catch (e) {
//     console.log(e);
//   }
// }

//   // const socialUser =
//   //   signInUsername && "user" in signInUsername
//   //     ? signInUsername.user
//   //     : undefined;
//   // const token =
//   //   signInUsername && "token" in signInUsername
//   //     ? signInUsername.token
//   //     : undefined;

//   // const user = await prisma.user.findUnique({
//   //   where: { id: socialUser?.id },
//   //   include: { activeProfile: { include: { operator: true } }, vipInfo: true },
//   // });

//   // if (user == null) {
//   //   return {
//   //     code: 401,
//   //     reason: "user not found",
//   //   };
//   // }

//   // await db.user.update({
//   //   where: { id: user.id },
//   //   include: { activeProfile: true, vipInfo: true },
//   //   data: { lastLogin: new Date(), isOnline: true },
//   // });

//   // Map activeProfile to ensure all required properties are present
//   // const mappedActiveProfile: MappedActiveProfile[] = (
//   //   await Promise.all(
//   //     (user.activeProfile ?? []).map(async (profile) => {
//   //       const fullProfile = await prisma.profile.findUnique({
//   //         where: { id: profile.id },
//   //         include: { operator: true, userProfileUseridtouser: true },
//   //       });
//   //       return fullProfile
//   //         ? {
//   //             id: fullProfile.id,
//   //             balance: fullProfile.balance,
//   //             xpEarned: fullProfile.xpEarned,
//   //             isActive: fullProfile.isActive,
//   //             lastPlayed: fullProfile.lastPlayed,
//   //             createdAt: fullProfile.createdAt,
//   //             updatedAt: fullProfile.updatedAt,
//   //             phpId: fullProfile.phpId,
//   //             userId: fullProfile.userId,
//   //             currency: fullProfile.currency,
//   //             shopId: fullProfile.shopId,
//   //             operator: fullProfile.operator,
//   //             userProfileUseridtouser:
//   //               fullProfile.userProfileUseridtouser ?? null, // Provide default or actual value
//   //           }
//   //         : null;
//   //     })
//   //   )
//   // ).filter(Boolean) as MappedActiveProfile[];

//   // const patchedVipInfo: PatchedVipInfo | null = user.vipInfo
//   //   ? {
//   //       id: user.vipInfo.id,
//   //       level: user.vipInfo.level,
//   //       deposit_exp: user.vipInfo.deposit_exp,
//   //       bet_exp: user.vipInfo.bet_exp,
//   //       level_up_exp: user.vipInfo.level_up_exp,
//   //       level_up_balance: user.vipInfo.level_up_balance,
//   //       createdAt: user.vipInfo.createdAt,
//   //       updatedAt: user.vipInfo.updatedAt,
//   //       userId: user.vipInfo.userId,
//   //       gamesession: user.vipInfo.gamesession,
//   //       operator: user.vipInfo.operator,
//   //       transactions: user.vipInfo.transactions,
//   //       user: user.vipInfo.user,
//   //       operatorId: user.vipInfo.operatorId,
//   //     }
//   //   : null;

//   // const u: Partial<UserType> = {
//   //   ...user,
//   //   activeProfile: mappedActiveProfile.filter(Boolean),
//   //   vipInfo: patchedVipInfo!,
//   // };
//   // const userTypeObj: UserType = {
//   //   id: user.id,
//   //   content: "", // Provide actual content if available
//   //   userId: user.id,
//   //   balance: user.balance ?? 0,
//   //   roomId: null,
//   //   currentProfile: user.activeProfile?.[0]
//   //     ? { ...user.activeProfile[0], operator: undefined }
//   //     : {}, // or provide a sensible default
//   //   channel: "LOBBY", // Replace "default" with actual channel if available
//   //   createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
//   //   user: u, // or partial user if needed
//   //   vipInfo: patchedVipInfo!,
//   // };

//   const response: GoogleSignInResponse = {
//     accessToken: token as string,
//     user: userTypeObj,
//     code: 200,
//   };

//   return response;
// }
export async function me(req: HonoRequest): Promise<Response> {
  // const session =  await prisma.platformSession.findUnique({
  //   where: { id: user.id },
  //   include: {
  //     user: {
  //       include: {
  //         activeProfile: { include: { operator: true } },
  //       },
  //     },
  //   },
  // });
  const session = await auth.api.getSession({
    headers: req.raw.headers,
  });
  if (!session || session == null) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }));
  }
  let user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true },
  });
  if (!user || user == null) {
    return new Response(JSON.stringify({ code: 405, success: false, message: 'User not found' }));
  }
  console.log(user);
  let profile;
  if (user.profile == undefined || user.profile == null)
    profile = await db.profile.create({
      data: {
        balance: 0,
        totalXpFromOperator: 0,
        // isActive: true,
        // lastPlayed: new Date(),
        // phpId: 0,
        userId: user.id,
        // shopId: 'cmaldhvn8000cliybhdhfy2b1',
        activeCurrencyType: 'USD', // Ensure these match Currency enum
      },
    });
  if (
    user.profile == undefined ||
    (user.profile == null && profile !== null && profile !== undefined)
  )
    user = await db.user.update({
      where: { id: user.id },
      data: {
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
    });
  // return new Response(
  //   JSON.stringify({
  //     code: 405,
  //     success: false,
  //     message: "User does not have activeProfileId",
  //   })
  // );

  // profile = user?.profile.id
  //   ? await prisma.profile.findUnique({
  //       where: { id: user.activeProfileId },
  //       include: {},
  //     })
  //   : null;
  // if (!profile) {
  //   return new Response(
  //     JSON.stringify({
  //       code: 405,
  //       success: false,
  //       message: 'Profile not found',
  //     }),
  //   );
  // }
  return new Response(
    JSON.stringify({
      // token: session?.session.token as string,
      // session: session as unknown as Session,
      user,
      profile,
      code: 200,
    }),
  );
  // return  session //new Response(JSON.stringify({ user, code: 200 }))
}

// app.post('/auth/register', async (c: Context) => {
export async function register(req: HonoRequest) {
  console.log('register');
  const { password, email } = await req.json();
  const username = email.split('@')[0]
  console.log(username);
  console.log(email);
  console.log(password);
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
  });
  console.log('response', response);
  // const clientId = randomUUIDv7();

  // console.log(headers)
  console.log(response);
  // const token = await generateAccessToken(user.user.id)
  if (!response) {
    return new Response(JSON.stringify({ message: 'Registration failed', code: 500 }), {
      status: 500,
    });
  }
  // const token = response.token;
  const user = response.user;
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
  });
  // }
}

// app.post('/auth/login', async (c: Context) => {
export async function login(req: HonoRequest) {
  console.log('login');
  const { username, password } = await req.json();
  if (username === undefined || password === undefined) {
    return new Response(JSON.stringify({ message: 'Missing username or password', code: 401 }), {
      status: 401,
    });
  }
  let signInUsername;

  // const salt = crypto.randomBytes(16).toString('hex')
  console.log(password, username);
  try {
    signInUsername = await auth.api.signInUsername({
      body: { password, username },
    });
  } catch (e) {
    // console.log(e)
    // const email = `${username}@asdf.com`
    // signInUsername = await auth.api.signInEmail({
    //   body: { password, email },
    // })
    console.log(e);
  }
  console.log('signInUsername', signInUsername);
  // const user = await validateUser(username, password)
  const user = signInUsername && 'user' in signInUsername ? signInUsername.user : null;
  const token = signInUsername && 'token' in signInUsername ? signInUsername.token : undefined;
  console.log(user);
  if (user == null) {
    return new Response(JSON.stringify({ message: 'Invalid credentials', code: 401 }), {
      status: 401,
    });
  }
  await db.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date(), isOnline: true },
  });
  // const token = generateAccessToken(user.id)

  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  };

  return new Response(JSON.stringify({ authenticated: true, token, user, code: 200 }), {
    status: 200,
    headers: {
      'Set-Cookie': `token=${token}; ${Object.entries(cookieOptions)
        .map(([k, v]) => `${k}=${v}`)
        .join('; ')}`,
    },
  });
}
export async function logout() {
  return new Response(JSON.stringify('ok'), {
    status: 200,
    headers: {
      'Set-Cookie': `token=;`,
    },
  });
}
// export default app
