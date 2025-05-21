// Recommended to be in @cashflow/types, e.g., in a new auth.socket.interfaces.ts
export const AUTH_EVENT_IDENTIFIERS = {
  STATE_CHANGE: "auth:state_change", // Server sends this when auth state (login/logout) changes
  USER_UPDATED: "auth:user_updated", // Server sends this when the ClientAuthUser details change
  PROFILE_UPDATED: "auth:profile_updated", // Server sends this when ProfileData changes
  // Add any other auth-related identifiers your server might emit
} as const; // Use 'as const' for stricter typing on values

// Your AuthWebSocketMessage type might need to be more flexible with payload
// if it's just the 'message' part of ZilaWS's WSMessage
export interface DecodedAuthWebSocketMessage<T = any> {
  identifier: (typeof AUTH_EVENT_IDENTIFIERS)[keyof typeof AUTH_EVENT_IDENTIFIERS]; // The specific auth event identifier
  payload: T; // The actual data (e.g., ClientSession, ClientAuthUser, ProfileData)
}
export interface WSMessage {
  identifier: string;
  message: any[] | any | null;
  callbackId: string | null;
}
