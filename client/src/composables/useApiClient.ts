import { readonly, ref } from 'vue';

import { useAuthStore } from '@/stores/auth';
// Import existing types
import {
  type ApiErrorData,
  type AuthCredentials,
  type AuthResponseDto,
  type BalanceType,
  type ClientClaimVipRewardPayload,
  DepositHistoryResponse,
  GameBigWinData,
  type GameCategory as GameCategoryType,
  type GameRound as GameHistoryEntryType,
  type Game as GameType,
  GetAchievementItem,
  GetAchievementResponse,
  GetBonusList,
  GetOperatorDataResponse,
  GetPromoListResponse,
  GetBonusResponse as GetRewardBonusResponse, // Renaming to avoid conflict if GetBonusResponse is used elsewhere
  GetRewardCenterList,
  GetRewardCenterListResponse,
  GetUserBonusResponse,
  type GoogleSignInDto,
  type GoogleSignInResponse,
  type InitializeDepositDto,
  type InitializeDepositResponseDto,
  type LaunchGameResponseDto,
  NETWORK_CONFIG,
  type PaginatedResponse,
  type Product,
  PromoGroupData,
  type RefreshTokenDto,
  type SetReferrerDto,
  type SignUpPayload,
  type TipUserDto,
  type Transaction as TransactionType,
  type UpdatePasswordDto,
  type UpdateUserInput,
  type UserVipStatus,
  UserWithProfile,
  type VipBenefit as VipBenefitType,
  VipInfo,
} from '@cashflow/types';

//

// --- Configuration ---
var BASE_URL = import.meta.env.VITE_API_BASE_URL + '/api' || '/api'; // Fallback to /api if not set

// --- ApiError Class ---

export class ApiError extends Error {
  public code: number | string | undefined;
  public data: ApiErrorData;
  constructor(message: string, code?: number | string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.data = data || { message };
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

// --- Response Wrapper Type (assuming backend wraps data) ---
// If your backend consistently wraps responses like { code, data, message }
// you might want a generic type for unwrapping it.
// For now, I'll assume the 'request' function returns the 'data' part directly
// based on the existing structure and how Pinia stores expect it.
// If GetAchievementResponse is { code, data: GetAchievementItem, message },
// then request<GetAchievementItem> is what the Pinia store would want.
// The current server implementation for createSuccessResponse returns { code, data, message }

interface BackendResponse<D> {
  code: number;
  data: D;
  message: string;
}

// --- ApiClient Composable ---
function useApiClient() {
  const isRefreshingToken = ref(false);
  const tokenRefreshSubscribers = ref<Array<(newAccessToken: string) => void>>([]);

  const request = async <TResponseData = any>( // TResponseData is the type of the 'data' field in backend response
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    body?: unknown,
    customHeaders?: HeadersInit,
    isRetry = false
  ): Promise<TResponseData> => {
    const authStore = useAuthStore();
    const token = authStore.accessToken;
    // if (endpoint.includes('/auth')) {
    console.log(`${endpoint}`);
    console.log(BASE_URL);
    if (endpoint.startsWith('/auth')) {
      BASE_URL = BASE_URL.replace('/api', '');
    } else {
      if (!BASE_URL.includes('/api')) BASE_URL = BASE_URL + '/api';
    }
    // }
    console.log(BASE_URL);
    const headers: Record<string, string> = {
      ...(customHeaders as Record<string, string>),
    };

    if (!(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = { method, headers };
    if (body !== undefined) {
      // Ensure body is only added if it exists
      if (body instanceof FormData) {
        config.body = body;
        delete headers['Content-Type']; // Browser sets this for FormData
      } else {
        config.body = JSON.stringify(body);
      }
    }
    console.log(BASE_URL);
    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    if (response.status === 401 && !isRetry) {
      if (!isRefreshingToken.value) {
        isRefreshingToken.value = true;
        try {
          console.log('ApiClient: Attempting to refresh token...');
          const refreshTokenValue = authStore.refreshToken;
          if (!refreshTokenValue) {
            authStore.logout();
            throw new ApiError(
              'Unauthorized: No refresh token available for refresh attempt.',
              response.status, // Use original response status
              await response.json().catch(() => ({ message: 'No refresh token' }))
            );
          }

          const refreshPayload: RefreshTokenDto = {
            refreshToken: refreshTokenValue,
          };
          // Assuming /auth/refresh-token is the correct endpoint from your auth.route.ts
          const refreshResponse = await fetch(`${BASE_URL}${NETWORK_CONFIG.LOGIN.REFRESH_TOKEN}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(refreshPayload),
          });

          if (!refreshResponse.ok) {
            const errorData = await refreshResponse.json().catch(() => ({
              message: 'Token refresh failed and error response was not JSON.',
            }));
            console.error(
              'ApiClient: Token refresh HTTP error:',
              refreshResponse.status,
              errorData
            );
            authStore.logout(); // Logout on refresh failure
            throw new ApiError(
              errorData.message || `Token refresh failed with status ${refreshResponse.status}`,
              refreshResponse.status,
              errorData
            );
          }

          const refreshedAuthData = (await refreshResponse.json()) as AuthResponseDto; // Assuming this is { accessToken, refreshToken, user }
          authStore.setAuthData(refreshedAuthData);
          console.log('ApiClient: Token refreshed successfully.');

          tokenRefreshSubscribers.value.forEach((callback) =>
            callback(refreshedAuthData.accessToken)
          );
          tokenRefreshSubscribers.value = [];
          isRefreshingToken.value = false;
          // Retry the original request with the new token
          return request<TResponseData>(endpoint, method, body, customHeaders, true);
        } catch (refreshError: any) {
          isRefreshingToken.value = false;
          tokenRefreshSubscribers.value = [];
          console.error('ApiClient: Error during token refresh process:', refreshError);
          // Only logout if the refresh error itself isn't another 401 (to avoid loops if /refresh-token itself returns 401 repeatedly)
          if (!(refreshError instanceof ApiError && refreshError.code === 401)) {
            authStore.logout();
          }
          throw refreshError; // Re-throw the error that occurred during refresh
        }
      } else {
        // Queue the request until the token is refreshed
        return new Promise<TResponseData>((resolve, reject) => {
          console.log('ApiClient: Queuing request while token is being refreshed.');
          tokenRefreshSubscribers.value.push((newAccessToken: string) => {
            // Clone headers and update Authorization for the retried request
            const newHeaders = { ...headers, Authorization: `Bearer ${newAccessToken}` };
            request<TResponseData>(endpoint, method, body, newHeaders, true)
              .then(resolve)
              .catch(reject);
          });
        });
      }
    }

    if (response.status === 204) {
      // Handle No Content
      return undefined as unknown as TResponseData;
    }

    const responseBody = await response.json().catch(() => {
      // Handle cases where response is not JSON but still an error (e.g., HTML error page from proxy)
      console.error(
        `ApiClient: Non-JSON response for ${method} ${endpoint} with status ${response.status}`
      );
      throw new ApiError(
        `Request failed with status ${response.status} and non-JSON response.`,
        response.status,
        { message: response.statusText }
      );
    });

    if (!response.ok) {
      // responseBody here is already parsed JSON (ApiErrorData or BackendResponse with error structure)
      console.error(
        `ApiClient: API Error ${response.status} on ${method} ${endpoint}:`,
        responseBody
      );
      throw new ApiError(
        responseBody.message || `Request failed with status ${response.status}`,
        responseBody.code || response.status, // Prefer code from body if available
        responseBody.errors || responseBody.data || responseBody // Include additional error details
      );
    }

    // Assuming successful responses are wrapped in { code, data, message }
    // and we want to return the 'data' part.
    if (responseBody && typeof responseBody === 'object' && 'data' in responseBody) {
      return responseBody.data as TResponseData;
    }
    // If it's not wrapped, return the whole body (for cases like /auth/login which might return AuthResponseDto directly)
    return responseBody as TResponseData;
  };

  // --- Service Groups ---
  const auth = {
    login: (payload: AuthCredentials): Promise<AuthResponseDto> =>
      request<AuthResponseDto>(NETWORK_CONFIG.LOGIN.LOGIN, 'POST', payload), // Assuming NETWORK_CONFIG.LOGIN.LOGIN exists
    register: (payload: SignUpPayload): Promise<AuthResponseDto> =>
      request<AuthResponseDto>(NETWORK_CONFIG.LOGIN.REGISTER, 'POST', payload), // Assuming NETWORK_CONFIG.LOGIN.REGISTER exists
    logout: (payload: RefreshTokenDto): Promise<void> =>
      request<void>(NETWORK_CONFIG.LOGIN.LOGOUT, 'POST', payload), // Assuming NETWORK_CONFIG.LOGIN.LOGOUT exists
    getMe: (): Promise<UserWithProfile> => request<UserWithProfile>(NETWORK_CONFIG.LOGIN.ME, 'GET'),
    refreshToken: (
      payload: RefreshTokenDto
    ): Promise<AuthResponseDto> => // Added for completeness
      request<AuthResponseDto>(NETWORK_CONFIG.LOGIN.REFRESH_TOKEN, 'POST', payload),
    signInWithGoogle: (
      payload: GoogleSignInDto
    ): Promise<GoogleSignInResponse> => // Ensure path is correct
      request<GoogleSignInResponse>(NETWORK_CONFIG.LOGIN.GOOGLE, 'POST', payload), // Assuming NETWORK_CONFIG.LOGIN.GOOGLE_SIGNIN
    // verifyEmail: (token: string): Promise<void> =>
    //   request<void>(NETWORK_CONFIG.LOGIN.VERIFY_EMAIL, 'POST', { token }), // Ensure path is correct // Assuming NETWORK_CONFIG.LOGIN.VERIFY_EMAIL
    // resendVerificationEmail: (): Promise<void> => // Ensure path is correct
    //   request<void>(NETWORK_CONFIG.LOGIN.RESEND_VERIFY_EMAIL, 'POST'), // Assuming NETWORK_CONFIG.LOGIN.RESEND_VERIFY_EMAIL
    // forgotPassword: (email: string): Promise<void> =>
    //   request<void>(NETWORK_CONFIG.LOGIN.FORGOT_PASSWORD, 'POST', { email }), // Ensure path is correct // Assuming NETWORK_CONFIG.LOGIN.FORGOT_PASSWORD
    // resetPassword: (payload: { token: string; password_hash: string }): Promise<void> =>
    //   request<void>(NETWORK_CONFIG.LOGIN.RESET_PASSWORD, 'POST', payload), // Ensure path is correct // Assuming NETWORK_CONFIG.LOGIN.RESET_PASSWORD
  };

  const users = {
    getCurrentUser: (): Promise<UserWithProfile> =>
      request<UserWithProfile>(NETWORK_CONFIG.PERSONAL_INFO_PAGE.USER_INFO, 'GET'), // Adjusted to match existing user.route.ts structure if needed, or /users/me
    updateCurrentUser: (payload: UpdateUserInput): Promise<UserWithProfile> =>
      request<UserWithProfile>(NETWORK_CONFIG.PERSONAL_INFO_PAGE.USER_CHANGE, 'POST', payload), // Assuming POST based on user.route.ts which uses GET for updateUserInfo, adjust if it's PUT
    getUserProfileById: (
      userId: string
    ): Promise<UserWithProfile> => // This seems like an admin/public endpoint
      request<UserWithProfile>(`/users/profile/${userId}`, 'GET'), // Using provided path, ensure it's prefixed with BASE_PATH on server
    getMyReferrals: (): Promise<UserWithProfile[]> =>
      request<UserWithProfile[]>(NETWORK_CONFIG.INVITE_PAGE.INVITE_HISTORY, 'GET'), // Assuming NETWORK_CONFIG.INVITE_PAGE.INVITE_LIST
    setReferrer: (payload: SetReferrerDto): Promise<void> =>
      request<void>(NETWORK_CONFIG.INVITE_PAGE.SET_REFERRER, 'POST', payload), // Assuming NETWORK_CONFIG.INVITE_PAGE.SET_REFERRER
    getLeaderboard: (params?: {
      page?: number;
      limit?: number;
    }): Promise<PaginatedResponse<UserWithProfile>> => {
      const qParams: Record<string, string> = {};
      if (params?.page !== undefined) qParams.page = String(params.page);
      if (params?.limit !== undefined) qParams.limit = String(params.limit);
      const queryString = new URLSearchParams(qParams).toString();
      // Assuming NETWORK_CONFIG.LEADERBOARD_PAGE.LIST
      return request<PaginatedResponse<UserWithProfile>>(
        `${NETWORK_CONFIG.LEADERBOARD_PAGE.LIST}${queryString ? '?' + queryString : ''}`,
        'GET'
      );
    },
    updateCashtag: (cashtag: string): Promise<UserWithProfile> =>
      request<UserWithProfile>(NETWORK_CONFIG.PERSONAL_INFO_PAGE.USER_CASHTAG, 'POST', { cashtag }),
    updateAvatar: (
      formData: FormData
    ): Promise<UserWithProfile> => // This endpoint might need specific server setup
      request<UserWithProfile>(
        `${NETWORK_CONFIG.PERSONAL_INFO_PAGE.USER_CHANGE}/avatar`,
        'POST',
        formData
      ), // Example path, adjust
    changePassword: (payload: UpdatePasswordDto): Promise<void> =>
      request<void>(NETWORK_CONFIG.PERSONAL_INFO_PAGE.USER_PASSWORD, 'POST', payload), // Assuming POST, user.route.ts uses GET, adjust
  };

  const currency = {
    getBalance: (): Promise<BalanceType[]> =>
      request<BalanceType[]>(NETWORK_CONFIG.CURRENCY_PAGE.USER_BALANCE_LIST, 'GET'), // Assuming NETWORK_CONFIG.CURRENCY_PAGE.USER_BALANCE_LIST
    getTransactions: (params?: {
      page?: number;
      limit?: number;
      type?: string; // 'deposit', 'withdrawal', 'tip', 'game_win', 'bonus' etc.
    }): Promise<PaginatedResponse<TransactionType>> => {
      const qParams: Record<string, string> = {};
      if (params?.page !== undefined) qParams.page = String(params.page);
      if (params?.limit !== undefined) qParams.limit = String(params.limit);
      if (params?.type !== undefined) qParams.type = params.type;
      const queryString = new URLSearchParams(qParams).toString();
      // Assuming NETWORK_CONFIG.TRANSACTION_PAGE.LIST or similar
      return request<PaginatedResponse<TransactionType>>(
        `${NETWORK_CONFIG.TRANSACTION_PAGE.TRANSACTION_HISTORY}${queryString ? '?' + queryString : ''}`,
        'GET'
      );
    },
    tipUser: (payload: TipUserDto): Promise<void> =>
      request<void>(NETWORK_CONFIG.CURRENCY_PAGE.USER_TIP, 'POST', payload), // Assuming NETWORK_CONFIG.CURRENCY_PAGE.USER_TIP
  };

  const deposit = {
    // Paths from existing SDK, ensure they match NETWORK_CONFIG or update
    getDepositMethods: (): Promise<any[]> =>
      request<any[]>(NETWORK_CONFIG.DEPOSIT_PAGE.CONFIG, 'GET'),
    cancelPending: (): Promise<number> =>
      request<number>(NETWORK_CONFIG.DEPOSIT_PAGE.CANCEL_PENDING, 'POST'), // Assuming
    initializeDeposit: (payload: InitializeDepositDto): Promise<InitializeDepositResponseDto> =>
      request<InitializeDepositResponseDto>(NETWORK_CONFIG.DEPOSIT_PAGE.SUBMIT, 'POST', payload),
    getDepositStatus: (
      transactionId: string
    ): Promise<TransactionType> => // This might be part of general transactions now
      request<TransactionType>(`${NETWORK_CONFIG.TRANSACTION_PAGE.DETAIL}/${transactionId}`, 'GET'), // Assuming
    getProducts: (): Promise<Product[]> =>
      request<Product[]>(NETWORK_CONFIG.DEPOSIT_PAGE.PRODUCTS, 'GET'), // Assuming
    getDepositHistory: (): Promise<DepositHistoryResponse> => // Or use currency.getTransactions({ type: 'deposit' })
      request<DepositHistoryResponse>(NETWORK_CONFIG.DEPOSIT_PAGE.HISTORY, 'POST'), // POST seems odd for GET history
    getOperatorData: (): Promise<GetOperatorDataResponse> =>
      request<GetOperatorDataResponse>(NETWORK_CONFIG.DEPOSIT_PAGE.OPERATOR_DATA, 'POST'), // POST seems odd for GET data
  };

  const games = {
    getAllGames: (params?: {
      q?: string;
      provider_id?: string;
      category_id?: string;
      page?: number;
      limit?: number;
      orderBy?: string;
      orderDirection?: 'asc' | 'desc';
    }): Promise<PaginatedResponse<GameType>> => {
      const qParams: Record<string, string> = {};
      if (params)
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) qParams[key] = String(value);
        });
      const queryString = new URLSearchParams(qParams).toString();
      return request<PaginatedResponse<GameType>>(
        `${NETWORK_CONFIG.GAME_INFO.GAME_SEARCH}${queryString ? '?' + queryString : ''}`, // Ensure this is a GET endpoint
        'GET'
      );
    },
    getGameBigWins: (): Promise<GameBigWinData> => // This type seems incorrect for big wins, usually an array of wins
      request<GameBigWinData>(NETWORK_CONFIG.GAME_INFO.GAME_BIGWIN, 'GET'),
    getGameProviders: (): Promise<any[]> => // GameBigWinData was likely a placeholder
      request<any[]>(NETWORK_CONFIG.GAME_INFO.PROVIDERS, 'GET'), // Assuming GAME_PROVIDER_LIST
    getGameCategories: (): Promise<GameCategoryType[]> =>
      request<GameCategoryType[]>(NETWORK_CONFIG.GAME_INFO.GAME_CATEGORY, 'GET'), // Assuming GAME_TYPE_LIST
    getGameById: (gameId: string): Promise<GameType> =>
      request<GameType>(`${NETWORK_CONFIG.GAME_INFO.GAME_DETAIL}/${gameId}`, 'GET'), // Assuming GAME_DETAIL and path param
    launchGame: (gameId: string): Promise<LaunchGameResponseDto> =>
      request<LaunchGameResponseDto>(`${NETWORK_CONFIG.GAME_INFO.GAME_ENTER}/${gameId}`, 'POST'), // Assuming GAME_LAUNCH and path param
    getGameHistory: (params?: {
      page?: number;
      limit?: number;
    }): Promise<PaginatedResponse<GameHistoryEntryType>> => {
      const qParams: Record<string, string> = {};
      if (params?.page !== undefined) qParams.page = String(params.page);
      if (params?.limit !== undefined) qParams.limit = String(params.limit);
      const queryString = new URLSearchParams(qParams).toString();
      return request<PaginatedResponse<GameHistoryEntryType>>(
        `${NETWORK_CONFIG.GAME_INFO.GAME_HISTORY}${queryString ? '?' + queryString : ''}`, // Ensure this is GET
        'GET'
      );
    },
  };

  const vip = {
    getVipStatus: (): Promise<UserVipStatus> =>
      request<UserVipStatus>(NETWORK_CONFIG.VIP_INFO.USER_VIP_LEVEL, 'GET'),
    getVipBenefits: (): Promise<VipBenefitType[]> =>
      request<VipBenefitType[]>(NETWORK_CONFIG.VIP_INFO.USER_VIP_LEVELAWARD_LIST, 'GET'),
    getVipInfo: (): Promise<VipInfo> =>
      request<VipInfo>(NETWORK_CONFIG.VIP_INFO.USER_VIP_INFO, 'GET'),
    claimVipReward: (
      payload: ClientClaimVipRewardPayload
    ): Promise<void> => // Ensure path is correct
      request<void>(NETWORK_CONFIG.VIP_INFO.VIP_LEVEL_AWARD_HISTORY, 'POST', payload), // Assuming USER_VIP_LEVEL_AWARD_GAIN
  };

  // --- New Service Groups ---

  const achievement = {
    /** Corresponds to dispatchAchievementList in Pinia store */
    getAchievementList: (): Promise<GetAchievementItem> =>
      request<GetAchievementItem>(NETWORK_CONFIG.ACHIEVEMENT_ROUTES.ACHIEVEMENT_LIST, 'GET'),
    /** Corresponds to dispatchAchievementConfig in Pinia store */
    getAchievementConfig: (): Promise<GetAchievementItem> =>
      request<GetAchievementItem>(NETWORK_CONFIG.ACHIEVEMENT_ROUTES.ACHIEVEMENT_CONFIG, 'GET'),
    /** Corresponds to dispatchStageAward in Pinia store */
    claimStageAward: (payload: {
      awardId: string | number;
    }): Promise<{ message: string }> => // Assuming payload and simple message response
      request<{ message: string }>(NETWORK_CONFIG.ACHIEVEMENT_ROUTES.STAGE_AWARD, 'POST', payload),
    /** Corresponds to dispatchAchievementAward in Pinia store */
    claimAchievementAward: (payload: {
      achievementId: string | number;
    }): Promise<{ message: string }> =>
      request<{ message: string }>(
        NETWORK_CONFIG.ACHIEVEMENT_ROUTES.ACHIEVEMENT_AWARD,
        'POST',
        payload
      ),
  };

  const bonus = {
    /** Corresponds to dispatchUserBonus in Pinia store */
    getUserBonusList: (): Promise<GetBonusList> =>
      request<GetBonusList>(NETWORK_CONFIG.BONUS_PAGE.USER_BONUS, 'GET'),
    /** Corresponds to dispatchBonusCancel in Pinia store */
    cancelBonus: (payload: {
      bonusId: string | number;
    }): Promise<{ message: string }> => // Assuming payload and simple message response
      request<{ message: string }>(NETWORK_CONFIG.BONUS_PAGE.BONUS_CANCEL, 'POST', payload),
  };

  const reward = {
    /** Corresponds to dispatchRewardList in Pinia store */
    getRewardCenterList: (): Promise<GetRewardCenterList> =>
      request<GetRewardCenterList>(NETWORK_CONFIG.REWARD_ROUTES.REWARD_LIST, 'GET'),
    /** Corresponds to dispatchReceiveAchievementBonus in Pinia store */
    receiveAchievementBonus: (): Promise<any> => // Type from GetBonusResponse was 'any', adjust if specific structure known
      request<any>(NETWORK_CONFIG.REWARD_ROUTES.RECIEVE_ACHIV_BONUS, 'POST'),
  };

  const promo = {
    /** Corresponds to dispatchUserActivityList in Pinia store */
    getUserActivityList: (): Promise<PromoGroupData> =>
      request<PromoGroupData>(NETWORK_CONFIG.ACTIVITY.USER_ACTIVITY_LIST, 'GET'),
  };

  const health = {
    check: (): Promise<{
      status: string;
      timestamp: string;
      version?: string;
    }> =>
      request<{ status: string; timestamp: string; version?: string }>(
        NETWORK_CONFIG.HOME_PAGE.HEALTH,
        'GET'
      ), // Assuming NETWORK_CONFIG.HEALTH.HEALTH
  };

  return {
    isRefreshingToken: readonly(isRefreshingToken),
    // tokenRefreshSubscribers: readonly(tokenRefreshSubscribers), // Usually not exposed
    request, // Expose for generic calls if needed, though usually prefer specific methods
    auth,
    users,
    currency,
    deposit,
    games,
    vip,
    achievement, // New
    bonus, // New
    reward, // New
    promo, // New
    health,
  };
}

export default useApiClient;
// import { readonly, ref } from 'vue';

// import { useAuthStore } from '@/stores/auth';
// // import { UserWithProfile } from '@cashflow/database';
// import {
//   type ApiErrorData,
//   type AuthCredentials,
//   type AuthResponseDto,
//   type BalanceType,
//   type ClientClaimVipRewardPayload,
//   DepositHistoryResponse,
//   GameBigWinData,
//   type GameCategory as GameCategoryType,
//   type GameRound as GameHistoryEntryType,
//   type Game as GameType,
//   GetOperatorDataResponse,
//   type GoogleSignInDto,
//   type GoogleSignInResponse,
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
//   type UpdateUserInput,
//   type UserVipStatus,
//   UserWithProfile,
//   type VipBenefit as VipBenefitType,
//   VipInfo,
// } from '@cashflow/types';

// // --- Configuration ---
// const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// // --- ApiError Class ---

// export class ApiError extends Error {
//   public code: number | string | undefined;
//   public data: ApiErrorData;
//   constructor(message: string, code?: number | string, data?: any) {
//     super(message);
//     this.name = 'ApiError';
//     this.code = code;
//     this.data = data || { message };
//     if (Error.captureStackTrace) {
//       Error.captureStackTrace(this, ApiError);
//     }
//   }
// }

// // --- ApiClient Composable ---
// function useApiClient() {
//   const isRefreshingToken = ref(false);
//   const tokenRefreshSubscribers = ref<Array<(newAccessToken: string) => void>>([]);

//   const request = async <T = any>(
//     endpoint: string,
//     method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
//     body?: unknown,
//     customHeaders?: HeadersInit,
//     isRetry = false,
//   ): Promise<T> => {
//     const authStore = useAuthStore();
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
//         delete headers['Content-Type'];
//       } else {
//         config.body = JSON.stringify(body);
//       }
//     }

//     const response = await fetch(`${BASE_URL}${endpoint}`, config);

//     if (response.status === 401 && !isRetry) {
//       if (!isRefreshingToken.value) {
//         isRefreshingToken.value = true;
//         try {
//           console.log('ApiClient: Attempting to refresh token...');
//           const refreshTokenValue = authStore.refreshToken;
//           if (!refreshTokenValue) {
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
//           authStore.setAuthData(refreshedAuthData);
//           console.log('ApiClient: Token refreshed successfully.');

//           tokenRefreshSubscribers.value.forEach((callback) =>
//             callback(refreshedAuthData.accessToken),
//           );
//           tokenRefreshSubscribers.value = [];
//           isRefreshingToken.value = false;
//           return request<T>(endpoint, method, body, customHeaders, true);
//         } catch (refreshError: any) {
//           isRefreshingToken.value = false;
//           tokenRefreshSubscribers.value = [];
//           console.error('ApiClient: Error during token refresh process:', refreshError);
//           if (!(refreshError instanceof ApiError && refreshError.code === 401)) {
//             authStore.logout();
//           }
//           throw refreshError;
//         }
//       } else {
//         return new Promise<T>((resolve, reject) => {
//           console.log('ApiClient: Queuing request while token is being refreshed.');
//           tokenRefreshSubscribers.value.push(() => {
//             request<T>(endpoint, method, body, customHeaders, true).then(resolve).catch(reject);
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

//     return response.json() as Promise<T>;
//   };

//   // --- Service Groups ---
//   const auth = {
//     login: (payload: AuthCredentials): Promise<AuthResponseDto> =>
//       request<AuthResponseDto>('/auth/login', 'POST', payload),
//     register: (payload: SignUpPayload): Promise<AuthResponseDto> =>
//       request<AuthResponseDto>('/auth/register', 'POST', payload),
//     logout: (payload: RefreshTokenDto): Promise<void> =>
//       request<void>('/auth/logout', 'POST', payload),
//     getMe: (): Promise<UserWithProfile> => request<UserWithProfile>(NETWORK_CONFIG.LOGIN.ME, 'GET'),
//     signInWithGoogle: (payload: GoogleSignInDto): Promise<GoogleSignInResponse> =>
//       request<GoogleSignInResponse>('/auth/google', 'POST', payload),
//     verifyEmail: (token: string): Promise<void> =>
//       request<void>('/auth/verify-email', 'POST', { token }),
//     resendVerificationEmail: (): Promise<void> =>
//       request<void>('/auth/resend-verification-email', 'POST'),
//     forgotPassword: (email: string): Promise<void> =>
//       request<void>('/auth/forgot-password', 'POST', { email }),
//     resetPassword: (payload: { token: string; password_hash: string }): Promise<void> =>
//       request<void>('/auth/reset-password', 'POST', payload),
//   };

//   const users = {
//     getCurrentUser: (): Promise<UserWithProfile> => request<UserWithProfile>('/users/me', 'GET'),
//     updateCurrentUser: (payload: UpdateUserInput): Promise<UserWithProfile> =>
//       request<UserWithProfile>('/users/me', 'PUT', payload),
//     getUserProfileById: (userId: string): Promise<UserWithProfile> =>
//       request<UserWithProfile>(`/api/users/profile/${userId}`, 'GET'),
//     getMyReferrals: (): Promise<UserWithProfile[]> =>
//       request<UserWithProfile[]>('/users/referrals', 'GET'),
//     setReferrer: (payload: SetReferrerDto): Promise<void> =>
//       request<void>('/api/users/set-referrer', 'POST', payload),
//     getLeaderboard: (params?: {
//       page?: number;
//       limit?: number;
//     }): Promise<PaginatedResponse<UserWithProfile>> => {
//       const qParams: Record<string, string> = {};
//       if (params?.page !== undefined) qParams.page = String(params.page);
//       if (params?.limit !== undefined) qParams.limit = String(params.limit);
//       const queryString = new URLSearchParams(qParams).toString();
//       return request<PaginatedResponse<UserWithProfile>>(
//         `/users/leaderboard${queryString ? '?' + queryString : ''}`,
//         'GET',
//       );
//     },
//     updateCashtag: (cashtag: string): Promise<UserWithProfile> =>
//       request<UserWithProfile>('/api/user/cashtag', 'POST', { cashtag: cashtag }),
//     updateAvatar: (formData: FormData): Promise<UserWithProfile> =>
//       request<UserWithProfile>('/api/users/me/avatar', 'POST', formData),
//     changePassword: (payload: UpdatePasswordDto): Promise<void> =>
//       request<void>('/api/users/me/change-password', 'POST', payload),
//   };

//   const currency = {
//     getBalance: (): Promise<BalanceType[]> => request<BalanceType[]>('/currency/balance', 'GET'),
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
//       return request<PaginatedResponse<TransactionType>>(
//         `/currency/transactions${queryString ? '?' + queryString : ''}`,
//         'GET',
//       );
//     },
//     tipUser: (payload: TipUserDto): Promise<void> =>
//       request<void>('/currency/tip', 'POST', payload),
//   };

//   const deposit = {
//     getDepositMethods: (): Promise<any[]> => request<any[]>('/api/user/methods', 'GET'),
//     cancelPending: (): Promise<number> => request<number>('/api/user/cancelpending', 'POST'),
//     initializeDeposit: (payload: InitializeDepositDto): Promise<InitializeDepositResponseDto> =>
//       request<InitializeDepositResponseDto>('/api/user/depositsubmit', 'POST', payload),
//     getDepositStatus: (transactionId: string): Promise<TransactionType> =>
//       request<TransactionType>(`/api/user/status/${transactionId}`, 'GET'),
//     getProducts: (): Promise<Product[]> => request<Product[]>('/api/user/products', 'GET'),
//     getDepositHistory: (): Promise<DepositHistoryResponse> =>
//       request<DepositHistoryResponse>(`/api/user/deposithistory`, 'POST'),
//     getOperatorData: (): Promise<GetOperatorDataResponse> =>
//       request<GetOperatorDataResponse>('/api' + NETWORK_CONFIG.DEPOSIT_PAGE.OPERATOR_DATA, 'POST'),
//   };

//   const games = {
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
//       return request<PaginatedResponse<GameType>>(
//         '/api' + `${NETWORK_CONFIG.GAME_INFO.GAME_SEARCH}`,
//         'GET',
//       );
//     },
//     getGameBigWins: (): Promise<GameBigWinData> =>
//       request<GameBigWinData>('/api' + NETWORK_CONFIG.GAME_INFO.GAME_BIGWIN, 'GET'),
//     getGameProviders: (): Promise<GameBigWinData> =>
//       request<GameBigWinData>('/api' + '/games/providers', 'GET'),
//     getGameCategories: (): Promise<GameCategoryType[]> =>
//       request<GameCategoryType[]>('/api' + '/games/categories', 'GET'),
//     getGameById: (gameId: string): Promise<GameType> =>
//       request<GameType>('/api' + `/games/${gameId}`, 'GET'),
//     launchGame: (gameId: string): Promise<LaunchGameResponseDto> =>
//       request<LaunchGameResponseDto>('/api' + `/games/${gameId}/launch`, 'POST'),
//     getGameHistory: (params?: {
//       page?: number;
//       limit?: number;
//     }): Promise<PaginatedResponse<GameHistoryEntryType>> => {
//       const qParams: Record<string, string> = {};
//       if (params?.page !== undefined) qParams.page = String(params.page);
//       if (params?.limit !== undefined) qParams.limit = String(params.limit);
//       const queryString = new URLSearchParams(qParams).toString();
//       return request<PaginatedResponse<GameHistoryEntryType>>(
//         '/api' + `/games/history${queryString ? '?' + queryString : ''}`,
//         'GET',
//       );
//     },
//   };

//   const vip = {
//     getVipStatus: (): Promise<UserVipStatus> =>
//       request<UserVipStatus>('/api' + NETWORK_CONFIG.VIP_INFO.USER_VIP_LEVEL, 'GET'),
//     getVipBenefits: (): Promise<VipBenefitType[]> =>
//       request<VipBenefitType[]>('/api' + NETWORK_CONFIG.VIP_INFO.USER_VIP_LEVELAWARD_LIST, 'GET'),
//     getVipInfo: (): Promise<VipInfo> =>
//       request<VipInfo>('/api' + NETWORK_CONFIG.VIP_INFO.USER_VIP_INFO, 'GET'),
//     claimVipReward: (payload: ClientClaimVipRewardPayload): Promise<void> =>
//       request<void>('/api' + '/vip/claim-reward', 'POST', payload),
//   };

//   const health = {
//     check: (): Promise<{
//       status: string;
//       timestamp: string;
//       version?: string;
//     }> => request<{ status: string; timestamp: string; version?: string }>('/health', 'GET'),
//   };

//   return {
//     isRefreshingToken: readonly(isRefreshingToken),
//     tokenRefreshSubscribers: readonly(tokenRefreshSubscribers),
//     request,
//     auth,
//     users,
//     currency,
//     deposit,
//     games,
//     vip,
//     health,
//   };
// }

// export default useApiClient;
