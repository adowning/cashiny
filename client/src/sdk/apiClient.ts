// // apps/client/src/sdk/apiClient.ts
// import { useAuthStore } from '@/stores/auth.store';
// import {
//   type ApiErrorData,
//   type AuthCredentials, // Auth related
//   type AuthResponseDto, // Currency and Transaction related
//   type BalanceType,
//   type ClientClaimVipRewardPayload,
//   DepositHistoryResponse,
//   GameBigWinData,
//   type GameCategory as GameCategoryType,
//   type GameRound as GameHistoryEntryType, // type GameProvider , // Game related
//   type Game as GameType,
//   GetOperatorDataResponse,
//   type GoogleSignInDto,
//   type GoogleSignInResponse, // Deposit related
//   type InitializeDepositDto,
//   type InitializeDepositResponseDto,
//   type LaunchGameResponseDto,
//   NETWORK_CONFIG,
//   type PaginatedResponse,
//   type Product,
//   type RefreshTokenDto,
//   type SetReferrerDto,
//   type SignUpPayload,
//   type TipUserDto,
//   type Transaction as TransactionType,
//   type UpdatePasswordDto,
//   type UpdateUserInput, // User related
//   type UserVipStatus,
//   UserWithProfile,
//   type VipBenefit as VipBenefitType,
//   VipInfo, // type VipInfo,
// } from '@cashflow/types';

// // Or your monorepo's types package alias like @repo/types

// // --- Custom Client-Specific DTOs (Payloads sent from client) ---
// // Ideally, these should also be in @cashflow/types if they represent standard client->server contracts

// // --- Configuration ---
// const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// // --- ApiError Class ---

// // export class ApiError extends Error {
// //   public code: number | string | undefined;
// //   public data: ApiErrorData;
// //   constructor(message: string, code?: number | string, data?: any) {
// //     super(message);
// //     this.name = 'ApiError';
// //     this.code = code;
// //     this.data = data || { message };
// //     if (Error.captureStackTrace) {
// //       Error.captureStackTrace(this, ApiError);
// //     }
// //   }
// // }

// // --- ApiClient Class ---
// class ApiClient {
//   private isRefreshingToken = false;
//   private tokenRefreshSubscribers: Array<(newAccessToken: string) => void> = [];

//   constructor() {}

//   private async request<T = any>(
//     endpoint: string,
//     method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
//     body?: unknown,
//     customHeaders?: HeadersInit,
//     isRetry = false,
//   ): Promise<T> {
//     const authStore = useAuthStore(); // Must be called inside to get active store instance
//     const token = authStore.accessToken;
//     console.log(token);
//     const headers: Record<string, string> = {
//       ...(customHeaders as Record<string, string>),
//     };
//     if (!(body instanceof FormData)) {
//       headers['Content-Type'] = 'application/json';
//     }
//     if (token) {
//       headers['Authorization'] = `Bearer ${token}`;
//     }

//     const config: RequestInit = { method, headers };
//     if (body) {
//       if (body instanceof FormData) {
//         config.body = body;
//         delete (headers as Record<string, string>)['Content-Type'];
//       } else {
//         config.body = JSON.stringify(body);
//       }
//     }

//     const response = await fetch(`${BASE_URL}${endpoint}`, config);

//     if (response.status === 401 && !isRetry) {
//       if (!this.isRefreshingToken) {
//         this.isRefreshingToken = true;
//         try {
//           console.log('ApiClient: Attempting to refresh token...');
//           const refreshTokenValue = authStore.refreshToken; // This is string | undefined
//           if (!refreshTokenValue) {
//             // Checks for undefined or empty string
//             authStore.logout();
//             throw new ApiError(
//               'Unauthorized: No refresh token available for refresh attempt.',
//               401,
//             );
//           }

//           const refreshPayload: RefreshTokenDto = {
//             refreshToken: refreshTokenValue,
//           };
//           const refreshResponse = await fetch(`${BASE_URL}/auth/refresh-token`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(refreshPayload),
//           });

//           if (!refreshResponse.ok) {
//             const errorData = await refreshResponse.json().catch(() => ({
//               message: 'Token refresh failed and error response was not JSON.',
//             }));
//             console.error(
//               'ApiClient: Token refresh HTTP error:',
//               refreshResponse.status,
//               errorData,
//             );
//             authStore.logout();
//             throw new ApiError(
//               errorData.message || `Token refresh failed with status ${refreshResponse.status}`,
//               refreshResponse.status,
//               errorData,
//             );
//           }

//           const refreshedAuthData = (await refreshResponse.json()) as AuthResponseDto;
//           // Use the setAuthData from the auth store to ensure reactivity and localStorage updates
//           // refreshedAuthData.refreshToken will be string | undefined
//           authStore.setAuthData(refreshedAuthData);
//           console.log('ApiClient: Token refreshed successfully.');

//           this.tokenRefreshSubscribers.forEach((callback) =>
//             callback(refreshedAuthData.accessToken),
//           );
//           this.tokenRefreshSubscribers = [];
//           this.isRefreshingToken = false;
//           return this.request(endpoint, method, body, customHeaders, true);
//         } catch (refreshError: any) {
//           this.isRefreshingToken = false;
//           this.tokenRefreshSubscribers = [];
//           console.error('ApiClient: Error during token refresh process:', refreshError);
//           if (!(refreshError instanceof ApiError && refreshError.code === 401)) {
//             // If the error isn't a 401 from our own throw (meaning refresh token itself was invalid),
//             // or if some other error occurred, ensure logout.
//             authStore.logout();
//           }
//           throw refreshError;
//         }
//       } else {
//         return new Promise<T>((resolve, reject) => {
//           console.log('ApiClient: Queuing request while token is being refreshed.');
//           this.tokenRefreshSubscribers.push(() => {
//             // newAccessToken not directly used here, but good for debug
//             this.request<T>(endpoint, method, body, customHeaders, true)
//               .then(resolve)
//               .catch(reject);
//           });
//         });
//       }
//     }

//     if (!response.ok) {
//       const errorData: ApiErrorData = await response.json().catch(() => ({
//         message: `HTTP error ${response.status}: ${response.statusText}`,
//       }));
//       console.error(`ApiClient: API Error ${response.status} on ${method} ${endpoint}:`, errorData);
//       throw new ApiError(
//         errorData.message || `Request failed with status ${response.status}`,
//         response.status,
//         errorData,
//       );
//     }

//     if (response.status === 204) {
//       return undefined as unknown as T;
//     }
//     // const contentType = response.headers.get('content-type');
//     // if (contentType) {
//     return response.json() as Promise<T>;
//     // }
//     // return response.text() as unknown as Promise<T>; // Fallback for non-JSON responses
//   }

//   // --- Service Groups (ensure types match actual DTOs and Prisma models from @cashflow/types) ---
//   public auth = {
//     login: (payload: AuthCredentials): Promise<AuthResponseDto> =>
//       this.request<AuthResponseDto>('/auth/login', 'POST', payload),
//     register: (payload: SignUpPayload): Promise<AuthResponseDto> =>
//       this.request<AuthResponseDto>('/auth/register', 'POST', payload),
//     logout: (payload: RefreshTokenDto): Promise<void> =>
//       this.request<void>('/auth/logout', 'POST', payload),
//     getMe: (): Promise<UserWithProfile> =>
//       this.request<UserWithProfile>(NETWORK_CONFIG.LOGIN.ME, 'GET'),
//     signInWithGoogle: (payload: GoogleSignInDto): Promise<GoogleSignInResponse> =>
//       this.request<GoogleSignInResponse>('/auth/google', 'POST', payload),
//     verifyEmail: (token: string): Promise<void> =>
//       this.request<void>('/auth/verify-email', 'POST', { token }),
//     resendVerificationEmail: (): Promise<void> =>
//       this.request<void>('/auth/resend-verification-email', 'POST'),
//     forgotPassword: (email: string): Promise<void> =>
//       this.request<void>('/auth/forgot-password', 'POST', { email }),
//     resetPassword: (payload: { token: string; password_hash: string }): Promise<void> =>
//       this.request<void>('/auth/reset-password', 'POST', payload),
//   };

//   public users = {
//     getCurrentUser: (): Promise<UserWithProfile> =>
//       this.request<UserWithProfile>('/users/me', 'GET'),
//     updateCurrentUser: (payload: UpdateUserInput): Promise<UserWithProfile> =>
//       this.request<UserWithProfile>('/users/me', 'PUT', payload),
//     getUserProfileById: (userId: string): Promise<UserWithProfile> =>
//       this.request<UserWithProfile>(`/api/users/profile/${userId}`, 'GET'),
//     getMyReferrals: (): Promise<UserWithProfile[]> =>
//       this.request<UserWithProfile[]>('/users/referrals', 'GET'),
//     setReferrer: (payload: SetReferrerDto): Promise<void> =>
//       this.request<void>('/api/users/set-referrer', 'POST', payload),
//     getLeaderboard: (params?: {
//       page?: number;
//       limit?: number;
//     }): Promise<PaginatedResponse<UserWithProfile>> => {
//       const qParams: Record<string, string> = {};
//       if (params?.page !== undefined) qParams.page = String(params.page);
//       if (params?.limit !== undefined) qParams.limit = String(params.limit);
//       const queryString = new URLSearchParams(qParams).toString();
//       return this.request<PaginatedResponse<UserWithProfile>>(
//         `/users/leaderboard${queryString ? '?' + queryString : ''}`,
//         'GET',
//       );
//     },
//     updateCashtag: (cashtag: string): Promise<UserWithProfile> =>
//       this.request<UserWithProfile>('/api/user/cashtag', 'POST', { cashtag: cashtag }),
//     updateAvatar: (formData: FormData): Promise<UserWithProfile> =>
//       this.request<UserWithProfile>('/api/users/me/avatar', 'POST', formData),
//     changePassword: (payload: UpdatePasswordDto): Promise<void> =>
//       this.request<void>('/api/users/me/change-password', 'POST', payload),
//   };

//   public currency = {
//     getBalance: (): Promise<BalanceType[]> =>
//       this.request<BalanceType[]>('/currency/balance', 'GET'),
//     getTransactions: (params?: {
//       page?: number;
//       limit?: number;
//       type?: string;
//     }): Promise<PaginatedResponse<TransactionType>> => {
//       const qParams: Record<string, string> = {};
//       if (params?.page !== undefined) qParams.page = String(params.page);
//       if (params?.limit !== undefined) qParams.limit = String(params.limit);
//       if (params?.type !== undefined) qParams.type = params.type;
//       const queryString = new URLSearchParams(qParams).toString();
//       return this.request<PaginatedResponse<TransactionType>>(
//         `/currency/transactions${queryString ? '?' + queryString : ''}`,
//         'GET',
//       );
//     },
//     tipUser: (payload: TipUserDto): Promise<void> =>
//       this.request<void>('/currency/tip', 'POST', payload),
//   };

//   public deposit = {
//     getDepositMethods: (): Promise<any[]> => this.request<any[]>('/api/user/methods', 'GET'), // Replace 'any' with specific DepositMethodType if available
//     cancelPending: (): Promise<number> => this.request<number>('/api/user/cancelpending', 'POST'), // Replace 'any' with specific DepositMethodType if available
//     initializeDeposit: (payload: InitializeDepositDto): Promise<InitializeDepositResponseDto> =>
//       this.request<InitializeDepositResponseDto>('/api/user/depositsubmit', 'POST', payload),
//     getDepositStatus: (transactionId: string): Promise<TransactionType> =>
//       this.request<TransactionType>(`/api/user/status/${transactionId}`, 'GET'),
//     getProducts: (): Promise<Product[]> => this.request<Product[]>('/api/user/products', 'GET'),
//     getDepositHistory: (): Promise<DepositHistoryResponse> =>
//       this.request<DepositHistoryResponse>(`/api/user/deposithistory`, 'POST'),
//     getOperatorData: (): Promise<GetOperatorDataResponse> =>
//       this.request<GetOperatorDataResponse>(
//         '/api' + NETWORK_CONFIG.DEPOSIT_PAGE.OPERATOR_DATA,
//         'POST',
//       ),
//   };

//   public games = {
//     getAllGames: (params?: {
//       q?: string;
//       provider_id?: string;
//       category_id?: string;
//       page?: number;
//       limit?: number;
//       orderBy?: string;
//       orderDirection?: 'asc' | 'desc';
//     }): Promise<PaginatedResponse<GameType>> => {
//       const qParams: Record<string, string> = {};
//       if (params)
//         Object.entries(params).forEach(([key, value]) => {
//           if (value !== undefined) qParams[key] = String(value);
//         });
//       // const queryString = new URLSearchParams(qParams).toString();
//       return this.request<PaginatedResponse<GameType>>(
//         '/api' + `${NETWORK_CONFIG.GAME_INFO.GAME_SEARCH}`, //+ ?${queryString ? "?" + queryString : ""}`,
//         'GET',
//       );
//     },
//     getGameBigWins: (): Promise<GameBigWinData> =>
//       this.request<GameBigWinData>('/api' + NETWORK_CONFIG.GAME_INFO.GAME_BIGWIN, 'GET'),
//     getGameProviders: (): Promise<GameBigWinData> =>
//       this.request<GameBigWinData>('/api' + '/games/providers', 'GET'),
//     getGameCategories: (): Promise<GameCategoryType[]> =>
//       this.request<GameCategoryType[]>('/api' + '/games/categories', 'GET'),
//     getGameById: (gameId: string): Promise<GameType> =>
//       this.request<GameType>('/api' + `/games/${gameId}`, 'GET'),
//     launchGame: (gameId: string): Promise<LaunchGameResponseDto> =>
//       this.request<LaunchGameResponseDto>('/api' + `/games/${gameId}/launch`, 'POST'),
//     getGameHistory: (params?: {
//       page?: number;
//       limit?: number;
//     }): Promise<PaginatedResponse<GameHistoryEntryType>> => {
//       const qParams: Record<string, string> = {};
//       if (params?.page !== undefined) qParams.page = String(params.page);
//       if (params?.limit !== undefined) qParams.limit = String(params.limit);
//       const queryString = new URLSearchParams(qParams).toString();
//       return this.request<PaginatedResponse<GameHistoryEntryType>>(
//         '/api' + `/games/history${queryString ? '?' + queryString : ''}`,
//         'GET',
//       );
//     },
//   };

//   public vip = {
//     getVipStatus: (): Promise<UserVipStatus> =>
//       this.request<UserVipStatus>('/api' + NETWORK_CONFIG.VIP_INFO.USER_VIP_LEVEL, 'GET'),
//     getVipBenefits: (): Promise<VipBenefitType[]> =>
//       this.request<VipBenefitType[]>(
//         '/api' + NETWORK_CONFIG.VIP_INFO.USER_VIP_LEVELAWARD_LIST,
//         'GET',
//       ),
//     getVipInfo: (): Promise<VipInfo> =>
//       this.request<VipInfo>('/api' + NETWORK_CONFIG.VIP_INFO.USER_VIP_INFO, 'GET'),
//     claimVipReward: (payload: ClientClaimVipRewardPayload): Promise<void> =>
//       this.request<void>('/api' + '/vip/claim-reward', 'POST', payload),
//   };

//   public health = {
//     check: (): Promise<{
//       status: string;
//       timestamp: string;
//       version?: string;
//     }> => this.request<{ status: string; timestamp: string; version?: string }>('/health', 'GET'),
//   };
// }

// // --- Singleton Instance ---
// let apiClientInstance: ApiClient | null = null;
// export function initializeApiClient(): ApiClient {
//   if (!apiClientInstance) {
//     apiClientInstance = new ApiClient();
//     console.log('ApiClient initialized.');
//   }
//   return apiClientInstance;
// }
// export function getApiClient(): ApiClient {
//   if (!apiClientInstance) {
//     // console.warn("ApiClient was not explicitly initialized. Initializing now. Consider calling initializeApiClient() in your app's entry point (e.g., main.ts).");
//     return initializeApiClient(); // Auto-initialize if not done.
//   }
//   return apiClientInstance;
// }
