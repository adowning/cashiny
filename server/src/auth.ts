import { basePrisma } from '@cashflow/database'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { bearer, oneTap, username, anonymous } from 'better-auth/plugins'

import { resend } from './utils/email'

const { JWT_SECRET, ALLOWED_ORIGINS } = process.env

export const auth = betterAuth({
  baseURL: process.env.AUTH_BASE_URL || `http://localhost:6589`,
  secret: JWT_SECRET || 'a_very_secure_and_random_jwt_secret_for_development_12345!@#$%',
  password: {
    hash: async (password: string) => {
      return await Bun.password.hash(password)
    },
    verifyPassword: async (data: { password: string; hash: string }) => {
      return await Bun.password.verify(data.password, data.hash)
    },
    verify: async (data: { password: string; hash: string }) => {
      return await Bun.password.verify(data.password, data.hash)
    },
  },
  trustedOrigins: JSON.parse(ALLOWED_ORIGINS || '[]'),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    minPasswordLength: 6,
    resetPasswordTokenExpiresIn: 10 * 60 * 1000, // 10 minutes
    sendResetPassword: async ({ user, token }) => {
      const url = new URL(process.env.AUTH_BASE_URL || `http://localhost:6589`)
      url.pathname = '/reset-password'
      url.searchParams.append('token', token)

      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: [user.email],
        subject: 'Reset your password',
        html: `
            <div style="max-width: 600px; margin: 0 auto; padding: 30px; background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            <h1 style="color: #000000; font-size: 20px; font-weight: 600; margin-top: 0; margin-bottom: 16px;">Reset your password</h1>

            <p style="color: #333333; font-size: 16px; margin-bottom: 24px;">
              Click the button below to reset your password.
            </p>

            <div style="margin-bottom: 24px;">
              <a href="${url}" style="display: inline-block; background-color: #000000; color: white; font-weight: 500; text-decoration: none; padding: 10px 20px; border-radius: 4px;">
                Reset password
              </a>
            </div>

            <p style="color: #666666; font-size: 14px; margin-bottom: 12px;">
              If you didn't request a password reset, you can ignore this email.
            </p>

            <p style="color: #666666; font-size: 14px; margin-bottom: 12px;">
              Your password won't change until you access the link above and create a new one.
            </p>

            <p style="color: #666666; font-size: 14px; margin-bottom: 0;">
              This link will expire in 10 minutes.
            </p>
          </div>
          `,
      })
    },
  },
  database: prismaAdapter(basePrisma, {
    provider: 'postgresql',
  }),
  verification: {
    disableCleanup: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_SECRET as string,
    },
  },
  plugins: [bearer(), username(), anonymous(), oneTap()],

  user: {
    additionalFields: {
      id: { type: 'string' },
      email: { type: 'string' },
      name: { type: 'string' },
      emailVerified: { type: 'boolean' },
      image: { type: 'string' },
      createdAt: { type: 'date' },
      updatedAt: { type: 'date' },
      username: { type: 'string' },
      displayUsername: { type: 'string' },
      totalXp: { type: 'number' },
      balance: { type: 'number' },
      isVerified: { type: 'boolean' },
      active: { type: 'boolean' },
      lastLogin: { type: 'date' },
      verificationToken: { type: 'string' },
      avatar: { type: 'string' },
      activeProfileId: { type: 'string' },
      cashtag: { type: 'string' },
      phpId: { type: 'number' },
      accessToken: { type: 'string' },
      twoFactorEnabled: { type: 'boolean' },
      banned: { type: 'boolean' },
      banReason: { type: 'string' },
      banExpires: { type: 'date' },
      lastDailySpin: { type: 'date' },
    },
  },

  advanced: {
    cookiePrefix: 'token',
    cookies: {
      session_token: {
        attributes: {
          httpOnly: true,
          sameSite: 'none',
          secure: true,
          path: '/',
        },
      },
    },
  },
})
