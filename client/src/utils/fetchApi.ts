import { useAuthStore } from "@/stores/auth";
import { useUserStore } from "@/stores/user";
import { ApiAuthError } from "@cashflow/types";
import { logToPage } from "./logger";

export async function fetchApi(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const authStore = useAuthStore();
  const useStore = useUserStore();
  authStore.setLoading(true);
  authStore.setError(null);
  console.log(endpoint);
  const completeUrl = endpoint.startsWith("http") ? endpoint : `${endpoint}`; // Assuming /api prefix for Hono
  logToPage(
    "debug",
    `WorkspaceApi: Calling ${options.method || "GET"} ${completeUrl}`
  );

  try {
    const token = authStore.session?.token;
    const headers = new Headers(options.headers || {});
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    if (
      !options.body ||
      (options.body && !(options.body instanceof FormData))
    ) {
      if (!headers.has("Content-Type"))
        headers.set("Content-Type", "application/json");
    }
    options.method = "POST";
    const response = await fetch(completeUrl, { ...options, headers });

    if (!response.ok) {
      let errorData: ApiAuthError = {
        message: `HTTP error! Status: ${response.status} ${response.statusText}`,
        code: response.status,
      };
      try {
        const jsonError = await response.json();
        errorData = { ...errorData, ...jsonError }; // Merge server error message if available
      } catch (e) {
        /* Ignore if response is not JSON */
      }
      logToPage("error", `WorkspaceApi: Error on ${completeUrl}:`, errorData);
      authStore.setError(errorData);
      throw errorData;
    }

    if (response.status === 204) {
      // No Content
      logToPage(
        "debug",
        `WorkspaceApi: Received 204 No Content from ${completeUrl}`
      );
      return null;
    }
    const data = await response.json();
    logToPage("debug", `WorkspaceApi: Received data from ${completeUrl}`);
    return data;
  } catch (e: any) {
    logToPage(
      "error",
      `WorkspaceApi: Exception during call to ${completeUrl}:`,
      e
    );
    // Ensure error in store is an ApiAuthError
    if (e.message && e.code) {
      authStore.setError(e as ApiAuthError);
    } else {
      authStore.setError({
        message: e.message || "Network or unexpected error during API call",
      });
    }
    throw e; // Re-throw for the calling function to handle
  } finally {
    authStore.setLoading(false);
  }
}
