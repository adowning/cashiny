import { basePrisma } from '@cashflow/database';
// import { Gender, UserStatus } from '@cashflow/types';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
// import type { User } from "shared";
import { bearer, oneTap } from 'better-auth/plugins';
import { username } from 'better-auth/plugins';
import { anonymous } from 'better-auth/plugins';

import { resend } from './utils/email';

const { JWT_SECRET, ALLOWED_ORIGINS } = process.env;

export const auth = betterAuth({
  baseURL: `http://localhost:6589`,
  secret: JWT_SECRET || 'a_very_secure_and_random_jwt_secret_for_development_12345!@#$%',
  password: {
    hash: async (password: string) => {
      return await Bun.password.hash(password);
    },
    verifyPassword: async (data: any) => {
      return await Bun.password.verify(data.password, data.hash);
    },
    verify: async (data: any) => {
      return await Bun.password.verify(data.password, data.hash);
    },
  },
  trustedOrigins: JSON.parse(ALLOWED_ORIGINS || '[]'),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    minPasswordLength: 6,
    resetPasswordTokenExpiresIn: 10 * 60 * 1000, // 10 minutes
    sendResetPassword: async ({ user, token }, request) => {
      const url = new URL(request?.headers.get('origin') || '');
      url.pathname = '/reset-password';
      url.searchParams.append('token', token);

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
      });
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
  plugins: [
    bearer(),
    username(),
    anonymous(),
    oneTap(),
    // oneTapClient({
    //   clientId:
    //     "740187878164-qoahkvecq5tu5d8os02pomr7nifcgh8s.apps.googleusercontent.com",
    //   // Optional client configuration:
    //   autoSelect: false,
    //   cancelOnTapOutside: true,
    //   context: "signin",
    //   additionalOptions: {
    //     // Any extra options for the Google initialize method
    //   },
    //   // Configure prompt behavior and exponential backoff:
    //   promptOptions: {
    //     baseDelay: 1000, // Base delay in ms (default: 1000)
    //     maxAttempts: 5, // Maximum number of attempts before triggering onPromptNotification (default: 5)
    //   },
    // }),
  ],

  user: {
    // fields: {
    //   id: { type: "string" },
    //   email: { type: "string" },
    //   name: { type: "string" },
    //   emailVerified: { type: "boolean" },
    //   image: { type: "string" },
    //   createdAt: { type: "date" },
    //   updatedAt: { type: "date" },
    //   username: { type: "string" },
    //   totalXp: { type: "number" },
    //   balance: { type: "number" },
    //   isVerified: { type: "boolean" },
    //   active: { type: "boolean" },
    //   lastLogin: { type: "date" },
    //   verificationToken: { type: "string" },
    //   avatar: { type: "string" },
    //   activeProfileId: { type: "string" },
    //   gender: { type: "string" },
    //   status: { type: "string" },
    //   cashtag: { type: "string" },
    //   phpId: { type: "number" },
    //   accessToken: { type: "string" },
    //   twoFactorEnabled: { type: "boolean" },
    //   banned: { type: "boolean" },
    //   banReason: { type: "string" },
    //   banExpires: { type: "date" },
    //   lastDailySpin: { type: "date" },
    // },
    additionalFields: {
      // role: {
      //   type: 'string',
      //   defaultValue: 'USER',
      // },
      // fields: {
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
      // gender: { type: Object.values(Gender) },
      // status: { type: Object.values(UserStatus) },
      cashtag: { type: 'string' },
      phpId: { type: 'number' },
      accessToken: { type: 'string' },
      twoFactorEnabled: { type: 'boolean' },
      banned: { type: 'boolean' },
      banReason: { type: 'string' },
      banExpires: { type: 'date' },
      lastDailySpin: { type: 'date' },
      // activeProfile: { type: Profile },
      //   vipInfo: { type: Object.values(VipInfo) },
      // },
      //   id: { type: "string" },
      // },
      // vipInfo: { type: Object.values(VipInfo) },
      // },
    },
  },

  advanced: {
    cookiePrefix: 'token',
    cookies: {
      session_token: {
        attributes: {
          httpOnly: true,
          sameSite: 'none',
          path: '/',
        },
      },
    },
  },
});
