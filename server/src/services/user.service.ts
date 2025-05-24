import { auth } from '@/auth'
import { db } from '@cashflow/database'
import { UserWithProfile } from '@cashflow/types'
// import type { User as Partial<User> } from 'better-auth';
import { HonoRequest } from 'hono'

// import { getUserFromPartial<User> } from './auth.service';

// GET /user/amount - get user amount
export async function getUserAmount(req: HonoRequest, user: Partial<UserWithProfile>) {
  // Fetch user's main balance and potentially other relevant data
  // Based on the GetUserAmount interface, we need amount, currency, withdraw, rate.
  // Schema has user.balance (Decimal). Withdraw and rate are not directly available.
  // Currency info can be derived from the active profile's bank.
  // //const user = await getUserFromPartial<User>(_user);

  const userAmountData = {
    amount: user!.profile!.balance, // Convert Decimal to number
    currency: {
      fiat: true, // Assuming all currencies linked via bank are fiat, adjust if needed
      name: 'Unknown',
      symbol: '$', // Placeholder, determine symbol based on currency type if possible
      type: 'USD',
    },
    withdraw: 0, // Placeholder - needs implementation based on withdrawal logic/history
    rate: 1, // Placeholder - needs implementation based on exchange rates or internal logic
  }

  const response = {
    code: 200,
    data: userAmountData,
    message: 'User amount fetched successfully',
  }

  return new Response(JSON.stringify(response))
}

// GET /user/info - get user profile
// export async function getUserInfo(req: HonoRequest,user: Partial<UserWithProfile>) {
//   // The user object attached by the middleware already includes the necessary info
//   // Map db User object to GetUserInfo interface
//   // const userInfoData: GetUserInfo = {
//   //   uid: user.id, // Using db ID as uid
//   //   username: user.username,
//   //   avatar: user.avatar || "", // Provide default if null
//   //   first_name: "", // Not directly in schema, placeholder
//   //   last_name: "", // Not directly in schema, placeholder
//   //   id: user.id, // Use phpId if available, otherwise db ID
//   //   id_number: "", // Not directly in schema, placeholder
//   //   email: user.email,
//   //   email_confirmd: user.emailVerified as boolean,
//   //   phone: "", // Not directly in schema, placeholder
//   //   phone_confirmd: false, // Not directly in schema, placeholder
//   //   date_of_birth: "", // Not directly in schema, placeholder
//   //   county: "", // Not directly in schema, placeholder
//   //   state: "", // Not directly in schema, placeholder
//   //   city: "", // Not directly in schema, placeholder
//   //   address: "", // Not directly in schema, placeholder
//   //   postal_code: "", // Not directly in schema, placeholder
//   //   language: "", // Not directly in schema, placeholder
//   //   locale: "", // Not directly in schema, placeholder
//   //   initial_profile_complete: false, // Not directly in schema, placeholder
//   //   is_supended: user.status === "INACTIVE" ? 1 : 0, // Map UserStatus to is_supended
//   //   sys_communications: false, // Not directly in schema, placeholder
//   //   locked_personal_info_fields: [], // Not directly in schema, placeholder
//   //   create_at: user.createdAt.getTime(), // Convert Date to timestamp
//   // };

//   const response: GetUserInfoResponseData = {
//     code: 200,
//     data: user,
//     message: 'User info fetched successfully',
//   };

//   return new Response(JSON.stringify(response));
// }

// GET /user/balance - get user balance
export async function getUserBalance(req: HonoRequest, user: Partial<UserWithProfile>) {
  // Fetch user's balance. Based on GetUserBalance interface, needs amount, currency, available_balance, real, bonus.
  // Schema has user.balance (Decimal) and profile.balance (Int).
  // Assuming user.balance is the main balance. available_balance, real, bonus might be derived or require more complex logic.
  // console.log(user);
  // //const user = await getUserFromPartial<User>(_user);

  const userBalanceData = {
    amount: user.profile!.balance, // Convert Decimal to number
    currency: user.profile?.activeCurrencyType || 'USD', // Currency from active profile's bank
    availabe_balance: user.profile!.balance, // Assuming available is same as total balance for now
    real: user.profile!.balance, // Assuming real is same as total balance for now
    bonus: 0, // Placeholder - needs implementation if bonus balances exist
  }

  const response = {
    code: 200,
    data: userBalanceData,
    message: 'User balance fetched successfully',
  }

  return new Response(JSON.stringify(response))
}

// POST /user/currency - set user currency
export async function setUserCurrency(
  req: HonoRequest,
  user: Partial<UserWithProfile>,
  currencyType: string
) {
  //const user = await getUserFromPartial<User>(_user);

  const body = await req.json()
  const { currency_type } = body // Assuming the body contains { currency_type: string }

  if (!currency_type) {
    return new Response(
      JSON.stringify({
        message: 'Missing currency_type in request body',
        code: 400,
      }),
      {
        status: 400,
      }
    )
  }

  // Find the bank with the specified currency type and linked to the user's operator
  // const bank = await db.bank.findFirst({
  //   where: {
  //     currency: currency_type,
  //     operatorId: user.activeProfile?.shopId, // Link to the operator of the active profile
  //   },
  // });

  if (user === null) {
    return new Response(
      JSON.stringify({ message: 'user not available for your operator', code: 404 }),
      { status: 404 }
    )
  }

  // Update the user's active profile to use this bank
  try {
    await db.profile.update({
      where: {
        id: user.profile!.id,
      },
      data: {
        activeCurrencyType: currencyType,
      },
    })

    return new Response(
      JSON.stringify({
        code: 200,
        message: 'User currency updated successfully',
      })
    )
  } catch (error: any) {
    console.error('Error updating user currency:', error)
    return new Response(
      JSON.stringify({
        message: `Failed to update user currency: ${error.message}`,
        code: 500,
      }),
      { status: 500 }
    )
  }
}

// POST /user/change - update user info
export async function updateUserInfo(req: HonoRequest, user: Partial<UserWithProfile>) {
  //const user = await getUserFromPartial<User>(_user);
  const body = await req.json()
  // Extract fields that are allowed to be updated.
  // Be cautious about which fields you allow users to change directly.
  const { username, avatar /* add other updatable fields */ } = body

  try {
    const updatedUser: any = await db.user.update({
      where: { id: user.id },
      data: {
        username: username !== undefined ? username : user.username,
        image: avatar !== undefined ? avatar : user.image,
        // Add other fields to update based on the request body
        // e.g., email: body.email, // Be careful with email updates, might need verification
      },
      include: {
        profile: true,
        // operator: true,
        // vipInfo: true,
      },
    })

    // Return the updated user info, similar to the GET /user/info endpoint
    // const userInfoData: GetUserInfo = {
    //   uid: updatedUser.id,
    //   username: updatedUser.username as string,
    //   avatar: updatedUser.avatar || "",
    //   first_name: "", // Placeholder
    //   last_name: "", // Placeholder
    //   id: updatedUser.phpId || updatedUser.id,
    //   id_number: "", // Placeholder
    //   email: updatedUser.email,
    //   email_confirmd: false,
    //   phone: "", // Placeholder
    //   phone_confirmd: false, // Placeholder
    //   date_of_birth: "", // Placeholder
    //   county: "", // Placeholder
    //   state: "", // Placeholder
    //   city: "", // Placeholder
    //   address: "", // Placeholder
    //   postal_code: "", // Placeholder
    //   language: "", // Placeholder
    //   locale: "", // Placeholder
    //   initial_profile_complete: false, // Placeholder
    //   is_supended: updatedUser.status === "INACTIVE" ? 1 : 0,
    //   sys_communications: false, // Placeholder
    //   locked_personal_info_fields: [], // Placeholder
    //   create_at: updatedUser.createdAt.getTime(),
    // };
    const response = {
      code: 200,
      data: updatedUser,
      message: 'User info updated successfully',
    }

    return new Response(JSON.stringify(response))
  } catch (error: any) {
    console.error('Error updating user info:', error)
    return new Response(
      JSON.stringify({
        message: `Failed to update user info: ${error.message}`,
        code: 500,
      }),
      {
        status: 500,
      }
    )
  }
}

// POST /user/email - update email
export async function updateUserEmail(req: HonoRequest, user: Partial<UserWithProfile>) {
  //const user = await getUserFromPartial<User>(_user);
  const body = await req.json()
  const { email, password } = body

  if (!email || !password) {
    return new Response(
      JSON.stringify({
        message: 'Missing email or password in request body',
        code: 400,
      }),
      {
        status: 400,
      }
    )
  }

  // TODO: Implement password verification before changing email
  // You would typically hash the provided password and compare it to user.passwordHash

  try {
    // Check if the new email is already in use by another user
    const existingUser = await db.user.findFirst({ where: { email } })
    if (existingUser && existingUser.id !== user.id) {
      return new Response(JSON.stringify({ message: 'Email already in use', code: 400 }), {
        status: 400,
      })
    }

    await db.user.update({
      where: { id: user.id },
      data: {
        email: email,

        // emailVerified: false, // Mark email as unverified after change
        // You might want to generate a new verification token here
      },
    })

    return new Response(
      JSON.stringify({
        code: 200,
        message: 'User email updated successfully. Verification required.',
      })
    )
  } catch (error: any) {
    console.error('Error updating user email:', error)
    return new Response(
      JSON.stringify({
        message: `Failed to update user email: ${error.message}`,
        code: 500,
      }),
      {
        status: 500,
      }
    )
  }
}

// POST /user/email - update cashtag
export async function updateUserCashtag(req: HonoRequest, user: Partial<UserWithProfile>) {
  //const user = await getUserFromPartial<User>(_user);
  const body = await req.json()
  const { cashtag } = body

  if (!cashtag) {
    return new Response(
      JSON.stringify({
        message: 'Missing email or password in request body',
        code: 400,
      }),
      {
        status: 400,
      }
    )
  }

  // TODO: Implement password verification before changing email
  // You would typically hash the provided password and compare it to user.passwordHash

  try {
    // Check if the new email is already in use by another user
    const existingUser = await db.user.findFirst({ where: { cashtag } })
    if (existingUser && existingUser.id !== user.id) {
      return new Response(JSON.stringify({ message: 'cashtag already in use', code: 400 }), {
        status: 400,
      })
    }

    await db.user.update({
      where: { id: user.id },
      data: {
        cashtag,
        // emailVerified: false, // Mark email as unverified after change
        // You might want to generate a new verification token here
      },
    })

    return new Response(
      JSON.stringify({
        code: 200,
        cashtag: cashtag,
        message: 'User cashtag updated successfully. Verification required.',
      })
    )
  } catch (error: any) {
    console.error('Error updating user cashtag:', error)
    return new Response(
      JSON.stringify({
        message: `Failed to update user cashtag: ${error.message}`,
        code: 500,
      }),
      {
        status: 500,
      }
    )
  }
}

// POST /user/password - update password
export async function updateUserPassword(req: HonoRequest, user: Partial<UserWithProfile>) {
  //const user = await getUserFromPartial<User>(_user);
  const body = await req.json()
  const { now_password, new_password } = body

  if (!now_password || !new_password) {
    return new Response(
      JSON.stringify({
        message: 'Missing current or new password in request body',
        code: 400,
      }),
      { status: 400 }
    )
  }

  // TODO: Implement verification of now_password against user.passwordHash
  // TODO: Implement hashing of new_password before updating

  try {
    // Example placeholder for password update (DO NOT use in production without hashing)
    // You should use a proper password hashing library (like bcrypt) and verify the old password.
    await db.user.update({
      where: { id: user.id },
      data: {
        passwordHash: 'hashed_new_password', // Hash new_password here
      },
    })

    // Assuming better-auth provides a method for this, use that instead.
    // Example (replace with actual better-auth method):
    // await auth.changePassword(user.id, now_password, new_password);
    await auth.api.changePassword({
      body: { newPassword: new_password, currentPassword: new_password },
    })
    return new Response(
      JSON.stringify({
        code: 200,
        message: 'User password updated successfully',
      })
    )
  } catch (error: any) {
    console.error('Error updating user password:', error)
    return new Response(
      JSON.stringify({
        message: `Failed to update user password: ${error.message}`,
        code: 500,
      }),
      { status: 500 }
    )
  }
}

// POST /user/suspend - suspend user
export async function suspendUser(req: HonoRequest, user: Partial<UserWithProfile>) {
  //const user = await getUserFromPartial<User>(_user);
  // const body = await req.json();
  // const { time } = body; // 'time' is in the interface but not directly in schema status

  // TODO: Implement authorization check to ensure the requesting user has permission to suspend others

  // Assuming the request body might contain the ID of the user to suspend
  // For this example, we'll assume the endpoint suspends the *authenticated* user,
  // which might not be the intended use case. Adjust based on actual requirements.
  // If suspending another user, the target user ID should be in the body or path params.

  try {
    // Update the user's status to INACTIVE
    await db.user.update({
      where: { id: user.id }, // Assuming suspending the authenticated user
      data: {
        status: 'INACTIVE', // Set status to INACTIVE enum value
        // If you need to store suspension duration, add a field like 'suspendedUntil: DateTime?'
        // suspendedUntil: time ? new Date(Date.now() + time * 1000) : null, // Example using 'time'
      },
    })

    return new Response(JSON.stringify({ code: 200, message: 'User suspended successfully' }))
  } catch (error: any) {
    console.error('Error suspending user:', error)
    return new Response(
      JSON.stringify({
        message: `Failed to suspend user: ${error.message}`,
        code: 500,
      }),
      {
        status: 500,
      }
    )
  }
}

// POST /user/check - user check
export async function checkUser() {
  // Implement logic based on what 'user check' means in your application
  // Could be checking user status, permissions, etc.

  // For now, just return a success message
  return new Response(JSON.stringify({ code: 200, message: 'User check successful' }))
}

// POST /user/verifyemail - user email verify
export async function verifyUserEmail(req: HonoRequest, user: Partial<UserWithProfile>) {
  // //const user = await getUserFromPartial<User>(_user);
  const body = await req.json()
  const { token } = body // Assuming the verification token is sent in the body

  if (!token) {
    return new Response(
      JSON.stringify({
        message: 'Missing verification token in request body',
        code: 400,
      }),
      {
        status: 400,
      }
    )
  }

  try {
    // Find the user by the verification token
    const userToVerify = await db.user.findFirst({
      where: {
        id: user.id, // Ensure the token belongs to the authenticated user
        // verificationToken: token,
        // emailVerified: false, // Only verify if not already verified
      },
    })

    if (!userToVerify) {
      return new Response(
        JSON.stringify({
          message: 'Invalid or expired verification token',
          code: 400,
        }),
        {
          status: 400,
        }
      )
    }

    // Mark email as verified and clear the token
    // await db.user.update({
    //   where: { id: userToVerify.id },
    //   data: {
    //     // emailVerified: true,
    //     // verificationToken: null, // Clear the token after successful verification
    //   },
    // });

    // The GetUserEmailVerifyResponseData interface includes 'time', which is unclear.
    // Returning a placeholder value for 'time'.
    const responseData = {
      code: 200,
      time: Math.floor(Date.now() / 1000), // Placeholder timestamp
      message: 'Email verified successfully',
    }

    return new Response(JSON.stringify(responseData))
  } catch (error: any) {
    console.error('Error verifying user email:', error)
    return new Response(
      JSON.stringify({
        message: `Failed to verify email: ${error.message}`,
        code: 500,
      }),
      {
        status: 500,
      }
    )
  } // Main user router function
}
