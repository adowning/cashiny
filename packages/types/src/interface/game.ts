import { GameSession } from '@cashflow/database'
import { CurrencyInfo } from './currency'
import { UserWithProfile } from './user'
import { JsonArray } from '@prisma/client/runtime/library'

export type GameCategoryName = 'TABLE' | 'FISH' | 'POKER' | 'SLOTS' | 'OTHER'

export interface Game {
  id: string
  name: string
  title: string
  temperature: string | null
  developer: string | null
  vipLevel: number | null
  isActive: boolean | null
  device: number | null
  featured: boolean | null
  gamebank: string | null
  bet: number | null
  denomination: number | null
  categoryTemp: number | null
  originalId: number | null
  bids: number | null
  statIn: number | null
  statOut: number | null
  currentRtp: number | null
  rtpStatIn: number | null
  rtpStatOut: number | null
  standardRtp: number | null
  popularity: number | null
  chanceFirepot1: number | null
  chanceFirepot2: number | null
  chanceFirepot3: number | null
  fireCount1: number | null
  fireCount2: number | null
  fireCount3: number | null
  linesPercentConfigSpin: string | null
  linesPercentConfigSpinBonus: string | null
  linesPercentConfigBonus: string | null
  linesPercentConfigBonusBonus: string | null
  rezerv: number | null
  cask: number | null
  advanced: string | null
  scaleMode: string
  slotViewState: string
  view: number | null
  categoryId: string | null
  operatorId: string | null
  providerId: string | null
  createdAt: Date
  updatedAt: Date
  category: GameCategoryName
  jackpotGroupId: string | null
  active: boolean
  password: string | null
  // ope
  // rator: Operator | null;
}
export interface RTGSettingsRequestDto {
  token: string
  gameId: string
  userData: {
    userId: string
    hash: string
    affiliate: string
    lang: string
    channel: string
    userType: string
    fingerprint: string
  }
  custom: {
    siteId: string
    extras: string
  }
}
export interface RTGSettingsResponseDto {
  success: boolean
  result: RtgSettingsResult
}

export interface RtgSettingsResult {
  user: RTGUser
  game: ResultGame
  launcher: Launcher
  jackpots: null
}

export interface ResultGame {
  cols: number
  rows: number
  offset: number
  multiplierSequence: MultiplierSequence
  extraWin: ExtraWin
  lines: Array<number[]>
  tiles: Tile[]
  reelsBuffer: Array<Array<number[]>>
  paysType: string
  features: string[]
  singlePayline: boolean
  hasState: boolean
  version: string
  rtp: RTP
  volatilityIndex: string
  maxMultiplier: string
  maxWinlineHitRate: string
  maxMultiplierHitRate: string
  maxMultiplierHitFrequency: string
  maxMultiplierWinLines: string
  maxMultiplierWinLinesHitRate: string
  maxMultiplierWinLinesHitFrequency: string
  hasGambleGame: boolean
  gameType: string
  stateful: boolean
  hasChoices: boolean
  stateExpireDays: null
  hasBonuses: boolean
  pendingRoundDays: number
  skin: null
  hasFeatureBuy: boolean
}

export interface ExtraWin {
  bigWin: string
  superWin: string
  megaWin: string
}

export interface MultiplierSequence {
  Progress: Progress[]
}

export interface Progress {
  count: number
  multiplier: number
  spins: number
}

export interface RTP {
  game: RtgGame
}

// export interface RtgGame {
//   default: string

export interface Tile {
  id: number
  type: Type
  pays: string[]
}

export enum Type {
  Normal = 'normal',
  Scatter = 'scatter',
}

export interface Launcher {
  version: string
}

export interface RTGUser {
  balance: RtgSettingsBalance | RtgSpinBalance
  notifications: any[]
  messages: any[]
  bonuses: any[]
  tournaments: any[]
  vouchers: any[]
  userId: number
  country: string
  casino: string
  vertical: string
  currency: Currency
  token: string
  sessionId: string
  sessionNetPosition: string
  aamsParticipationId: null
  aamsSessionId: null
  depositedAmount: string
  maxDeposit: string
  canGamble: boolean
  lastWin: string
  prevRounds: any[]
  limits: Limits
  stakes: Stakes
  autoplay: Autoplay
  serverTime: Date
  additional: null
}

export interface Autoplay {
  type: string
  options: Options
}

export interface Options {
  spins: RtgSpins
  stopOnFeature: StopOnFeature
  stopOnLossLimits: StopOnLossLimits
  stopOnWin: StopOnWin
  hasRestart: boolean
}

export interface RtgSpins {
  values: string[]
  default: number
}

export interface StopOnFeature {
  enabled: boolean
}

export interface StopOnLossLimits {
  mandatory: boolean
  enabled: boolean
  values: string[]
  default: number
}

export interface StopOnWin {
  enabled: boolean
  values: string[]
}

export interface RtgSettingsBalance {
  cash: string
  freeBets: string
  sessionCash: string
  sessionFreeBets: string
  bonus: string
}

export interface Currency {
  code: string
  symbol: string
}

export interface Limits {
  maxGambleStake: string
  maxTotalStake: TotalStake
  minTotalStake: TotalStake
  spinDuration: null
}

export interface TotalStake {
  total: string
}

export interface Stakes {
  defaultIndex: number
  lastIndex: number
  types: string[]
}

export interface GameCategory {
  image: string
  pictures: string
  game_count: string | number
  name: string
  slug: string
  games: Array<Search>
  page_no: number
}
export interface GameListResponse {
  code: number
  list: Array<Game>
  total: number
}
export interface Search {
  id: string
  name: string
  image: string
  developer: string
  is_demo: boolean
}

export interface GameItem {
  id: number
  name: string
  image: string
  developer: string
  producer: string
  is_demo: boolean
}

export interface GameEnterBody {
  id: string | Array<string>
  demo: boolean
}

export interface GameUserBody {
  game_categories_slug: string
  page: number
  limit: number
}

export interface GameEnterResponse {
  method: string
  parames: string
  developer: string
  reserve: string
  weburl: string
}

export interface GameHistoryItem {
  name: string
  created_at: number
  amount: string | number
  multiplier: string | number
  bet_id: string | number
  status: string | number
  profit: number
}

export interface GameBigWinItem {
  game_id: string
  game_name: string
  game_icon: string
  user_name: string
  user_vip_group: number
  user_vip_level: number
  bet_amount: string
  multiplier: string
  win_amount: string
  time: number
}

export interface GameBigWinData {
  high_rollers: Array<GameBigWinItem>
  lucky_bets: Array<GameBigWinItem>
}

export interface GameHistoryResponse {
  total_pages: number
  record: Array<GameHistoryItem>
}

export interface GameSearchResponse {
  items: Array<Search>
  total: number
}

export type GetGameFavoriteListResponse = {
  code: number
  data: Array<number | string>
  message: string
}

export type GetGameBigWinResponse = {
  code: number
  data: GameBigWinData
  message: string
}
export type Category = {
  name: string
  games: Game[]
}

export type GetGameCategoriesResponse = {
  code: number
  data: Array<any>
  messsage: string
}

export type GetGameSearchResponse = {
  code: number
  data: GameSearchResponse
  message: string
}

export type GetGameEnterResponse = {
  code: number
  data: GameEnterResponse
  gameSession: GameSession
  message: string
}

export type GetGameHistoryResponse = {
  code: number
  data: GameHistoryResponse
  message: string
}

/**
 * Represents a Game Provider.
 * Based on the Prisma 'GameProvider' model.
 */
export interface GameProvider {
  id: string
  name: string
  slug: string
  description?: string | null
  logo_url?: string | null
  is_enabled: boolean
  created_at: Date
  updated_at: Date
}

/**
 * Represents a Game. Based on the Prisma 'Game' model.
 */
export interface GameType {
  id: string
  name: string
  slug: string
  provider_id: string
  category_id?: string | null
  description?: string | null
  thumbnail_url?: string | null
  banner_url?: string | null
  external_game_id?: string | null // ID from the game provider
  tags?: string[]
  rtp?: number | null // Return to Player percentage
  volatility?: string | null // e.g., 'low', 'medium', 'high'
  is_active: boolean
  is_featured?: boolean
  launch_options?: Record<string, any> | null // JSON for specific launch params
  created_at: Date
  updated_at: Date
  provider?: GameProvider // Optional relation
  // category?: GameCategoryType; // Optional relation
}

/**
 * Represents a Game Round or history entry.
 * Based on the Prisma 'GameRound' model.
 */
export interface GameSpin {
  id: string
  user_id: string
  game_id: string
  currency_id: string
  bet_amount: number // Consider using a Decimal library
  win_amount: number // Consider using a Decimal library
  profit: number // Consider using a Decimal library (win_amount - bet_amount)
  external_round_id?: string | null // ID from the game provider, if available
  status: string // e.g., 'PENDING', 'COMPLETED', 'FAILED'
  bet_details?: Record<string, any> | null // JSON for complex bet info
  win_details?: Record<string, any> | null // JSON for complex win info
  created_at: Date
  updated_at: Date
  user?: UserWithProfile // Optional relation
  game?: GameType // Optional relation
  currency?: CurrencyInfo // Optional relation
}
/**
 * Represents a Game Round or history entry.
 * Based on the Prisma 'GameRound' model.
 */
export interface RawGameSpinBody {
  user_id: string
  game_id: string
  currency_id: string
  rawVendorData: JsonArray
  created_at: Date
}
// Suggested location: packages/types/src/interface/game.ts
export interface LaunchGameResponseDto {
  /**
   * The URL to launch the game session.
   * This could be an iframe source or a URL for redirection.
   */
  launch_url: string

  /**
   * A unique session identifier for this game launch, if provided by the game aggregator or server.
   * Can be used for tracking or further communication related to this session.
   */
  game_session_id?: string

  /**
   * Any specific strategy for launching the game (e.g., 'IFRAME', 'REDIRECT', 'POPUP').
   * Optional, defaults to client figuring it out or a standard method.
   */
  launch_strategy?: 'IFRAME' | 'REDIRECT' | 'POPUP'

  /**
   * Additional parameters or tokens required by the game provider, serialized as a string
   * or as a nested object.
   * Optional.
   */
  provider_parameters?: Record<string, any> | string
}
export interface RTGSpinRequestDto {
  gameId: string
  custom: {
    siteId: string
    extras: string
  }
  bonusId: any
  extras: any
  siteId: string
  userType: string
  lang: number
  fingerprint: number
  channel: number
  affiliate: number
  userData: {
    userId: number
    affiliate: string
    lang: string
    channel: string
    userType: string
  }
  token: string

  stake: number
  sessionId: string
  playMode: string
}
export interface RTGSpinResponseDto {
  success: boolean
  result: RtgSpinResult
  error?: any
}

export interface RtgSpinResult {
  transactions: Transactions
  user: RTGUser
  game: RtgGame
  jackpots: null
  bonusChance: null
}

export interface RtgGame {
  win: Win
  winsMultipliers: Win
  stake: string
  multiplier: number
  winLines: any[]
  spinMode: string
  fatTiles: FatTile[]
  instantWin: InstantWin
  actions: Action[]
  scatters: any[]
  reelsBuffer: Array<Array<number[]>>
  features: any[]
  hasState: boolean
}

export interface Action {
  type: string
  data: Data
}

export interface Data {
  multiplier?: number
  index?: number
  fatTiles?: FatTile[]
}

export interface FatTile {
  tileId: number
  reel: number
  index: number
  width: number
  height: number
  multiplier: number
  amount: string
}

export interface InstantWin {
  multiplier: string
  amount: string
  options: string[]
}

export interface Win {
  instantWin: string
  lines: string
  total: string
}

export interface Transactions {
  roundId: number
}

export interface RTGUser {
  balance: RtgSpinBalance | RtgSettingsBalance
  canGamble: boolean
  userId: number
  sessionId: string
  sessionNetPosition: string
  token: string
  bonuses: any[]
  tournaments: any[]
  vouchers: any[]
  messages: any[]
  limits: Limits
  serverTime: Date
}

export interface RtgSpinBalance {
  cash: RtgBonus
  freeBets: RtgBonus
  bonus: RtgBonus
  sessionCash: RtgBonus
  sessionFreeBets: RtgBonus
}

export interface RtgBonus {
  atStart: string
  afterBet: string
  atEnd: string
}

export interface Limits {
  betThresholdTime: number
}

import type {
  Wallet as PrismaWallet,
  Transaction as PrismaTransaction,
  GameSession as PrismaGameSession,
  GameSpin as PrismaGameSpin,
  Prisma,
} from '@cashflow/database' // Assuming Prisma types are re-exported

// --- ProviderSettingsResponseData ---
// This is the expected structure of the data AFTER your proxy calls the
// game provider's /settings or /initUser endpoint.
// Your existing `game.ts` has RTG-specific types like RTGUser, RtgSettingsBalance, etc.
// that fulfill this. For RTG, this would be something like:

export interface RtgSettingsBalance {
  // As per your game.ts
  cash: string // Provider's balance for the user, often a string representation
  freeBets: string
  bonus: string
  // ... other balance types if any
}

export interface RTGUserForSettings {
  // Based on RTGUser in your game.ts
  balance: RtgSettingsBalance
  canGamble: boolean
  userId: number | string // Provider's user ID
  sessionId: string // Provider's session ID for this game session
  sessionNetPosition?: string
  token: string // Provider's session token (might be same as sessionId or different)
  bonuses?: any[]
  tournaments?: any[]
  vouchers?: any[]
  messages?: any[]
  limits?: any // Define if structure is known
  serverTime: string // ISO Date string
  // ... any other fields RTG returns on settings/init
}

// This is the actual data structure returned by a provider's settings call.
// For RTG, it's wrapped in the `RTGSettingsResponseDto` which has a `result` field.
// So, `ProviderSettingsResponseData` would be the type of that `result` field.
export type ProviderSettingsResponseData = RTGUserForSettings & {
  // Include other top-level properties returned by the provider for settings
  // Example from your game.ts ProviderSettingsResponseData
  game?: {
    version?: string
    gameType?: string
    // ... other game-specific settings from provider
  }
  launcher?: {
    version?: string
  }
  // Any other fields specific to the provider's settings response
}

// --- ProviderSpinResponseData ---
// This is the expected structure of the data AFTER your proxy calls the
// game provider's /spin or /play endpoint.
// Your existing `game.ts` has RTG-specific types.

export interface RtgSpinWinDetails {
  // As per Win in your game.ts
  instantWin: string
  lines: string
  total: string // Total win amount as a string from provider
}

export interface RtgSpinGameDetails {
  // As per RtgGame in your game.ts
  win: RtgSpinWinDetails
  winsMultipliers?: RtgSpinWinDetails // Optional
  stake: string // Stake amount for this spin as a string
  multiplier?: number
  winLines?: any[]
  spinMode?: string
  reelsBuffer?: Array<Array<number[]>> // Or appropriate type
  // ... other game-specific outcomes from RTG spin
  actions?: any[] // Define if structure known
  features?: any[]
  hasState?: boolean
}

export interface RtgSpinTransactionDetails {
  // As per Transactions in your game.ts
  roundId: number | string // Provider's round ID
  // ... other transaction details from provider
}

export interface RtgSpinUserBalance {
  // As per RtgSpinBalance in your game.ts
  cash: {
    // Structure for cash balance after spin
    atStart: string
    afterBet: string
    atEnd: string // Provider's balance after this spin
  }
  // ... other balance types (freeBets, bonus) if applicable
}

export interface RTGUserForSpin {
  // Based on RTGUser in your game.ts
  balance: RtgSpinUserBalance // Different balance structure for spin
  userId: number | string
  sessionId: string
  sessionNetPosition?: string
  token: string
  serverTime: string // ISO Date string
  // ... other user-related fields from provider's spin response
}

// This is the actual data structure returned by a provider's spin call.
// For RTG, it's wrapped in the `RtgSpinResult` which has a `result` field.
// So, `ProviderSpinResponseData` would be the type of that `result` field.
export type ProviderSpinResponseData = {
  transactions: RtgSpinTransactionDetails
  user: RTGUserForSpin
  game: RtgSpinGameDetails
  jackpots?: any | null // Define if structure known
  bonusChance?: any | null // Define if structure known
  // Any other fields specific to the provider's spin response
}

// --- GamePlatformSpinResultDetails ---
// This is a new interface to standardize the data structure that
// `handlePlatformGameRound` returns after processing a spin and updating your platform.
// It's used internally within your backend.

export interface GamePlatformSpinResultDetails {
  betTransaction: Prisma.TransactionGetPayload<{
    // Select specific fields if you don't need the whole object
    include: {
      originatedUser: {
        select: {
          id: true
          username: true
        }
      }
    }
  }>
  winTransaction?: Prisma.TransactionGetPayload<{
    include: {
      originatedUser: {
        select: {
          id: true
          username: true
        }
      }
    }
  }> | null
  finalPlatformWallet: PrismaWallet // The user's wallet state on your platform AFTER the spin
  updatedGameSession: PrismaGameSession
  gameSpinRecord: PrismaGameSpin
  xpAwardedThisSpin: number
  tournamentPointsAwardedThisSpin: number
  // You might also include:
  // platformUserId: string;
  // platformGameId: string;
  // currencyId: string;
  // wagerAmountPlatformCents: number;
  // winAmountPlatformCents: number;
}
