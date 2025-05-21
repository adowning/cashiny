
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.CurrencyScalarFieldEnum = {
  id: 'id',
  code: 'code',
  name: 'name',
  symbol: 'symbol',
  precision: 'precision',
  type: 'type',
  isActive: 'isActive',
  meta: 'meta',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  username: 'username',
  name: 'name',
  email: 'email',
  emailVerified: 'emailVerified',
  displayUsername: 'displayUsername',
  phone: 'phone',
  cashtag: 'cashtag',
  phoneVerified: 'phoneVerified',
  isVerified: 'isVerified',
  passwordHash: 'passwordHash',
  role: 'role',
  status: 'status',
  totalXp: 'totalXp',
  currentLevel: 'currentLevel',
  referralCode: 'referralCode',
  commissionRate: 'commissionRate',
  twoFactorEnabled: 'twoFactorEnabled',
  isOnline: 'isOnline',
  twoFactorSecret: 'twoFactorSecret',
  image: 'image',
  twoFactorRecoveryCodes: 'twoFactorRecoveryCodes',
  lastLogin: 'lastLogin',
  lastIp: 'lastIp',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  activeWalletId: 'activeWalletId',
  referrerId: 'referrerId',
  userVipProgressId: 'userVipProgressId'
};

exports.Prisma.SessionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  username: 'username',
  name: 'name',
  activeGameId: 'activeGameId',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt',
  refreshToken: 'refreshToken',
  active: 'active',
  token: 'token',
  updatedAt: 'updatedAt'
};

exports.Prisma.AccountScalarFieldEnum = {
  id: 'id',
  accountId: 'accountId',
  providerId: 'providerId',
  userId: 'userId',
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
  idToken: 'idToken',
  accessTokenExpiresAt: 'accessTokenExpiresAt',
  refreshTokenExpiresAt: 'refreshTokenExpiresAt',
  scope: 'scope',
  password: 'password',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.VerificationScalarFieldEnum = {
  id: 'id',
  identifier: 'identifier',
  value: 'value',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProfileScalarFieldEnum = {
  id: 'id',
  balance: 'balance',
  totalXpFromOperator: 'totalXpFromOperator',
  activeCurrencyType: 'activeCurrencyType',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  currentGameSessionid: 'currentGameSessionid',
  userId: 'userId',
  otherUserid: 'otherUserid',
  role: 'role',
  operatorAccessId: 'operatorAccessId'
};

exports.Prisma.SettingsScalarFieldEnum = {
  id: 'id',
  theme: 'theme',
  language: 'language',
  emailNotifications: 'emailNotifications',
  smsNotifications: 'smsNotifications',
  pushNotifications: 'pushNotifications',
  meta: 'meta',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  userId: 'userId'
};

exports.Prisma.WalletScalarFieldEnum = {
  id: 'id',
  balance: 'balance',
  isActive: 'isActive',
  address: 'address',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  userId: 'userId',
  currencyCode: 'currencyCode'
};

exports.Prisma.OperatorAccessScalarFieldEnum = {
  id: 'id',
  name: 'name',
  operator_secret: 'operator_secret',
  operator_access: 'operator_access',
  callback_url: 'callback_url',
  active: 'active',
  permissions: 'permissions',
  ips: 'ips',
  description: 'description',
  last_used_at: 'last_used_at',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  ownerId: 'ownerId',
  acceptedPayments: 'acceptedPayments',
  ownedById: 'ownedById'
};

exports.Prisma.AchievementScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  xpReward: 'xpReward',
  iconUrl: 'iconUrl',
  secret: 'secret',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.GameScalarFieldEnum = {
  id: 'id',
  name: 'name',
  title: 'title',
  goldsvetData: 'goldsvetData',
  slug: 'slug',
  description: 'description',
  provider: 'provider',
  category: 'category',
  tags: 'tags',
  isActive: 'isActive',
  thumbnailUrl: 'thumbnailUrl',
  bannerUrl: 'bannerUrl',
  meta: 'meta',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  featured: 'featured',
  operatorId: 'operatorId'
};

exports.Prisma.PostScalarFieldEnum = {
  id: 'id',
  title: 'title',
  content: 'content',
  published: 'published',
  tags: 'tags',
  viewCount: 'viewCount',
  meta: 'meta',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  authorId: 'authorId'
};

exports.Prisma.CommentScalarFieldEnum = {
  id: 'id',
  content: 'content',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  postId: 'postId',
  authorId: 'authorId'
};

exports.Prisma.GameSpinScalarFieldEnum = {
  id: 'id',
  spinData: 'spinData',
  createdAt: 'createdAt',
  grossWinAmount: 'grossWinAmount',
  betAmount: 'betAmount',
  sessionId: 'sessionId'
};

exports.Prisma.GameSessionScalarFieldEnum = {
  id: 'id',
  isActive: 'isActive',
  sessionData: 'sessionData',
  startedAt: 'startedAt',
  endedAt: 'endedAt',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  userId: 'userId',
  gameId: 'gameId',
  profileId: 'profileId'
};

exports.Prisma.GameTransactionScalarFieldEnum = {
  id: 'id',
  type: 'type',
  amount: 'amount',
  currency: 'currency',
  transactionDetails: 'transactionDetails',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  sessionId: 'sessionId',
  userId: 'userId',
  parentFinancialTransactionId: 'parentFinancialTransactionId'
};

exports.Prisma.UserAchievementScalarFieldEnum = {
  id: 'id',
  unlockedAt: 'unlockedAt',
  meta: 'meta',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  userId: 'userId',
  achievementId: 'achievementId'
};

exports.Prisma.XpEventScalarFieldEnum = {
  id: 'id',
  points: 'points',
  source: 'source',
  sourceId: 'sourceId',
  meta: 'meta',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  userId: 'userId'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  type: 'type',
  title: 'title',
  message: 'message',
  isRead: 'isRead',
  readAt: 'readAt',
  actionUrl: 'actionUrl',
  meta: 'meta',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  userId: 'userId'
};

exports.Prisma.ChatMessageScalarFieldEnum = {
  id: 'id',
  channel: 'channel',
  content: 'content',
  mediaUrl: 'mediaUrl',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  authorId: 'authorId'
};

exports.Prisma.FriendshipScalarFieldEnum = {
  id: 'id',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  requesterId: 'requesterId',
  receiverId: 'receiverId'
};

exports.Prisma.TransactionScalarFieldEnum = {
  id: 'id',
  type: 'type',
  status: 'status',
  amount: 'amount',
  description: 'description',
  referenceId: 'referenceId',
  meta: 'meta',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  productId: 'productId',
  walletId: 'walletId',
  userId: 'userId',
  currencyCode: 'currencyCode',
  targetUserId: 'targetUserId'
};

exports.Prisma.GameLaunchLinkScalarFieldEnum = {
  id: 'id',
  token_internal: 'token_internal',
  currency: 'currency',
  player_operator_id: 'player_operator_id',
  mode: 'mode',
  meta: 'meta',
  request_ip: 'request_ip',
  user_agent: 'user_agent',
  session_url: 'session_url',
  state: 'state',
  active: 'active',
  expires_at: 'expires_at',
  extra_meta: 'extra_meta',
  token_original: 'token_original',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  userId: 'userId',
  gameId: 'gameId',
  operatorId: 'operatorId'
};

exports.Prisma.ProductScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  url: 'url',
  productType: 'productType',
  bonusCode: 'bonusCode',
  bonusTotalInCredits: 'bonusTotalInCredits',
  priceInCents: 'priceInCents',
  amountToReceiveInCredits: 'amountToReceiveInCredits',
  bestValue: 'bestValue',
  discountInCents: 'discountInCents',
  bonusSpins: 'bonusSpins',
  isPromo: 'isPromo',
  totalDiscountInCents: 'totalDiscountInCents',
  shopId: 'shopId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EventLogScalarFieldEnum = {
  id: 'id',
  action: 'action',
  targetType: 'targetType',
  targetId: 'targetId',
  data: 'data',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  timestamp: 'timestamp',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  actorId: 'actorId'
};

exports.Prisma.OperatorInvitationScalarFieldEnum = {
  id: 'id',
  operatorId: 'operatorId',
  email: 'email',
  role: 'role',
  token: 'token',
  expiresAt: 'expiresAt',
  acceptedAt: 'acceptedAt',
  invitedById: 'invitedById'
};

exports.Prisma.VipLevelScalarFieldEnum = {
  id: 'id',
  level: 'level',
  name: 'name',
  rankName: 'rankName',
  iconUrl: 'iconUrl',
  description: 'description',
  xpRequired: 'xpRequired',
  depositExpRequired: 'depositExpRequired',
  betExpRequired: 'betExpRequired',
  levelUpBonusAmount: 'levelUpBonusAmount',
  weeklyBonusAmount: 'weeklyBonusAmount',
  monthlyBonusAmount: 'monthlyBonusAmount',
  dailySignInMultiplier: 'dailySignInMultiplier',
  cashbackRate: 'cashbackRate',
  rebateRate: 'rebateRate',
  cycleAwardSwitch: 'cycleAwardSwitch',
  levelAwardSwitch: 'levelAwardSwitch',
  signInAwardSwitch: 'signInAwardSwitch',
  betAwardSwitch: 'betAwardSwitch',
  protectionDays: 'protectionDays',
  keepRate: 'keepRate',
  additionalBenefits: 'additionalBenefits',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UserVipProgressScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  currentVipLevelId: 'currentVipLevelId',
  currentVipLevelNumber: 'currentVipLevelNumber',
  currentCycleDepositExp: 'currentCycleDepositExp',
  currentCycleBetExp: 'currentCycleBetExp',
  cycleStartDate: 'cycleStartDate',
  lifetimeDepositExp: 'lifetimeDepositExp',
  lifetimeBetExp: 'lifetimeBetExp',
  totalXp: 'totalXp',
  isRelegationProtected: 'isRelegationProtected',
  relegationProtectionEndDate: 'relegationProtectionEndDate',
  lastLevelUpRewardClaimedForLevel: 'lastLevelUpRewardClaimedForLevel',
  lastWeeklyBonusClaimedAt: 'lastWeeklyBonusClaimedAt',
  lastMonthlyBonusClaimedAt: 'lastMonthlyBonusClaimedAt',
  lastDailySignInDate: 'lastDailySignInDate',
  lastBetRewardClaimedAt: 'lastBetRewardClaimedAt',
  telegramHandle: 'telegramHandle',
  expSwitchType: 'expSwitchType',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.VipRewardClaimScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  rewardType: 'rewardType',
  vipLevelAtClaim: 'vipLevelAtClaim',
  claimedAmount: 'claimedAmount',
  currency: 'currency',
  description: 'description',
  relatedResourceId: 'relatedResourceId',
  claimedAt: 'claimedAt'
};

exports.Prisma.VipTaskScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  xpReward: 'xpReward',
  bonusReward: 'bonusReward',
  currencyForBonus: 'currencyForBonus',
  type: 'type',
  targetValue: 'targetValue',
  isActive: 'isActive',
  resetFrequency: 'resetFrequency',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UserVipTaskProgressScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  vipTaskId: 'vipTaskId',
  progress: 'progress',
  isCompleted: 'isCompleted',
  completedAt: 'completedAt',
  lastResetAt: 'lastResetAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.Role = exports.$Enums.Role = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  VIP: 'VIP',
  MODERATOR: 'MODERATOR',
  OWNER: 'OWNER',
  MEMBER: 'MEMBER',
  SUPPORT: 'SUPPORT'
};

exports.UserStatus = exports.$Enums.UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  ONLINE: 'ONLINE',
  OFFLINE: 'OFFLINE',
  SUSPENDED: 'SUSPENDED',
  BANNED: 'BANNED'
};

exports.KeyMode = exports.$Enums.KeyMode = {
  read: 'read',
  write: 'write',
  upload: 'upload',
  manage_users: 'manage_users',
  manage_settings: 'manage_settings',
  launch_game: 'launch_game'
};

exports.PaymentMethod = exports.$Enums.PaymentMethod = {
  INSTORE_CASH: 'INSTORE_CASH',
  INSTORE_CARD: 'INSTORE_CARD',
  CASH_APP: 'CASH_APP'
};

exports.GameProvider = exports.$Enums.GameProvider = {
  PRAGMATICPLAY: 'PRAGMATICPLAY',
  EVOPLAY: 'EVOPLAY',
  NETENT: 'NETENT',
  PLAYNGO: 'PLAYNGO',
  RELAXGAMING: 'RELAXGAMING',
  HACKSAW: 'HACKSAW',
  BGAMING: 'BGAMING',
  SPRIBE: 'SPRIBE',
  INTERNAL: 'INTERNAL',
  REDTIGER: 'REDTIGER',
  NETGAME: 'NETGAME',
  BIGFISHGAMES: 'BIGFISHGAMES',
  CQNINE: 'CQNINE',
  NOLIMIT: 'NOLIMIT',
  KICKASS: 'KICKASS'
};

exports.GameCategory = exports.$Enums.GameCategory = {
  FISH: 'FISH',
  POKER: 'POKER',
  SLOTS: 'SLOTS',
  TABLE_GAMES: 'TABLE_GAMES',
  LIVE_CASINO: 'LIVE_CASINO',
  SPORTSBOOK: 'SPORTSBOOK',
  VIRTUAL_SPORTS: 'VIRTUAL_SPORTS',
  LOTTERY: 'LOTTERY',
  CRASH: 'CRASH',
  OTHER: 'OTHER'
};

exports.TransactionType = exports.$Enums.TransactionType = {
  DEPOSIT: 'DEPOSIT',
  WITHDRAWAL: 'WITHDRAWAL',
  BET: 'BET',
  WIN: 'WIN',
  BONUS_AWARDED: 'BONUS_AWARDED',
  BONUS_WAGERED: 'BONUS_WAGERED',
  BONUS_EXPIRED: 'BONUS_EXPIRED',
  TRANSFER_SENT: 'TRANSFER_SENT',
  TRANSFER_RECEIVED: 'TRANSFER_RECEIVED',
  SYSTEM_ADJUSTMENT_CREDIT: 'SYSTEM_ADJUSTMENT_CREDIT',
  SYSTEM_ADJUSTMENT_DEBIT: 'SYSTEM_ADJUSTMENT_DEBIT',
  TOURNAMENT_BUYIN: 'TOURNAMENT_BUYIN',
  TOURNAMENT_PRIZE: 'TOURNAMENT_PRIZE',
  AFFILIATE_COMMISSION: 'AFFILIATE_COMMISSION',
  REFUND: 'REFUND',
  FEE: 'FEE'
};

exports.NotificationType = exports.$Enums.NotificationType = {
  SYSTEM_MESSAGE: 'SYSTEM_MESSAGE',
  FRIEND_REQUEST_RECEIVED: 'FRIEND_REQUEST_RECEIVED',
  FRIEND_REQUEST_ACCEPTED: 'FRIEND_REQUEST_ACCEPTED',
  ACHIEVEMENT_UNLOCKED: 'ACHIEVEMENT_UNLOCKED',
  BALANCE_UPDATE: 'BALANCE_UPDATE',
  PROMOTIONAL_OFFER: 'PROMOTIONAL_OFFER',
  TOURNAMENT_INVITE: 'TOURNAMENT_INVITE',
  TOURNAMENT_RESULT: 'TOURNAMENT_RESULT',
  SECURITY_ALERT: 'SECURITY_ALERT',
  GAME_EVENT: 'GAME_EVENT',
  NEW_MESSAGE: 'NEW_MESSAGE',
  LEVEL_UP: 'LEVEL_UP'
};

exports.FriendshipStatus = exports.$Enums.FriendshipStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  DECLINED: 'DECLINED',
  BLOCKED: 'BLOCKED'
};

exports.TransactionStatus = exports.$Enums.TransactionStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
  EXPIRED: 'EXPIRED',
  REJECTED: 'REJECTED',
  REQUIRES_ACTION: 'REQUIRES_ACTION',
  ON_HOLD: 'ON_HOLD'
};

exports.Prisma.ModelName = {
  Currency: 'Currency',
  User: 'User',
  Session: 'Session',
  Account: 'Account',
  Verification: 'Verification',
  Profile: 'Profile',
  Settings: 'Settings',
  Wallet: 'Wallet',
  OperatorAccess: 'OperatorAccess',
  Achievement: 'Achievement',
  Game: 'Game',
  Post: 'Post',
  Comment: 'Comment',
  GameSpin: 'GameSpin',
  GameSession: 'GameSession',
  GameTransaction: 'GameTransaction',
  UserAchievement: 'UserAchievement',
  XpEvent: 'XpEvent',
  Notification: 'Notification',
  ChatMessage: 'ChatMessage',
  Friendship: 'Friendship',
  Transaction: 'Transaction',
  GameLaunchLink: 'GameLaunchLink',
  Product: 'Product',
  EventLog: 'EventLog',
  OperatorInvitation: 'OperatorInvitation',
  VipLevel: 'VipLevel',
  UserVipProgress: 'UserVipProgress',
  VipRewardClaim: 'VipRewardClaim',
  VipTask: 'VipTask',
  UserVipTaskProgress: 'UserVipTaskProgress'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
