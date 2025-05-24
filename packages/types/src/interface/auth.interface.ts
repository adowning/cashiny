// packages/types/src/auth.interface.ts
// Assuming UserWithProfile will be defined in './interface/user.ts' and represents the
// primary user object structure returned by the backend upon authentication.
// import { UserWithProfile } from '@cashflow/database';
import type { UserWithProfile } from './user'

// --- Core DTOs for Hono JWT Authentication ---

/**
 * Credentials for password-based login and registration.
 * The 'password' field should contain the plain text password sent from the client.
 */
export interface AuthCredentials {
  username: string
  password: string // Ensure this matches the field name expected by your server's Zod schema
}

/**
 * Payload for user registration.
 * Ensure field names match server's Zod schema for registration.
 */
export interface RegisterPayload extends AuthCredentials {
  username: string
  // Add any other fields required for registration (e.g., referral_code_optional?: string)
}

/**
 * Response DTO after successful authentication (login or register).
 */
export interface AuthResponseDto {
  accessToken: string
  error: string | null
  refreshToken?: string // Optional: string | undefined
  code: number
  user: UserWithProfile // The primary, comprehensive user object
}

/**
 * DTO for refreshing an access token.
 */
export interface RefreshTokenDto {
  refreshToken: string
}

/**
 * DTO for signing in with a Google ID Token.
 */
export interface GoogleSignInDto {
  idToken: string
}

// --- Optional: WebSocket Related Auth Types (Keep if actively used) ---

/**
 * Simple state for UI flags.
 */
export interface AuthenticatedState {
  loggedIn: boolean
}

/**
 * Defines the structure of WebSocket messages related to authentication events.
 * These events would typically push updated user or session information.
 */
export type AuthWebSocketEventType =
  | 'AUTH_STATE_CHANGE' // Could push a new AuthResponseDto.user or a simplified session object
  | 'USER_UPDATED' // Could push an updated UserWithProfile or specific changed fields
  | 'PROFILE_UPDATED' // Could push an updated ProfileType or specific changed fields

/**
 * A generic structure for WebSocket messages related to authentication.
 * The payload type should be more specific based on the AuthWebSocketEventType.
 */
export interface AuthWebSocketMessage {
  type: AuthWebSocketEventType
  // Example: payload could be `UserWithProfile | Partial<UserWithProfile> | { error: string }`
  // Be more specific based on what each event type actually sends.
  payload: any
}

export interface SignUpPayload {
  // Or RegisterDto, ClientRegisterPayload etc.
  email: string
  password: string // Ensure this field name matches server Zod schema for registration
  username: string
  // ... other fields
}
export interface ApiErrorData {
  message: string
  code?: number | string
  errors?: Array<{ field: string; message: string }> // For validation errors
}
export interface ClientRegisterPayload {
  email: string
  password_hash: string
  username: string
}
// {"authenticated":true,"token":"AYKi30Lk36J4zj5XmtaxS18prNnY985p","user":{"id":"fCrWOBxFxbFoa9FBxQv37iqzXBp5TxDn","sbId":null,"username":null,"displayUsername":"","name":"Ash Downing","email":"ashdowning@gmail.com","emailVerified":true,"isOnline":true,"isAnonymous":null,"image":"https://lh3.googleusercontent.com/a/ACg8ocIO2WeWfygLcCyY5U-O5fXbm7qonbTxFTIKJpW4JI1Sc5jZK9mn=s96-c","createdAt":"2025-05-14T06:25:44.084Z","updatedAt":"2025-05-14T13:33:50.336Z","twoFactorEnabled":null,"role":"USER","banned":null,"banReason":null,"banExpires":null,"passwordHash":null,"totalXp":0,"balance":0,"isVerified":false,"active":false,"lastLogin":"2025-05-14T13:33:50.334Z","verificationToken":null,"avatar":null,"activeProfileId":"cmann9ozc0001l4blrg15iwlk","gender":null,"status":null,"cashtag":null,"phpId":null,"accessToken":null,"vipInfoId":null,"lastDailySpin":null},"code":200}
export interface GoogleSignInResponse {
  authenticated: boolean
  accessToken: string
  refreshToken: string
  code: number
  user: UserWithProfile
}

export interface MappedActiveProfile {
  id: string
  balance: number
  xpEarned: number
  isActive: boolean
  lastPlayed: Date | null
  createdAt: Date
  updatedAt: Date | null
  phpId: number | null
  userId: string
  currency: string
  shopId: string
  userProfileUseridtouser: any | null
}

export interface PatchedVipInfo {
  [x: string]: any
  gamesession: any[]
  operator: any | null
  transactions: any[]
  user: any | null
}
