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
export interface Currency {
  id: string; // e.g., 'USD', 'BTC', 'ETH'
  name: string; // e.g., 'US Dollar', 'Bitcoin'
  symbol: string; // e.g., '$', '₿'
  decimals: number;
  is_crypto: boolean;
  icon_url?: string | null;
  created_at: Date;
  updated_at: Date;
}
