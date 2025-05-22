import { useAuthStore, useAuthStoreOutside } from '../stores/auth.store'
import { useUserStore, type UserData } from '../stores/user.store'
import { useProfileStore, type ProfileData } from '../stores/profile'
import { ApiAuthError } from '@cashflow/types'
import { logToPage } from './logger'

class ApiFetch {
  private authStore = useAuthStoreOutside()

  async fetch(endpoint: string, options: RequestInit = {}): Promise<any> {
    this.authStore.setLoading(true)
    this.authStore.setError(null)
    const completeUrl = endpoint.startsWith('http')
      ? endpoint
      : `${process.env.HONO_API_BASE_URL}${endpoint}` // Assuming /api prefix for Hono
    logToPage('debug', `WorkspaceApi: Calling ${options.method || 'GET'} ${completeUrl}`)

    try {
      const token = this.authStore.session?.token
      const headers = new Headers(options.headers || {})
      if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      if (!options.body || (options.body && !(options.body instanceof FormData))) {
        if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
      }

      const response = await fetch(completeUrl, { ...options, headers })

      if (!response.ok) {
        let errorData: ApiAuthError = {
          message: `HTTP error! Status: ${response.status} ${response.statusText}`,
          code: response.status,
        }
        try {
          const jsonError = await response.json()
          errorData = { ...errorData, ...jsonError } // Merge server error message if available
        } catch (e) {
          /* Ignore if response is not JSON */
        }
        logToPage('error', `WorkspaceApi: Error on ${completeUrl}:`, errorData)
        this.authStore.setError(errorData)
        throw errorData
      }

      if (response.status === 204) {
        // No Content
        logToPage('debug', `WorkspaceApi: Received 204 No Content from ${completeUrl}`)
        return null
      }
      const data = await response.json()
      logToPage('debug', `WorkspaceApi: Received data from ${completeUrl}`)
      return data
    } catch (e: any) {
      logToPage('error', `WorkspaceApi: Exception during call to ${completeUrl}:`, e)
      // Ensure error in store is an ApiAuthError
      if (e.message && e.code) {
        this.authStore.setError(e as ApiAuthError)
      } else {
        this.authStore.setError({
          message: e.message || 'Network or unexpected error during API call',
        })
      }
      throw e // Re-throw for the calling function to handle
    } finally {
      this.authStore.setLoading(false)
    }
  }
}
// const _fetchApi = new ApiFetch();

// export const fetchApi = _fetchApi.fetch.bind(_fetchApi);
