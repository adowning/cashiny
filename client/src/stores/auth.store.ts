// apps/client/src/stores/auth.ts
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useRouter } from 'vue-router' // Import useRouter if not globally available
import type {
  AuthCredentials,
  AuthResponseDto,
  GoogleSignInDto,
  RefreshTokenDto, // Used for logout payload type
  SignUpPayload,
  UserWithProfile,
} from '@cashflow/types'

// It's good practice to define these keys centrally if they are used elsewhere,
// but for a store, keeping them here is fine too.
const DEFAULT_AVATAR_FALLBACK = 'avatar-default.webp' // Example default

interface AuthErrorState {
  message: string
  error: string | null
  code?: number | string // HTTP status code or custom error code
  details?: any // Optional additional error details
}

export const useAuthStore = defineStore(
  'auth',
  () => {
    const router = useRouter() // Initialize router instance
    const api = useApiClient()

    // --- State ---
    // These will be automatically hydrated from localStorage if pinia-plugin-persistedstate is configured
    // to persist these specific refs.
    const accessToken = ref<string | null>(null)
    const refreshToken = ref<string | null>(null) // Consistent with accessToken (string | null)
    const currentUser = ref<UserWithProfile | null>(null)

    const isLoading = ref<boolean>(false) // For UI feedback during auth operations
    const isSignUpMode = ref<boolean>(false) // For UI feedback during auth operations
    const error = ref<AuthErrorState | null>(null) // Stores the last auth-related error
    const initialAuthCheckComplete = ref<boolean>(false) // Tracks if the initial auth check has run
    const authModalType = ref<string | null>(null)
    const authDialogVisible = ref<boolean>(false)

    // --- Getters ---
    const isAuthenticated = computed(() => !!accessToken.value && !!currentUser.value)
    const userAvatar = computed(() => currentUser.value?.image || DEFAULT_AVATAR_FALLBACK)

    function toggleSignUp() {
      isSignUpMode.value = !isSignUpMode.value
    }
    // --- Actions ---

    /**
     * Sets the authentication data in the store and persists tokens.
     * This function is critical and should be the single source of truth for updating auth state.
     * It's also typically called by the apiClient after a successful token refresh.
     */
    function setAuthData(data: AuthResponseDto) {
      accessToken.value = data.accessToken
      refreshToken.value = data.refreshToken || null // Ensure null if undefined/empty
      currentUser.value = data.user ? { ...data.user } : null // Store a copy
      error.value = null // Clear previous errors on successful auth data set

      // localStorage management is handled by pinia-plugin-persistedstate
      // if configured for these refs. Manual calls are removed.
    }

    /**
     * Clears authentication data from the store and persisted storage.
     */
    function clearAuthData() {
      accessToken.value = null
      refreshToken.value = null
      currentUser.value = null
      // Consider if 'error' should be cleared here. Usually, logout clears errors.
      // Specific action failures might leave the error for the UI to display.

      // localStorage removal is handled by pinia-plugin-persistedstate
    }

    /**
     * Attempts to initialize authentication state, typically on application startup.
     * It checks for existing tokens and validates them by fetching the user profile.
     */
    async function initializeAuth() {
      if (initialAuthCheckComplete.value && isAuthenticated.value) {
        // Already initialized and authenticated, no need to re-run unless forced.
        // Potentially add a force flag if needed.
        return
      }

      isLoading.value = true // Should be set at the start of the attempt
      initialAuthCheckComplete.value = false // Reset if re-initializing

      // pinia-plugin-persistedstate should have already loaded tokens into accessToken and refreshToken refs.
      if (accessToken.value) {
        try {
          // apiClient.auth.getMe() should ideally handle transparent token refresh.
          // If getMe() succeeds, it means the token is valid or was refreshed.
          // The apiClient's interceptor should call `setAuthData` upon successful refresh.
          const response = await api.auth.getMe() // Fetches user, implicitly validates/refreshes token

          // If apiClient's refresh logic correctly calls setAuthData,
          // currentUser and tokens would already be updated.
          // This is more of a reconciliation if getMe returns data slightly different
          // from what setAuthData received from login/refresh.
          if (response.user) {
            currentUser.value = { ...response.user }
          } else if (!isAuthenticated.value) {
            // This case implies getMe succeeded (2xx) but returned no user,
            // AND the store isn't marked as authenticated (which is odd).
            // This might indicate an issue with the getMe response or apiClient's refresh flow.
            // For safety, if not authenticated after getMe, clear.
            console.warn(
              'AuthStore: getMe succeeded but no user data returned and not authenticated. Clearing auth.'
            )
            await logoutUser(false) // Don't navigate, just clear state
          }
        } catch (e: any) {
          // If api.auth.getMe() fails (e.g., 401 after refresh attempt, network error),
          // the apiClient's error handler or interceptor should ideally trigger logout.
          console.warn('AuthStore: Initialization - getMe failed.', e.message)
          // No need to call clearAuthData() here if the apiClient's global error handler / interceptor
          // calls logoutUser() on unrecoverable auth errors (like final 401).
          // If it doesn't, then: await logoutUser(false);
          error.value = {
            message: e.message || 'Session validation failed.',
            code: e.code,
            details: e.details,
          }
        }
      } else {
        // No access token found by the persistence plugin. User is not logged in.
        // Ensure state is clean, though persistence plugin should handle initial nulls.
        clearAuthData()
      }
      isLoading.value = false
      initialAuthCheckComplete.value = true
    }

    /**
     * Fetches the current user's profile. Assumes tokens are already handled.
     * Useful for explicit user data refresh without full re-initialization.
     */
    async function fetchCurrentUser() {
      if (!isAuthenticated.value) {
        // No point fetching if not authenticated
        return
      }
      isLoading.value = true
      try {
        const response = await api.auth.getMe()
        if (response.user) {
          currentUser.value = { ...response.user }
        }
        error.value = null
      } catch (e: any) {
        console.error('AuthStore: Failed to fetch current user', e)
        error.value = {
          message: e.message || 'Failed to refresh user data.',
          code: e.code,
          details: e.details,
        }
        // Potentially logout if this implies token invalidity not caught by apiClient
        if (e.code === 401) {
          await logoutUser(false) // Don't navigate, just clear state
        }
      } finally {
        isLoading.value = false
      }
    }

    async function handleAuthAction<T extends (...args: any[]) => Promise<AuthResponseDto>>(
      action: T,
      ...args: Parameters<T>
    ): Promise<{ success: boolean; data?: AuthResponseDto; error?: ApiError | AuthErrorState }> {
      const notificationStore = useNotificationStore()

      isLoading.value = true
      error.value = null
      try {
        const responseData = await action(...args)
        if (responseData.error !== null) {
          const errPayload: AuthErrorState = {
            message: responseData.error || `Action ${action.name} failed`,
            code: responseData.error,
            // details: responseData.error,
            error: responseData.error,
          }
          error.value = errPayload
          console.log(errPayload)

          console.log('error')
          // No need to call clearAuthData here on every auth action failure.
          // Only clear if the failure implies total invalidation of any prior state (e.g. bad creds on login).
          // For instance, if a token refresh fails within an action, apiClient should handle logout.
          // If it's a form validation type error from backend, user might still be "logged in".
          notificationStore.addNotification('error', errPayload.message)
          return { success: false, error: errPayload }
        }

        console.log(responseData)
        setAuthData(responseData)
        return { success: true, data: responseData }
      } catch (e: any) {
        console.error(`AuthStore: Action ${action.name} failed`, e)
        const errPayload: AuthErrorState = {
          message: e.error || `Action ${action.name} failed`,
          code: e.error,
          // details: responseData.error,
          error: e.error,
        }
        error.value = errPayload
        // No need to call clearAuthData here on every auth action failure.
        // Only clear if the failure implies total invalidation of any prior state (e.g. bad creds on login).
        // For instance, if a token refresh fails within an action, apiClient should handle logout.
        // If it's a form validation type error from backend, user might still be "logged in".
        return { success: false, error: e as ApiError | AuthErrorState } // Return structured error
      } finally {
        isLoading.value = false
      }
    }

    function signInWithPassword(payload: AuthCredentials) {
      return handleAuthAction(api.auth.login, payload)
    }

    function signUpNewUser(payload: SignUpPayload) {
      return handleAuthAction(api.auth.register, payload)
    }

    async function signInWithGoogleIdToken(idToken: string) {
      // Google Sign-In might have a slightly different response structure initially,
      // ensure api.auth.signInWithGoogle standardizes it or adapt here.
      // The original code had `responseData.accessToken` etc., implying it does.
      isLoading.value = true
      error.value = null
      try {
        const googleSignInPayload: GoogleSignInDto = { idToken }
        const responseData = await api.auth.signInWithGoogle(googleSignInPayload)
        setAuthData(responseData) // Assuming signInWithGoogle returns AuthResponseDto
        return { success: true, data: responseData }
      } catch (e: any) {
        console.error('AuthStore: Google Sign-in failed', e)
        error.value = {
          message: e.message || 'Google Sign-in failed',
          code: e.code,
          details: e.details,
        }
        // clearAuthData(); // Potentially, if Google Sign-In implies no prior valid session
        return { success: false, error: e as ApiError | AuthErrorState }
      } finally {
        isLoading.value = false
      }
    }

    async function logoutUser(navigate = true) {
      // Renamed to logoutUser to avoid conflict with Vue's internal logout name if this were a component.
      isLoading.value = true // Set loading state for logout process
      const tokenToInvalidate = refreshToken.value

      // Clear local auth data immediately
      clearAuthData()

      try {
        if (tokenToInvalidate) {
          await api.auth.logout({ refreshToken: tokenToInvalidate } as RefreshTokenDto)
        }
      } catch (e: any) {
        // Log API error but don't let it stop the local logout process.
        // The token might have already been invalid on the server.
        console.warn('AuthStore: Server-side logout call failed:', e.message)
      } finally {
        isLoading.value = false
        error.value = null // Clear any auth errors on logout
        initialAuthCheckComplete.value = true // Logout means the auth check is "complete" - user is not auth'd

        if (navigate) {
          router.push('/login') // Or your desired logout destination
        }
      }
    }

    // Manual error management if needed from outside
    function setAuthError(newError: AuthErrorState | null) {
      error.value = newError
    }
    function clearAuthError() {
      error.value = null
    }
    function setAuthModalType(type: string | null) {
      authModalType.value = type
    }
    function setAuthDialogVisible(visible: boolean) {
      authDialogVisible.value = visible
    }

    // Watchers for localStorage are removed as pinia-plugin-persistedstate should handle this.
    // If persist:true is not using a plugin, then the watchers are needed,
    // but it's highly recommended to use the plugin.

    return {
      // State
      accessToken,
      refreshToken,
      currentUser,
      isLoading,
      error,
      initialAuthCheckComplete,
      authDialogVisible,
      // Getters
      isAuthenticated,
      userAvatar,

      // Actions
      initializeAuth, // Renamed for clarity
      fetchCurrentUser, // Renamed from refreshUser
      signInWithPassword,
      signUpNewUser,
      signInWithGoogleIdToken,
      logout: logoutUser, // Expose as 'logout'
      setAuthData, // Crucial for apiClient integration
      clearAuthData, // Useful for apiClient or manual reset
      setAuthError,
      clearAuthError,
      setAuthModalType,
      setAuthDialogVisible,
      isSignUpMode,
      toggleSignUp,
    }
  },
  {
    // Configuration for pinia-plugin-persistedstate
    // This tells the plugin to persist these specific state properties.
    persist: {
      storage: localStorage, // or `sessionStorage` if you prefer
      // Use 'paths' only if your pinia-plugin-persistedstate version supports it.
      // If not, remove 'paths' and persist the whole store or upgrade the plugin.
      // For most recent versions, use 'paths' as below:
      pick: ['accessToken', 'refreshToken', 'currentUser'],
      // If you get a type error, remove the 'paths' property:
    },
  }
)

// Helper type for external use if needed (though ApiError from types is better)
// export type { AuthErrorState, ApiError };
