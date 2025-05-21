import { Currency } from './currency';
import { UserWithProfile } from './user';

export type GameCategoryName = 'TABLE' | 'FISH' | 'POKER' | 'SLOTS' | 'OTHER';

export interface Game {
  id: string;
  name: string;
  title: string;
  temperature: string | null;
  developer: string | null;
  vipLevel: number | null;
  isActive: boolean | null;
  device: number | null;
  featured: boolean | null;
  gamebank: string | null;
  bet: number | null;
  denomination: number | null;
  categoryTemp: number | null;
  originalId: number | null;
  bids: number | null;
  statIn: number | null;
  statOut: number | null;
  currentRtp: number | null;
  rtpStatIn: number | null;
  rtpStatOut: number | null;
  standardRtp: number | null;
  popularity: number | null;
  chanceFirepot1: number | null;
  chanceFirepot2: number | null;
  chanceFirepot3: number | null;
  fireCount1: number | null;
  fireCount2: number | null;
  fireCount3: number | null;
  linesPercentConfigSpin: string | null;
  linesPercentConfigSpinBonus: string | null;
  linesPercentConfigBonus: string | null;
  linesPercentConfigBonusBonus: string | null;
  rezerv: number | null;
  cask: number | null;
  advanced: string | null;
  scaleMode: string;
  slotViewState: string;
  view: number | null;
  categoryId: string | null;
  operatorId: string | null;
  providerId: string | null;
  createdAt: Date;
  updatedAt: Date;
  category: GameCategoryName;
  jackpotGroupId: string | null;
  active: boolean;
  password: string | null;
  // operator: Operator | null;
}

export interface GameCategory {
  image: string;
  pictures: string;
  game_count: string | number;
  name: string;
  slug: string;
  games: Array<Search>;
  page_no: number;
}
export interface GameListResponse {
  code: number;
  list: Array<Game>;
  total: number;
}
export interface Search {
  id: string;
  name: string;
  image: string;
  developer: string;
  is_demo: boolean;
}

export interface GameItem {
  id: number;
  name: string;
  image: string;
  developer: string;
  producer: string;
  is_demo: boolean;
}

export interface GameEnterBody {
  id: string | Array<string>;
  demo: boolean;
}

export interface GameUserBody {
  game_categories_slug: string;
  page: number;
  limit: number;
}

export interface GameEnterResponse {
  method: string;
  parames: string;
  developer: string;
  reserve: string;
  weburl: string;
}

export interface GameHistoryItem {
  name: string;
  created_at: number;
  amount: string | number;
  multiplier: string | number;
  bet_id: string | number;
  status: string | number;
  profit: number;
}

export interface GameBigWinItem {
  game_id: string;
  game_name: string;
  game_icon: string;
  user_name: string;
  user_vip_group: number;
  user_vip_level: number;
  bet_amount: string;
  multiplier: string;
  win_amount: string;
  time: number;
}

export interface GameBigWinData {
  high_rollers: Array<GameBigWinItem>;
  lucky_bets: Array<GameBigWinItem>;
}

export interface GameHistoryResponse {
  total_pages: number;
  record: Array<GameHistoryItem>;
}

export interface GameSearchResponse {
  list: Array<Search>;
  total: number;
}

export type GetGameFavoriteListResponse = {
  code: number;
  data: Array<number | string>;
  message: string;
};

export type GetGameBigWinResponse = {
  code: number;
  data: GameBigWinData;
  message: string;
};
export type Category = {
  name: string;
  games: Game[];
};

export type GetGameCategoriesResponse = {
  code: number;
  data: Array<any>;
  messsage: string;
};

export type GetGameSearchResponse = {
  code: number;
  data: GameSearchResponse;
  message: string;
};

export type GetGameEnterResponse = {
  code: number;
  data: GameEnterResponse;
  message: string;
};

export type GetGameHistoryResponse = {
  code: number;
  data: GameHistoryResponse;
  message: string;
};

/**
 * Represents a Game Provider.
 * Based on the Prisma 'GameProvider' model.
 */
export interface GameProvider {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logo_url?: string | null;
  is_enabled: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Represents a Game. Based on the Prisma 'Game' model.
 */
export interface GameType {
  id: string;
  name: string;
  slug: string;
  provider_id: string;
  category_id?: string | null;
  description?: string | null;
  thumbnail_url?: string | null;
  banner_url?: string | null;
  external_game_id?: string | null; // ID from the game provider
  tags?: string[];
  rtp?: number | null; // Return to Player percentage
  volatility?: string | null; // e.g., 'low', 'medium', 'high'
  is_active: boolean;
  is_featured?: boolean;
  launch_options?: Record<string, any> | null; // JSON for specific launch params
  created_at: Date;
  updated_at: Date;
  provider?: GameProvider; // Optional relation
  // category?: GameCategoryType; // Optional relation
}

/**
 * Represents a Game Round or history entry.
 * Based on the Prisma 'GameRound' model.
 */
export interface GameRound {
  id: string;
  user_id: string;
  game_id: string;
  currency_id: string;
  bet_amount: number; // Consider using a Decimal library
  win_amount: number; // Consider using a Decimal library
  profit: number; // Consider using a Decimal library (win_amount - bet_amount)
  external_round_id?: string | null; // ID from the game provider, if available
  status: string; // e.g., 'PENDING', 'COMPLETED', 'FAILED'
  bet_details?: Record<string, any> | null; // JSON for complex bet info
  win_details?: Record<string, any> | null; // JSON for complex win info
  created_at: Date;
  updated_at: Date;
  user?: UserWithProfile; // Optional relation
  game?: GameType; // Optional relation
  currency?: Currency; // Optional relation
}

// Suggested location: packages/types/src/interface/game.ts
export interface LaunchGameResponseDto {
  /**
   * The URL to launch the game session.
   * This could be an iframe source or a URL for redirection.
   */
  launch_url: string;

  /**
   * A unique session identifier for this game launch, if provided by the game aggregator or server.
   * Can be used for tracking or further communication related to this session.
   */
  game_session_id?: string;

  /**
   * Any specific strategy for launching the game (e.g., 'IFRAME', 'REDIRECT', 'POPUP').
   * Optional, defaults to client figuring it out or a standard method.
   */
  launch_strategy?: 'IFRAME' | 'REDIRECT' | 'POPUP';

  /**
   * Additional parameters or tokens required by the game provider, serialized as a string
   * or as a nested object.
   * Optional.
   */
  provider_parameters?: Record<string, any> | string;
}
