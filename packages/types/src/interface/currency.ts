export interface GetCurrencyBalanceList {
  amount: string;
  availabe_balance: string;
  real: string;
  bonus: string;
  currency: string;
}

export interface GetCurrencyBalanceListResponse {
  code: number;
  data: Array<GetCurrencyBalanceList>;
  message: string;
} /**
 * Represents a Currency. Based on the Prisma 'Currency' model.
 */
// export interface Currency {
//   id: string; // e.g., 'USD', 'BTC', 'ETH'
//   name: string; // e.g., 'US Dollar', 'Bitcoin'
//   symbol: string; // e.g., '$', '₿'
//   decimals: number;
//   is_crypto: boolean;
//   icon_url?: string | null;
//   created_at: Date;
//   updated_at: Date;
// }
// Types related to currencies and user wallets/balances.

export type CurrencyType = 'FIAT' | 'CRYPTO' | 'VIRTUAL';

export interface CurrencyInfo {
  id: string; // e.g., "USD", "BTC", "USD_FUN"
  name: string; // e.g., "US Dollar", "Bitcoin", "Fun Bucks"
  symbol: string; // e.g., "$", "₿", "FB"
  type: CurrencyType;
  precision: number; // Decimal places
  iconUrl?: string; // URL to currency icon
  isActive: boolean;
}

export interface UserWallet {
  currencyId: string;
  name: string;
  symbol: string;
  balance: number; // Real balance, consider string for precision for client display
  bonusBalance: number; // Bonus balance
  lockedBalance: number; // Locked balance
  type: CurrencyType;
  precision: number;
  iconUrl?: string;
}
