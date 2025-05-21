import { TransactionStatus, TransactionType } from '@cashflow/database';

export interface TransactionHistoryItem {
  id: string;
  created_at: number;
  status: string;
  type: number;
  note: string;
  amount: number;
  balance: number;
}

export interface TransactionHistoryResponse {
  total_pages: number;
  record: Array<TransactionHistoryItem>;
}

export type GetTransactionHistoryResponse = {
  code: number;
  data: TransactionHistoryResponse;
  message: string;
};

// Types related to financial transactions, deposits, and withdrawals.

// Re-exporting enums from Prisma schema
// export type TransactionType =
//   | 'DEPOSIT'
//   | 'WITHDRAWAL'
//   | 'BET_PLACE'
//   | 'BET_WIN'
//   | 'BET_LOSE'
//   | 'BET_REFUND'
//   | 'BONUS_AWARD'
//   | 'BONUS_WAGER'
//   | 'BONUS_CONVERT'
//   | 'BONUS_EXPIRE'
//   | 'XP_AWARD'
//   | 'FEE'
//   | 'REFUND'
//   | 'ADJUSTMENT_ADD'
//   | 'ADJUSTMENT_SUB'
//   | 'INTERNAL_TRANSFER'
//   | 'PRODUCT_PURCHASE'
//   | 'REBATE_PAYOUT';

// export type TransactionStatus =
//   | 'PENDING'
//   | 'PROCESSING'
//   | 'COMPLETED'
//   | 'FAILED'
//   | 'CANCELLED'
//   | 'EXPIRED'
//   | 'REQUIRES_ACTION'
//   | 'REVIEW';

export interface TransactionHistoryEntry {
  id: string;
  date: string | Date; // ISO date string or Date object
  type: TransactionType;
  status: TransactionStatus;
  amount: number; // Consider using string for precise decimal representation if needed, then parse
  currencyId: string;
  description?: string | null;
  provider?: string | null;
  providerTxId?: string | null;
  // You might add more fields like netAmount, feeAmount for detailed history
}

export interface InitializeDepositDto {
  amount: number; // Amount user wants to deposit
  currencyId: string; // Currency of the deposit
  paymentMethodId: string; // Identifier for the chosen payment method (e.g., 'cashapp', 'stripe_card')
  productId?: string; // Optional ID of a deposit package/product being purchased
  // Any other necessary fields, e.g., promoCode
}

export interface DepositProduct {
  id: string;
  title: string;
  description?: string | null;
  priceInCents: number;
  currencyId: string | null;
  iconUrl?: string | null;
  // bonusOffer?: any; // Details about any bonus tied to this product
}

export interface DepositPaymentMethod {
  id: string;
  name: string;
  iconUrl?: string | null;
  minAmount: number;
  maxAmount: number;
  currencyId: string; // Currency this payment method supports
  // additionalFields?: Array<{ name: string; type: string; label: string; required: boolean }>; // For methods requiring more input
}

export interface DepositConfigurationResponse {
  methods: DepositPaymentMethod[];
  limits: {
    dailyLimit?: number;
    weeklyLimit?: number;
    // other limits
  };
  // other config like available products could also be here
}

export interface InitializeDepositResponse {
  transactionId: string; // Your internal transaction ID
  paymentReference?: string; // A reference ID for the payment provider
  paymentUrl?: string; // URL to redirect user to for payment (e.g., Stripe Checkout)
  providerData?: any; // Any other data needed by the client (e.g., QR code data, CashApp $cashtag and note)
  message?: string;
}

export interface CashAppWebhookPayload {
  // Mirrored from your server-side type for validation if you expose it
  transactionId: string; // This is the CashApp transaction number (e.g., 'D-NP3JP2J9')
  amount: number;
  senderName?: string;
  timestamp: string; // ISO string
  rawEmailSubject?: string;
  cashtag?: string; // Sender's cashtag
  note?: string; // The note provided by the sender (should be your internal transaction ID)
}

export interface WithdrawalConfig {
  methods: Array<{
    id: string;
    name: string;
    currencyId: string;
    minAmount: number;
    maxAmount: number;
    feeFixed?: number;
    feePercent?: number;
    processingTime?: string; // e.g., "1-3 business days"
    requiredFields?: Array<{ name: string; label: string; type: string; validationRegex?: string }>;
  }>;
  dailyWithdrawalLimit?: number; // In a base currency or per currency
  weeklyWithdrawalLimit?: number;
  // kycLevelRequired?: number;
}

export interface WithdrawalRequestDto {
  amount: number;
  currencyId: string;
  paymentMethodId: string;
  recipientDetails: Record<string, any>; // e.g., { bankAccount: "...", swift: "...", cryptoAddress: "..." }
  // mfaToken?: string; // If MFA is required for withdrawals
}

export interface WithdrawalResponse {
  transactionId: string;
  status: TransactionStatus;
  message: string;
}
