// File: server/src/services/transaction.service.ts

import {
  PrismaClient,
  Wallet,
  Transaction,
  TransactionType,
  Product,
  VipInfo,
  Prisma,
  TransactionStatus, // For Prisma.InputJsonValue and transaction client type
  // User,
  // Currency,
  db,
} from '@cashflow/database'
import cron from 'node-cron'

import { typedAppEventEmitter, AppEvents } from '../events'
import {
  TransactionStatusChangedPayload,
  // DepositSuccessfulPayload,
  // WithdrawalRequestedEventPayload,
} from '@cashflow/types'

import { addXpToUser } from './xp.service'
import { calculateXpBonusForDeposit } from '../utils/xpCalculations'
// import { calculateBonus } from '../utils/bonusCalculations'; // Placeholder for bonus logic
import { getVipLevelConfiguration } from '../config/leveling.config'
import {
  DepositProduct,
  DepositPaymentMethod,
  InitializeDepositDto,
  PaginatedResponse,
  TransactionHistoryEntry,
  WithdrawalConfig,
  WithdrawalRequestDto,
  UserWallet,
  DepositConfigurationResponse, // Added this for clarity
  InitializeDepositResponse, // Added this for clarity
} from '@cashflow/types' // Assuming types are correctly defined here

// Placeholder for a real payment provider service
// import { PaymentProviderService } from './paymentProvider.service';

const prisma = db

type PrismaTransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>

// --- Wallet Management ---

export async function getOrCreateWallet(
  userId: string,
  currencyId: string,
  tx?: PrismaTransactionClient
): Promise<Wallet> {
  const db = tx || prisma
  let wallet = await db.wallet.findUnique({
    where: { userId_currencyId: { userId, currencyId } }, // Standard Prisma unique constraint name
  })

  if (!wallet) {
    const currencyExists = await db.currency.findUnique({ where: { id: currencyId } })
    if (!currencyExists) {
      throw new Error(`Currency with ID ${currencyId} not found. Cannot create wallet.`)
    }
    wallet = await db.wallet.create({
      data: {
        userId,
        currencyId, // Matches schema
        balance: 0, // Represents cents
        bonusBalance: 0, // Represents cents
        lockedBalance: 0, // Represents cents
      },
    })
  }
  return wallet
}

export async function updateWalletBalance(
  walletId: string,
  amountInCents: number, // Amount is the DELTA in cents
  balanceType: 'balance' | 'bonusBalance' | 'lockedBalance' = 'balance',
  tx: PrismaTransactionClient
): Promise<Wallet> {
  const wallet = await tx.wallet.findUniqueOrThrow({ where: { id: walletId } })
  let newBalanceValue: number
  const updateData: Prisma.WalletUpdateInput = {}

  switch (balanceType) {
    case 'balance':
      newBalanceValue = wallet.balance + amountInCents
      if (amountInCents < 0 && newBalanceValue < 0) {
        throw new Error('Insufficient real balance.')
      }
      updateData.balance = newBalanceValue
      break
    case 'bonusBalance':
      newBalanceValue = wallet.bonusBalance + amountInCents
      if (amountInCents < 0 && newBalanceValue < 0) {
        throw new Error('Insufficient bonus balance.')
      }
      updateData.bonusBalance = newBalanceValue
      break
    case 'lockedBalance':
      newBalanceValue = wallet.lockedBalance + amountInCents
      if (amountInCents < 0 && newBalanceValue < 0) {
        throw new Error('Insufficient locked funds to release.')
      }
      updateData.lockedBalance = newBalanceValue
      break
    default:
      throw new Error('Invalid balance type specified.')
  }
  return tx.wallet.update({ where: { id: walletId }, data: updateData })
}

// --- Core Transaction Creation ---

export interface CreateTransactionArgs {
  userId: string // Originator of the transaction
  receiverId?: string | null // For P2P, commissions, etc.
  type: TransactionType
  status: TransactionStatus
  amountInCents: number
  currencyId: string
  description?: string
  provider?: string
  providerTxId?: string
  walletId?: string // Originator's wallet ID
  productId?: string | null // Link to a product if applicable
  metadata?: Prisma.InputJsonValue
  balanceBeforeInCents?: number
  balanceAfterInCents?: number
  bonusAmountInCents?: number
  bonusBalanceBeforeInCents?: number
  bonusBalanceAfterInCents?: number
}

export async function createTransactionRecord(
  args: CreateTransactionArgs,
  tx?: PrismaTransactionClient
): Promise<Transaction> {
  const db = tx || prisma
  const {
    userId,
    receiverId,
    type,
    status,
    amountInCents,
    currencyId,
    description,
    provider,
    providerTxId,
    metadata,
    walletId,
    productId,
    balanceBeforeInCents,
    balanceAfterInCents,
    bonusAmountInCents,
    bonusBalanceBeforeInCents,
    bonusBalanceAfterInCents,
  } = args

  const createInput: Prisma.TransactionCreateInput = {
    originator: { connect: { id: userId } },
    type,
    status,
    amount: amountInCents,
    currency: { connect: { id: currencyId } },
    description,
    provider,
    providerTxId, // Directly on model as per latest schema discussion
    metadata: metadata || Prisma.JsonNull,
    balanceBefore: balanceBeforeInCents,
    balanceAfter: balanceAfterInCents,
    bonusAmount: bonusAmountInCents,
    bonusBalanceBefore: bonusBalanceBeforeInCents,
    bonusBalanceAfter: bonusBalanceAfterInCents,
  }

  if (receiverId) {
    createInput.receiver = { connect: { id: receiverId } }
  }
  if (walletId) {
    createInput.wallet = { connect: { id: walletId } }
  }
  if (productId) {
    createInput.product = { connect: { id: productId } }
  }

  const transaction = await db.transaction.create({ data: createInput })

  typedAppEventEmitter.emit(AppEvents.TRANSACTION_CREATED, {
    userId,
    transactionId: transaction.id,
    transactionType: type,
    newStatus: status,
    amount: amountInCents, // Emit cents
    currencyId,
  })

  return transaction
}

// --- Deposit Services ---

export async function getDepositProducts(currencyId?: string): Promise<DepositProduct[]> {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      productType: 'DEPOSIT_PACKAGE', // Using ProductType enum string value
      // If products can be specific to a currency or general
      ...(currencyId ? { currencyId: currencyId } : {}),
    },
    orderBy: { priceInCents: 'asc' }, // Assuming 'priceInCents' is Int (cents) in schema
  })

  return products.map((p) => ({
    id: p.id,
    title: p.title, // Standardized to 'name'
    description: p.description,
    priceInCents: p.priceInCents, // priceInCents is in cents
    currencyId: p.currencyId,
    iconUrl: p.iconUrl,
  }))
}

export async function getDepositConfiguration(): Promise<DepositConfigurationResponse> {
  const methods: DepositPaymentMethod[] = [
    {
      id: 'cashapp',
      name: 'CashApp',
      iconUrl: '/icons/cashapp.png',
      minAmount: 500,
      maxAmount: 100000,
      currencyId: 'USD',
    }, // Amounts in cents
    {
      id: 'crypto_btc',
      name: 'Bitcoin (BTC)',
      iconUrl: '/icons/btc.png',
      minAmount: 200000,
      maxAmount: 1000000000,
      currencyId: 'BTC',
    }, // Example min 0.002 BTC in satoshis
  ]
  const limits = { dailyLimit: 500000, weeklyLimit: 2000000 } // Cents

  return { methods, limits }
}

export async function initializeDeposit(
  userId: string,
  dto: InitializeDepositDto // DTO amounts are in major units (e.g., dollars)
): Promise<InitializeDepositResponse> {
  const { amount: amountInMajorUnits, currencyId, paymentMethodId, productId } = dto

  const currencyInfo = await prisma.currency.findUniqueOrThrow({ where: { id: currencyId } })
  const precisionFactor = Math.pow(10, currencyInfo.precision)
  const amountInCents = Math.round(amountInMajorUnits * precisionFactor)

  if (amountInCents <= 0) {
    throw new Error('Deposit amount must be positive and result in at least 1 cent.')
  }

  let productDetails: Product | null = null
  if (productId) {
    productDetails = await prisma.product.findUnique({ where: { id: productId } })
    if (!productDetails) throw new Error(`Product with ID ${productId} not found.`)
    if (productDetails.priceInCents !== amountInCents || productDetails.currencyId !== currencyId) {
      throw new Error('Deposit amount or currency does not match the selected product.')
    }
  }

  return prisma.$transaction(async (tx) => {
    const wallet = await getOrCreateWallet(userId, currencyId, tx)

    const transaction = await createTransactionRecord(
      {
        userId,
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.PENDING,
        amountInCents: amountInCents,
        currencyId,
        provider: paymentMethodId,
        description: productDetails
          ? `Deposit for product: ${productDetails.title}`
          : `Deposit of ${amountInMajorUnits} ${currencyId}`,
        walletId: wallet.id,
        productId: productDetails?.id,
        metadata: {
          productIdFromDto: productId,
          paymentMethodId,
          originalAmountInput: amountInMajorUnits,
        },
        balanceBeforeInCents: wallet.balance,
      },
      tx
    )

    const paymentResponse: Partial<InitializeDepositResponse> = {}
    if (paymentMethodId === 'cashapp') {
      const operatorCashtag = process.env.CASHAPP_RECEIVING_CASHTAG || '$YourPlatformCashtag'
      paymentResponse.providerData = {
        message: `Please send ${amountInMajorUnits} ${currencyId} to ${operatorCashtag} with payment note: ${transaction.id}`,
        cashtag: operatorCashtag,
        noteForPayment: transaction.id,
      }
    } else {
      console.warn(`Payment initiation logic for method ${paymentMethodId} is not implemented.`)
      paymentResponse.paymentReference = `mock_ref_${transaction.id}`
    }

    return {
      transactionId: transaction.id,
      ...paymentResponse,
    }
  })
}

export async function confirmDepositPayment(
  internalTransactionId: string,
  confirmedAmountInMajorUnits: number,
  confirmedCurrencyId: string,
  providerTransactionIdExt: string, // External provider's transaction ID
  senderInfo?: string,
  webhookPayload?: any
): Promise<Transaction> {
  return prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.findUnique({
      where: { id: internalTransactionId },
      include: { originator: { include: { vipInfo: true } }, currency: true }, // originator is User
    })

    if (!transaction)
      throw new Error(`Pending transaction with ID ${internalTransactionId} not found.`)
    if (transaction.status !== TransactionStatus.PENDING) {
      if (transaction.status === TransactionStatus.COMPLETED) return transaction
      throw new Error(
        `Transaction ${internalTransactionId} not PENDING (current: ${transaction.status}).`
      )
    }
    if (transaction.type !== TransactionType.DEPOSIT)
      throw new Error(`Transaction ${internalTransactionId} is not a DEPOSIT.`)

    const user = transaction.originator
    if (!user) throw new Error('Originator user not found for transaction.')
    if (!transaction.currency)
      throw new Error(`Currency info for tx ${internalTransactionId} not found.`)

    const precisionFactor = Math.pow(10, transaction.currency.precision)
    const confirmedAmountInCents = Math.round(confirmedAmountInMajorUnits * precisionFactor)

    const expectedAmountInCents = transaction.amount
    if (
      expectedAmountInCents !== confirmedAmountInCents ||
      transaction.currencyId !== confirmedCurrencyId
    ) {
      const failureDesc = `${transaction.description || 'Deposit'} - Payment confirmation failed: Amount/currency mismatch. Expected ${expectedAmountInCents} ${transaction.currencyId} (cents), received ${confirmedAmountInCents} ${confirmedCurrencyId} (cents).`
      await tx.transaction.update({
        where: { id: internalTransactionId },
        data: {
          status: TransactionStatus.FAILED,
          description: failureDesc,
          providerTxId: providerTransactionIdExt, // Store external ID even on failure
          metadata: {
            ...((transaction.metadata as object) || {}),
            webhookPayload: webhookPayload as any,
            senderInfo,
            providerActualTxId: providerTransactionIdExt,
            discrepancy: true,
          },
          processedAt: new Date(),
        },
      })
      throw new Error(`Payment confirmation mismatch for ${internalTransactionId}.`)
    }

    const wallet = await getOrCreateWallet(user.id, transaction.currencyId, tx)
    const balanceBeforeUpdate = wallet.balance
    const updatedWallet = await updateWalletBalance(
      wallet.id,
      confirmedAmountInCents,
      'balance',
      tx
    )

    const completedTransaction = await tx.transaction.update({
      where: { id: internalTransactionId },
      data: {
        status: TransactionStatus.COMPLETED,
        providerTxId: providerTransactionIdExt,
        processedAt: new Date(),
        metadata: {
          ...((transaction.metadata as object) || {}),
          webhookPayload,
          senderInfo,
          providerActualTxId: providerTransactionIdExt,
        },
        balanceBefore: balanceBeforeUpdate,
        balanceAfter: updatedWallet.balance,
      },
    })

    typedAppEventEmitter.emit(AppEvents.DEPOSIT_SUCCESSFUL, {
      userId: user.id,
      transactionId: completedTransaction.id,
      amount: confirmedAmountInCents,
      currencyId: transaction.currencyId,
      paymentProvider: transaction.provider || 'unknown',
    })

    let vipDataForXp = user.vipInfo
    if (!vipDataForXp) vipDataForXp = await getOrCreateVipInfo(user.id, tx)

    const xpToAward = calculateXpBonusForDeposit(confirmedAmountInCents, vipDataForXp)
    if (xpToAward > 0) {
      await addXpToUser(user.id, xpToAward, TransactionType.DEPOSIT, completedTransaction.id, {
        currency: transaction.currencyId,
      })
    }
    // TODO: Deposit Bonus Logic (using amounts in cents)
    return completedTransaction
  })
}

async function getOrCreateVipInfo(userId: string, tx: PrismaTransactionClient): Promise<VipInfo> {
  let vipInfo = await tx.vipInfo.findUnique({ where: { userId } })
  if (!vipInfo) {
    const defaultLevelConfig = getVipLevelConfiguration(1) // Assumes level 1 is default
    if (!defaultLevelConfig) throw new Error('Default level 1 VIP config missing.')
    vipInfo = await tx.vipInfo.create({
      data: {
        userId,
        level: 1,
        currentLevelXp: 0,
        totalXp: 0,
        nextLevelXpRequired: defaultLevelConfig.xpRequired, // xpRequired from config is the bar length
        cashbackPercentage: defaultLevelConfig.cashbackPercentage,
        prioritySupport: defaultLevelConfig.prioritySupport,
        // Initialize other fields as per your VipInfo model defaults or logic
      },
    })
  }
  return vipInfo
}

export async function getTransactionHistory(
  userId: string,
  filters: {
    type?: TransactionType | TransactionType[]
    status?: TransactionStatus | TransactionStatus[]
    currencyId?: string
  },
  pagination: { skip?: number; take?: number } = { skip: 0, take: 20 }
): Promise<PaginatedResponse<TransactionHistoryEntry>> {
  const whereClause: Prisma.TransactionWhereInput = { originatorUserId: userId }
  if (filters.type) {
    whereClause.type = Array.isArray(filters.type) ? { in: filters.type } : filters.type
  }
  if (filters.status) {
    whereClause.status = Array.isArray(filters.status) ? { in: filters.status } : filters.status
  }
  if (filters.currencyId) {
    whereClause.currencyId = filters.currencyId
  }

  const total = await prisma.transaction.count({ where: whereClause })
  const transactions = await prisma.transaction.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    skip: pagination.skip,
    take: pagination.take,
    include: { currency: { select: { precision: true } } }, // Only fetch precision
  })

  return {
    items: transactions.map((t) => ({
      id: t.id,
      date: t.createdAt,
      type: t.type,
      status: t.status,
      amount: t.amount, // Amount in cents
      currencyId: t.currencyId,
      currencyPrecision: t.currency.precision,
      description: t.description,
      provider: t.provider,
      providerTxId: t.providerTxId,
    })),
    total,
    page:
      pagination.skip !== undefined && pagination.take
        ? Math.floor(pagination.skip / pagination.take) + 1
        : 1,
    limit: pagination.take,
    totalPages: pagination.take ? Math.ceil(total / pagination.take) : 1,
  }
}

// --- Withdrawal Services ---
export async function getWithdrawalConfiguration(): Promise<WithdrawalConfig> {
  return {
    methods: [
      // DTO Amounts are in major units, min/max here should reflect that for client
      {
        id: 'bank_transfer_br',
        name: 'Brazilian Bank Transfer (PIX)',
        currencyId: 'BRL',
        minAmount: 50,
        maxAmount: 5000,
        feeFixed: 0,
        feePercent: 0.01,
        processingTime: '1-2 business days',
        requiredFields: [
          {
            name: 'pixKey',
            label: 'PIX Key',
            type: 'text',
            validationRegex:
              '^[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}$|^\\d{11}$|^[0-9a-fA-F-]{36}$|^\\+\\d{1,3}\\d{4,14}(?:x.+)?$',
          },
        ],
      },
      {
        id: 'crypto_usdt_trc20',
        name: 'USDT (TRC20)',
        currencyId: 'USDT',
        minAmount: 20,
        maxAmount: 10000,
        feeFixed: 1,
        feePercent: 0,
        processingTime: '10-30 minutes',
        requiredFields: [
          {
            name: 'walletAddress',
            label: 'USDT TRC20 Address',
            type: 'text',
            validationRegex: '^T[1-9A-HJ-NP-Za-km-z]{33}$',
          },
        ],
      },
    ],
    // These limits are conceptual and should be checked against user's actual transaction history for a period
    dailyWithdrawalLimit: 10000, // Representing major units (e.g. $100.00 if currency precision is 2)
    weeklyWithdrawalLimit: 50000,
  }
}

export async function requestWithdrawal(
  userId: string,
  dto: WithdrawalRequestDto
): Promise<Transaction> {
  const { amount: amountInMajorUnits, currencyId, paymentMethodId, recipientDetails } = dto

  const currencyInfo = await prisma.currency.findUniqueOrThrow({ where: { id: currencyId } })
  const precisionFactor = Math.pow(10, currencyInfo.precision)
  const withdrawalAmountInCents = Math.round(amountInMajorUnits * precisionFactor)

  if (withdrawalAmountInCents <= 0) {
    throw new Error('Withdrawal amount must be positive.')
  }
  // TODO: More validations (KYC, velocity based on actual withdrawal history, bonus wagering)

  return prisma.$transaction(async (tx) => {
    const wallet = await getOrCreateWallet(userId, currencyId, tx)

    if (wallet.balance < withdrawalAmountInCents) {
      throw new Error('Insufficient funds for withdrawal.')
    }

    const balanceBeforeUpdate = wallet.balance
    await updateWalletBalance(wallet.id, -withdrawalAmountInCents, 'balance', tx)
    await updateWalletBalance(wallet.id, withdrawalAmountInCents, 'lockedBalance', tx)

    const transaction = await createTransactionRecord(
      {
        userId,
        type: TransactionType.WITHDRAWAL,
        status: TransactionStatus.PENDING,
        amountInCents: withdrawalAmountInCents,
        currencyId,
        provider: paymentMethodId,
        description: `Withdrawal request to ${paymentMethodId}`,
        walletId: wallet.id,
        metadata: { recipientDetails, originalAmountInput: amountInMajorUnits },
        balanceBeforeInCents: balanceBeforeUpdate,
        balanceAfterInCents: wallet.balance - withdrawalAmountInCents, // This is main balance after debit
      },
      tx
    )

    typedAppEventEmitter.emit(AppEvents.WITHDRAWAL_REQUESTED, {
      userId,
      transactionId: transaction.id,
      amount: withdrawalAmountInCents,
      currencyId,
    })
    return transaction
  })
}

export async function updateWithdrawalStatus(
  transactionId: string,
  newStatus: 'COMPLETED' | 'FAILED' | 'CANCELLED',
  adminNotes?: string,
  failureReason?: string
): Promise<Transaction> {
  return prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.findUniqueOrThrow({
      where: { id: transactionId },
      include: { originator: true, currency: true },
    })
    if (transaction.type !== TransactionType.WITHDRAWAL)
      throw new Error('Transaction not a withdrawal.')
    const finalStatuses: TransactionStatus[] = [
      TransactionStatus.COMPLETED,
      TransactionStatus.FAILED,
      TransactionStatus.CANCELLED,
      TransactionStatus.EXPIRED,
    ]
    if (finalStatuses.includes(transaction.status))
      throw new Error(`Withdrawal ${transactionId} already finalized: ${transaction.status}.`)

    const metadataUpdate: Prisma.InputJsonValue = {
      ...((transaction.metadata as object) || {}),
      adminNotes,
    }

    if (failureReason) (metadataUpdate as any).failureReason = failureReason

    const updatedTx = await tx.transaction.update({
      where: { id: transactionId },
      data: { status: newStatus, processedAt: new Date(), metadata: metadataUpdate },
    })

    const withdrawalAmountInCents = transaction.amount
    const wallet = await getOrCreateWallet(transaction.originatorUserId, transaction.currencyId, tx)

    if (newStatus === TransactionStatus.COMPLETED) {
      await updateWalletBalance(wallet.id, -withdrawalAmountInCents, 'lockedBalance', tx)
    } else if (
      newStatus === TransactionStatus.FAILED ||
      newStatus === TransactionStatus.CANCELLED
    ) {
      await updateWalletBalance(wallet.id, -withdrawalAmountInCents, 'lockedBalance', tx)
      await updateWalletBalance(wallet.id, withdrawalAmountInCents, 'balance', tx)
      const finalWalletState = await tx.wallet.findUniqueOrThrow({ where: { id: wallet.id } })
      await tx.transaction.update({
        where: { id: transactionId },
        data: { balanceAfter: finalWalletState.balance },
      })
    }

    const eventPayload: TransactionStatusChangedPayload = {
      userId: transaction.originatorUserId,
      transactionId: updatedTx.id,
      transactionType: updatedTx.type,
      newStatus: updatedTx.status,
      previousStatus: transaction.status,
      amount: updatedTx.amount,
      currencyId: updatedTx.currencyId,
    }
    typedAppEventEmitter.emit(AppEvents.TRANSACTION_CHANGED, eventPayload)

    if (newStatus === TransactionStatus.COMPLETED) {
      typedAppEventEmitter.emit(AppEvents.WITHDRAWAL_PROCESSED, {
        userId: transaction.originatorUserId,
        transactionId: updatedTx.id,
        amount: updatedTx.amount,
        currencyId: updatedTx.currencyId,
      })
    }
    return updatedTx
  })
}

// --- User Wallet/Currency Info ---
export async function getUserWallets(userId: string): Promise<UserWallet[]> {
  const wallets = await prisma.wallet.findMany({
    where: { userId },
    include: { currency: true },
  })
  return wallets.map((w) => ({
    currencyId: w.currency.id,
    name: w.currency.name,
    symbol: w.currency.symbol,
    balance: w.balance, // In cents
    bonusBalance: w.bonusBalance, // In cents
    lockedBalance: w.lockedBalance, // In cents
    type: w.currency.type as 'FIAT' | 'CRYPTO' | 'VIRTUAL',
    precision: w.currency.precision,
    iconUrl: `/icons/currency/${w.currency.id.toLowerCase()}.png`, // Example path
  }))
}

// --- Cron Jobs ---
export async function expireOldPendingDeposits(): Promise<number> {
  const oneHourAgo = new Date(Date.now() - 1 * 60 * 60 * 1000)
  const expiredTransactions = await prisma.transaction.findMany({
    where: {
      type: TransactionType.DEPOSIT,
      status: TransactionStatus.PENDING,
      createdAt: { lt: oneHourAgo },
    },
  })
  if (expiredTransactions.length === 0) return 0

  const result = await prisma.transaction.updateMany({
    where: { id: { in: expiredTransactions.map((t) => t.id) } },
    data: {
      status: TransactionStatus.EXPIRED,
      processedAt: new Date(),
      description: 'Pending deposit expired.',
    }, // Handle potential DbNull for description
  })

  expiredTransactions.forEach((tx) => {
    typedAppEventEmitter.emit(AppEvents.TRANSACTION_CHANGED, {
      userId: tx.originatorUserId,
      transactionId: tx.id,
      transactionType: tx.type,
      newStatus: TransactionStatus.EXPIRED,
      previousStatus: tx.status,
      amount: tx.amount,
      currencyId: tx.currencyId,
    })
  })
  return result.count
}

export function initTransactionCronJobs() {
  try {
    cron.schedule('*/30 * * * *', async () => {
      console.log('[CronJob] Running: Expire Old Pending Deposits')
      try {
        const expiredCount = await expireOldPendingDeposits()
        if (expiredCount > 0) console.log(`[CronJob] Expired ${expiredCount} pending deposits.`)
      } catch (error) {
        console.error('[CronJob] Error expiring old deposits:', error)
      }
    })
    console.log('[CronJob] Transaction-related cron jobs initialized.')
  } catch (err) {
    console.error('Failed to init transaction cron jobs. Ensure "node-cron" is installed.', err)
  }
}

// --- System Award Transaction Helper ---
export async function recordSystemAwardTransaction(
  args: Omit<CreateTransactionArgs, 'status' | 'provider' | 'receiverId'> & {
    type: 'BONUS_AWARD' | 'XP_AWARD' | 'REBATE_PAYOUT'
  },
  tx: PrismaTransactionClient
): Promise<Transaction> {
  const wallet = await getOrCreateWallet(args.userId, args.currencyId, tx)
  const amountInCents = args.amountInCents
  let balanceBeforeInCents: number
  let balanceTypeToUpdate: 'balance' | 'bonusBalance' = 'balance'

  if (args.type === TransactionType.BONUS_AWARD) {
    balanceBeforeInCents = wallet.bonusBalance
    balanceTypeToUpdate = 'bonusBalance'
  } else {
    balanceBeforeInCents = wallet.balance
  }

  await updateWalletBalance(wallet.id, amountInCents, balanceTypeToUpdate, tx)
  const updatedWallet = await tx.wallet.findUniqueOrThrow({ where: { id: wallet.id } })
  const balanceAfterInCents =
    balanceTypeToUpdate === 'bonusBalance' ? updatedWallet.bonusBalance : updatedWallet.balance

  const transactionArgs: CreateTransactionArgs = {
    ...args,
    status: TransactionStatus.COMPLETED,
    provider: 'System',
    walletId: wallet.id,
    balanceBeforeInCents: balanceBeforeInCents,
    balanceAfterInCents: balanceAfterInCents,
  }

  if (args.type === TransactionType.BONUS_AWARD) {
    transactionArgs.bonusAmountInCents = amountInCents
    transactionArgs.bonusBalanceBeforeInCents = balanceBeforeInCents
    transactionArgs.bonusBalanceAfterInCents = balanceAfterInCents
  }

  return createTransactionRecord(transactionArgs, tx)
}
