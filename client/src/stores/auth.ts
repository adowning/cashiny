// apps/client/src/stores/auth.ts
import { computed, ref, watch } from 'vue';

import { router } from '@/router';
// Or @repo/types
import type {
  AuthCredentials,
  AuthResponseDto,
  GoogleSignInDto, // For logout payload
  RefreshTokenDto,
  SignUpPayload,
} from '@cashflow/types';
import { defineStore } from 'pinia';

// Assuming these are exported from apiClient or defined in types

const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

interface AuthErrorState {
  message: string;
  code?: number | string;
}

export const useAuthStore = defineStore('auth', () => {
  const api = useApiClient();
  const accessToken = ref<string | null>(localStorage.getItem(TOKEN_KEY) || null);
  const refreshToken = ref<string | undefined>(
    localStorage.getItem(REFRESH_TOKEN_KEY) || undefined,
  ); // Changed to string | undefined
  const currentUser = ref<UserType | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<AuthErrorState | null>(null);
  const initialAuthCheckComplete = ref<boolean>(false);

  const isAuthenticated = computed(() => !!accessToken.value && !!currentUser.value);

  // This action is crucial for updating auth state, including after token refresh by apiClient
  function setAuthData(data: AuthResponseDto) {
    console.log('AuthStore: Setting auth data', data);
    accessToken.value = data.accessToken;
    refreshToken.value = data.refreshToken; // data.refreshToken is string | undefined
    currentUser.value = data;
    if (currentUser?.value.avatar === null) currentUser.value.avatar = 'avatar-10.webp';
    error.value = null; // Clear previous errors on successful auth data set

    localStorage.setItem(TOKEN_KEY, data.accessToken);
    if (data.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }

  function clearAuthData() {
    console.log('AuthStore: Clearing auth data');
    accessToken.value = null;
    refreshToken.value = undefined; // Set to undefined
    currentUser.value = null;
    // Do not clear 'error' here, let the action that calls clearAuthData decide if error should persist
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
  async function refreshUser() {
    try {
      const api = useApiClient();
      const _user = await api.auth.getMe(); // This might trigger token refresh in apiClient
      // If getMe is successful (either directly or after refresh),
      // the apiClient's refresh logic would have already called setAuthData.
      // So, we just need to ensure currentUser is correctly set if not already by refresh.
      const user = _user.user;
      console.log(user);
      if (currentUser.value?.id !== user?.id) {
        // Check if user data needs updating locally
        currentUser.value = user;
        if (currentUser.value?.avatar == undefined) currentUser.value.avatar = 'avatar-12.webp';
      }
      console.log('AuthStore: User successfully authenticated via initializeAuth.');
    } catch (e: any) {
      console.warn(
        'AuthStore: Token verification or refresh failed during initializeAuth.',
        e.message,
      );
    }
  }
  async function initializeAuth() {
    console.log('AuthStore: Initializing authentication...');
    isLoading.value = true;
    initialAuthCheckComplete.value = false;
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedRefreshTokenItem = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (storedToken) {
      accessToken.value = storedToken;
      refreshToken.value = storedRefreshTokenItem === null ? undefined : storedRefreshTokenItem; // Ensure it's string | undefined
      try {
        const _user = await api.auth.getMe(); // This might trigger token refresh in apiClient
        // If getMe is successful (either directly or after refresh),
        // the apiClient's refresh logic would have already called setAuthData.
        // So, we just need to ensure currentUser is correctly set if not already by refresh.
        const user = _user;
        console.log(user);
        if (currentUser.value?.id !== user?.id) {
          // Check if user data needs updating locally
          currentUser.value = user;
          if (currentUser.value?.avatar == undefined) currentUser.value.avatar = 'avatar-12.webp';
        }
        console.log('AuthStore: User successfully authenticated via initializeAuth.');
      } catch (e: any) {
        console.warn(
          'AuthStore: Token verification or refresh failed during initializeAuth.',
          e.message,
        );
        // ApiClient's request handler would have attempted refresh.
        // If it still fails (e.g. refresh token invalid), logout should have been called by ApiClient.
        // We ensure clearAuthData is called if state is inconsistent.
        if (e.name === 'ApiError' && e.code === 401) {
          // Already handled by apiClient's logout on final failure usually.
          // If not, clearAuthData here is a safeguard.
          clearAuthData();
        } else if (!refreshToken.value && accessToken.value) {
          // Has access token but no refresh token, and getMe failed not due to 401 (e.g. network error)
          // This state is ambiguous, for safety clear auth.
          clearAuthData();
        }
        error.value = {
          message: e.message || 'Session initialization failed',
          code: e.code,
        };
      }
    } else {
      console.log('AuthStore: No stored token found during initializeAuth.');
      clearAuthData();
    }
    isLoading.value = false;
    initialAuthCheckComplete.value = true;
  }

  async function signInWithPassword(payload: AuthCredentials) {
    isLoading.value = true;
    error.value = null;
    try {
      const responseData = await api.auth.login(payload);
      setAuthData(responseData);
      return { success: true, data: responseData };
    } catch (e: any) {
      console.error('AuthStore: Sign-in failed', e);
      error.value = { message: e.message || 'Sign-in failed', code: e.code };
      clearAuthData(); // Clear partial auth data on failure
      return { success: false, error: e as ApiError };
    } finally {
      isLoading.value = false;
    }
  }

  async function signUpNewUser(payload: SignUpPayload) {
    isLoading.value = true;
    error.value = null;
    try {
      const responseData = await api.auth.register(payload);
      setAuthData(responseData);
      return { success: true, data: responseData };
    } catch (e: any) {
      console.error('AuthStore: Sign-up failed', e);
      error.value = { message: e.message || 'Sign-up failed', code: e.code };
      clearAuthData();
      return { success: false, error: e as ApiError };
    } finally {
      isLoading.value = false;
    }
  }

  async function signInWithGoogleIdToken(idToken: string) {
    isLoading.value = true;
    error.value = null;
    try {
      const googleSignInPayload: GoogleSignInDto = { idToken };
      const responseData = await api.auth.signInWithGoogle(googleSignInPayload); // Cast to GoogleSignInResponse
      // console.log(typeof responseData);
      // console.log(Object.keys(responseData));
      // const j = JSON.parse(JSON.parse(responseData));
      // console.log(j);
      // console.log(j["accessToken"]);
      // console.log(j.authenticated);
      console.log(responseData);
      setAuthData({
        accessToken: responseData.accessToken,
        refreshToken: responseData.refreshToken,
        // user: responseData.user,
      });
      return { success: true, data: responseData };
    } catch (e: any) {
      console.error('AuthStore: Google Sign-in failed', e);
      error.value = {
        message: e.message || 'Google Sign-in failed',
        code: e.code,
      };
      clearAuthData();
      return { success: false, error: e as ApiError };
    } finally {
      isLoading.value = false;
    }
  }

  async function logout() {
    isLoading.value = true;
    const currentRefreshToken = refreshToken.value; // Capture before clearing
    try {
      if (currentRefreshToken) {
        await api.auth.logout({
          refreshToken: currentRefreshToken,
        } as RefreshTokenDto);
      }
    } catch (e: any) {
      console.warn(
        'AuthStore: Logout API call failed (token might have been invalid or already expired):',
        e.message,
      );
    } finally {
      clearAuthData();
      isLoading.value = false;
      error.value = null; // Clear any errors on logout
      console.log('AuthStore: User logged out.');
      router.push('/login');
    }
  }

  function setStoreError(newError: AuthErrorState | null) {
    error.value = newError;
  }
  function clearAuthError() {
    error.value = null;
  }

  // Watchers for localStorage sync (optional, as setAuthData/clearAuthData handle it)
  watch(accessToken, (newToken) => {
    if (newToken) localStorage.setItem(TOKEN_KEY, newToken);
    else localStorage.removeItem(TOKEN_KEY);
  });
  watch(refreshToken, (newRefreshToken) => {
    // newRefreshToken is string | undefined
    if (newRefreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
    else localStorage.removeItem(REFRESH_TOKEN_KEY);
  });

  return {
    accessToken,
    refreshToken,
    currentUser,
    isLoading,
    refreshUser,
    error,
    initialAuthCheckComplete,
    isAuthenticated,
    initializeAuth,
    signInWithPassword,
    signUpNewUser,
    signInWithGoogleIdToken,
    logout,
    setAuthData, // Important to expose for apiClient's token refresh
    clearAuthData,
    setError: setStoreError,
    clearAuthError,
  };
});
