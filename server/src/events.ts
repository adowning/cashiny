import {
  UserCreatedPayload,
  UserProfileUpdatedPayload,
  UserXpGainedPayload,
  UserLeveledUpPayload,
  UserRewardClaimedPayload,
  TransactionStatusChangedPayload,
  DepositSuccessfulPayload,
  WebSocketMessageToUserPayload,
  WebSocketBroadcastPayload,
  UserEventPayload,
  WithdrawalProcessedPayload,
} from '@cashflow/types';
import { EventEmitter } from 'node:events'; // Using Node.js built-in EventEmitter

// --------------- Event Emitter Instance ---------------
/**
 * Global application event emitter.
 * Use this to emit and listen to domain events across the application.
 */
export const appEventEmitter = new EventEmitter();

// --------------- Event Definitions (Enum) ---------------
/**
 * Defines the types of events that can be emitted within the application.
 * Using an enum provides type safety and autocompletion for event names.
 */
export enum AppEvents {
  // User-related events
  USER_CREATED = 'user:created',
  USER_UPDATED = 'user:updated',
  USER_EMAIL_VERIFIED = 'user:emailVerified',
  USER_PASSWORD_RESET_REQUESTED = 'user:passwordResetRequested',
  USER_PASSWORD_CHANGED = 'user:passwordChanged',
  USER_LOGIN_SUCCESS = 'user:loginSuccess',
  USER_LOGIN_FAILURE = 'user:loginFailure',
  USER_LOGOUT = 'user:logout',
  USER_PROFILE_UPDATED = 'user:profileUpdated',

  // XP and Leveling Events
  USER_XP_GAINED = 'user:xpGained',
  USER_LEVELED_UP = 'user:leveledUp', // VIP Level Up

  // VIP & Reward Events
  USER_REWARD_CREATED = 'user:rewardCreated', // When a new UserReward entry is made available
  USER_REWARD_CLAIMED = 'user:rewardClaimed',
  VIP_BENEFIT_UNLOCKED = 'vip:benefitUnlocked',

  // Transaction Events
  TRANSACTION_CREATED = 'transaction:created',
  TRANSACTION_CHANGED = 'transaction:changed',
  TRANSACTION_COMPLETED = 'transaction:completed',
  TRANSACTION_FAILED = 'transaction:failed',
  DEPOSIT_SUCCESSFUL = 'transaction:depositSuccessful',
  WITHDRAWAL_REQUESTED = 'transaction:withdrawalRequested',
  WITHDRAWAL_PROCESSED = 'transaction:withdrawalProcessed',

  // Game Events
  GAME_SESSION_STARTED = 'game:sessionStarted',
  GAME_SESSION_ENDED = 'game:sessionEnded',
  GAME_BET_PLACED = 'game:betPlaced',
  GAME_WIN = 'game:win',

  // Achievement Events
  ACHIEVEMENT_UNLOCKED = 'achievement:unlocked',

  // Realtime/WebSocket Events (for broadcasting or internal signaling)
  WEBSOCKET_MESSAGE_TO_USER = 'websocket:messageToUser',
  WEBSOCKET_BROADCAST = 'websocket:broadcast',

  // Admin/System Events
  SYSTEM_NOTIFICATION = 'system:notification',
  // Add more specific events as your application grows
}

// --------------- Event Payload Interfaces ---------------

// --------------- Type Helper for Listeners ---------------
/**
 * Provides a typed interface for event listeners.
 * Usage:
 * appEventEmitter.on(AppEvents.USER_CREATED, (payload: EventPayloads[AppEvents.USER_CREATED]) => {
 * // payload is now correctly typed as UserCreatedPayload
 * });
 */
export interface EventPayloads {
  [AppEvents.USER_CREATED]: UserCreatedPayload;
  [AppEvents.USER_UPDATED]: UserProfileUpdatedPayload; // Assuming UserProfileUpdatedPayload is generic enough
  [AppEvents.USER_EMAIL_VERIFIED]: UserEventPayload; // Basic payload
  [AppEvents.USER_PASSWORD_RESET_REQUESTED]: UserEventPayload & { email: string };
  [AppEvents.USER_PASSWORD_CHANGED]: UserEventPayload;
  [AppEvents.USER_LOGIN_SUCCESS]: UserEventPayload & { ipAddress?: string };
  [AppEvents.USER_LOGIN_FAILURE]: { emailOrUserId?: string; reason: string; ipAddress?: string };
  [AppEvents.USER_LOGOUT]: UserEventPayload;
  [AppEvents.USER_PROFILE_UPDATED]: UserProfileUpdatedPayload;

  [AppEvents.USER_XP_GAINED]: UserXpGainedPayload;
  [AppEvents.USER_LEVELED_UP]: UserLeveledUpPayload;

  [AppEvents.USER_REWARD_CREATED]: UserEventPayload & {
    rewardId: string;
    rewardType: string;
    description: string;
  };
  [AppEvents.USER_REWARD_CLAIMED]: UserRewardClaimedPayload;
  [AppEvents.VIP_BENEFIT_UNLOCKED]: UserEventPayload & {
    benefitId: string;
    benefitName: string;
    level: number;
  };

  [AppEvents.TRANSACTION_CREATED]: TransactionStatusChangedPayload; // Or a more specific CreatePayload
  [AppEvents.TRANSACTION_COMPLETED]: TransactionStatusChangedPayload;
  [AppEvents.TRANSACTION_CHANGED]: TransactionStatusChangedPayload;
  [AppEvents.TRANSACTION_FAILED]: TransactionStatusChangedPayload & { reason?: string };
  [AppEvents.DEPOSIT_SUCCESSFUL]: DepositSuccessfulPayload;
  [AppEvents.WITHDRAWAL_PROCESSED]: WithdrawalProcessedPayload;

  [AppEvents.WITHDRAWAL_REQUESTED]: UserEventPayload & {
    transactionId: string;
    amount: number;
    currencyId: string;
  };

  [AppEvents.ACHIEVEMENT_UNLOCKED]: UserEventPayload & {
    achievementId: string;
    achievementName: string;
  };

  [AppEvents.WEBSOCKET_MESSAGE_TO_USER]: WebSocketMessageToUserPayload;
  [AppEvents.WEBSOCKET_BROADCAST]: WebSocketBroadcastPayload;

  [AppEvents.SYSTEM_NOTIFICATION]: {
    message: string;
    level: 'info' | 'warn' | 'error';
    details?: any;
  };

  // Add other event types and their corresponding payload interfaces here
  // ...
}

// Typed EventEmitter (Optional, but provides better type safety for .on, .emit)
// This gives you type checking for event names and their corresponding payload types.
interface TypedEventEmitter<TEvents extends Record<string, any>> {
  on<TEventName extends keyof TEvents>(
    eventName: TEventName,
    listener: (payload: TEvents[TEventName]) => void
  ): EventEmitter;

  once<TEventName extends keyof TEvents>(
    eventName: TEventName,
    listener: (payload: TEvents[TEventName]) => void
  ): EventEmitter;

  emit<TEventName extends keyof TEvents>(
    eventName: TEventName,
    payload: TEvents[TEventName]
  ): boolean;

  off<TEventName extends keyof TEvents>(
    eventName: TEventName,
    listener: (payload: TEvents[TEventName]) => void
  ): EventEmitter;

  removeAllListeners<TEventName extends keyof TEvents>(eventName?: TEventName): EventEmitter;

  // Add other EventEmitter methods if needed, correctly typed
  listenerCount(eventName: keyof TEvents): number;
}

// Cast your appEventEmitter to the typed version for better DX
export const typedAppEventEmitter = appEventEmitter as TypedEventEmitter<EventPayloads>;

// --------------- Example Usage (for illustration, not part of this file) ---------------
/*
// In another service (e.g., notification.service.ts)
import { typedAppEventEmitter, AppEvents, EventPayloads } from './events'; // Adjust path

typedAppEventEmitter.on(AppEvents.USER_LEVELED_UP, async (payload: EventPayloads[AppEvents.USER_LEVELED_UP]) => {
  // TODO: Create a notification record in DB
  // TODO: Send a push notification or WebSocket message
});

typedAppEventEmitter.on(AppEvents.USER_XP_GAINED, (payload) => { // Type is inferred here if using typedAppEventEmitter
  // Potentially send a WebSocket update to the client for their XP bar
});

// In xp.service.ts (how it would emit)
// import { typedAppEventEmitter, AppEvents, UserLeveledUpPayload } from '../events';
// const levelUpPayload: UserLeveledUpPayload = { ... };
// typedAppEventEmitter.emit(AppEvents.USER_LEVELED_UP, levelUpPayload);
*/
