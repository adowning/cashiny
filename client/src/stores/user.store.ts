import { type Ref, ref } from 'vue'

// import { UserWithProfile } from '@cashflow/database';
import type {
  PaginatedResponse,
  SetReferrerDto,
  UpdateUserInput,
  UserWithProfile,
} from '@cashflow/types'

import { useAuthStore } from './auth.store'

// Define a generic state for API actions
interface ApiActionState<T = null> {
  isLoading: Ref<boolean>
  error: Ref<Error | null>
  data: Ref<T>
}

// Define the UserStore state interface
export interface UserState {
  profileUpdate: ApiActionState<UserWithProfile>
  cashtagUpdate: ApiActionState<UserWithProfile>
  passwordChange: ApiActionState<void>
  avatarUpdate: ApiActionState<UserWithProfile>
  setReferrer: ApiActionState<void>
  referrals: ApiActionState<UserWithProfile[] | null>
  leaderboard: ApiActionState<PaginatedResponse<Partial<UserWithProfile>> | null>
}

// Define the UserStore actions interface
export interface UserActions {
  updateUserProfile: (
    payload: UpdateUserInput
  ) => Promise<{ success: boolean; user?: UserWithProfile; error?: any }>
  changePassword: (payload: any) => Promise<{ success: boolean; error?: any }>
  updateUserAvatar: (
    formData: FormData
  ) => Promise<{ success: boolean; user?: UserWithProfile; error?: any }>
  setReferrerCode: (payload: SetReferrerDto) => Promise<{ success: boolean; error?: any }>
  fetchMyReferrals: () => Promise<{ success: boolean; data?: UserWithProfile[]; error?: any }>
  fetchLeaderboard: (
    page?: number,
    limit?: number
  ) => Promise<{ success: boolean; data?: PaginatedResponse<UserWithProfile>; error?: any }>
  dispatchUserCashtag: (
    cashtag: string
  ) => Promise<UserWithProfile | { success: false; error: any } | undefined>
  clearActionError: (errorType: keyof UserState) => void
}

// Define the UserStore interface
export interface UserStore extends UserState, UserActions {}

export const useUserStore = defineStore('user', () => {
  const authStore = useAuthStore()
  const api = useApiClient()

  // Refactored state using the generic ApiActionState
  const profileUpdate = ref<ApiActionState<UserWithProfile | null>>({
    isLoading: ref(false),
    error: ref(null),
    data: ref(null),
  })
  const cashtagUpdate = ref<ApiActionState<UserWithProfile | null>>({
    isLoading: ref(false),
    error: ref(null),
    data: ref(null),
  })
  const passwordChange = ref<ApiActionState<void>>({
    isLoading: ref(false),
    error: ref(null),
    data: ref(undefined),
  })
  const avatarUpdate = ref<ApiActionState<UserWithProfile | null>>({
    isLoading: ref(false),
    error: ref(null),
    data: ref(null),
  })
  const setReferrer = ref<ApiActionState<void>>({
    isLoading: ref(false),
    error: ref(null),
    data: ref(undefined),
  })
  const referrals = ref<ApiActionState<UserWithProfile[] | null>>({
    isLoading: ref(false),
    error: ref(null),
    data: ref(null),
  })
  const leaderboard = ref<ApiActionState<PaginatedResponse<UserWithProfile> | null>>({
    isLoading: ref(false),
    error: ref(null),
    data: ref(null),
  })

  async function updateUserProfile(payload: UpdateUserInput) {
    profileUpdate.value.isLoading = true
    profileUpdate.value.error = null
    try {
      const updatedUser = await api.users.updateCurrentUser(payload)
      profileUpdate.value.data = updatedUser
      if (authStore.accessToken) {
        authStore.setAuthData({
          accessToken: authStore.accessToken,
          refreshToken: authStore.refreshToken,
          user: updatedUser,
        })
      }
      return { success: true, user: updatedUser }
    } catch (e: any) {
      console.error('UserStore: Failed to update profile', e)
      profileUpdate.value.error = normalizeError(e)
      return { success: false, error: profileUpdate.value.error }
    } finally {
      profileUpdate.value.isLoading = false
    }
  }

  async function changePassword(payload: any) {
    passwordChange.value.isLoading = true
    passwordChange.value.error = null
    try {
      await api.users.changePassword(payload)
      return { success: true }
    } catch (e: any) {
      console.error('UserStore: Failed to change password', e)
      passwordChange.value.error = normalizeError(e)
      return { success: false, error: passwordChange.value.error }
    } finally {
      passwordChange.value.isLoading = false
    }
  }

  async function updateUserAvatar(
    formData: FormData
  ): Promise<{ success: boolean; user?: UserWithProfile; error?: Error }> {
    avatarUpdate.value.isLoading = true
    avatarUpdate.value.error = null
    try {
      const updatedUserWithNewAvatar = await api.users.updateAvatar(formData)
      avatarUpdate.value.data = updatedUserWithNewAvatar
      if (authStore.accessToken) {
        authStore.setAuthData({
          accessToken: authStore.accessToken,
          refreshToken: authStore.refreshToken,
          user: updatedUserWithNewAvatar as unknown as UserWithProfile,
        })
      }
      return {
        success: true,
        user: updatedUserWithNewAvatar as UserWithProfile,
      }
    } catch (e: unknown) {
      console.error('UserStore: Failed to update avatar', e)
      const error = normalizeError(e)
      avatarUpdate.value.error = error
      return { success: false, error }
    } finally {
      avatarUpdate.value.isLoading = false
    }
  }

  async function setReferrerCode(payload: SetReferrerDto) {
    setReferrer.value.isLoading = true
    setReferrer.value.error = null
    try {
      await api.users.setReferrer(payload)
      return { success: true }
    } catch (e: any) {
      console.error('UserStore: Failed to set referrer', e)
      setReferrer.value.error = normalizeError(e)
      return { success: false, error: setReferrer.value.error }
    } finally {
      setReferrer.value.isLoading = false
    }
  }

  async function fetchMyReferrals() {
    referrals.value.isLoading = true
    referrals.value.error = null
    try {
      const referralData = await api.users.getMyReferrals()
      referrals.value.data = referralData
      return { success: true, data: referralData }
    } catch (e: any) {
      console.error('UserStore: Failed to fetch referrals', e)
      referrals.value.error = normalizeError(e)
      referrals.value.data = null
      return { success: false, error: referrals.value.error }
    } finally {
      referrals.value.isLoading = false
    }
  }

  async function fetchLeaderboard(page: number = 1, limit: number = 10) {
    leaderboard.value.isLoading = true
    leaderboard.value.error = null
    try {
      const data = await api.users.getLeaderboard({ page, limit })
      leaderboard.value.data = data
      return { success: true, data }
    } catch (e: any) {
      console.error('UserStore: Failed to fetch leaderboard', e)
      leaderboard.value.error = normalizeError(e)
      leaderboard.value.data = null
      return { success: false, error: leaderboard.value.error }
    } finally {
      leaderboard.value.isLoading = false
    }
  }

  const dispatchUserCashtag = async (
    cashtag: string
  ): Promise<UserWithProfile | { success: false; error: any } | undefined> => {
    cashtagUpdate.value.isLoading = true
    cashtagUpdate.value.error = null
    try {
      const updatedUserWithNewCashtag = await api.users.updateCashtag(cashtag)
      cashtagUpdate.value.data = updatedUserWithNewCashtag
      return updatedUserWithNewCashtag
    } catch (e: any) {
      console.error('UserStore: Failed to update cashtag', e)
      cashtagUpdate.value.error = normalizeError(e)
      return { success: false, error: cashtagUpdate.value.error }
    } finally {
      cashtagUpdate.value.isLoading = false
    }
  }

  function clearActionError(this: UserStore, errorType: keyof UserState) {
    this[errorType].error.value = null
  }

  // Helper function to normalize errors
  // function convertUserWithProfileToUserWithProfile(user: UserWithProfile): UserWithProfile {
  //   return {
  //     ...user,
  //     profile: user.profile
  //       ? {
  //           id: user.profile.id,
  //           role: user.profile.role,
  //           createdAt: user.profile.createdAt,
  //           updatedAt: user.profile.updatedAt,
  //           balance: user.profile.balance,
  //           totalXpFromOperator: user.profile.totalXpFromOperator,
  //           activeCurrencyType: user.profile.activeCurrencyType,
  //           currentGameSessionid: user.profile.currentGameSessionid,
  //           userId: user.profile.userId,
  //           otherUserid: user.profile.otherUserid,
  //           operatorAccessId: user.profile.operatorAccessId,
  //         }
  //       : null,
  //   };
  // }

  function normalizeError(e: any): Error {
    return e instanceof Error
      ? ({
          message: e.message,
          ...((e as any).code && { code: (e as any).code }),
          ...((e as any).data && { details: (e as any).data }),
        } as Error)
      : {
          message: 'Unknown error',
          name: e.code,
        }
  }

  return {
    profileUpdate: profileUpdate.value,
    cashtagUpdate: cashtagUpdate.value,
    passwordChange: passwordChange.value,
    avatarUpdate: avatarUpdate.value,
    setReferrer: setReferrer.value,
    referrals: referrals.value,
    leaderboard: leaderboard.value,
    updateUserProfile,
    changePassword,
    updateUserAvatar,
    setReferrerCode,
    fetchMyReferrals,
    fetchLeaderboard,
    dispatchUserCashtag,
    clearActionError,
  }
})
