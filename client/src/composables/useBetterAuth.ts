// // apps/client/src/composables/useBetterAuth.ts
// import { onMounted, onUnmounted, computed, watch } from "vue";
// import { useAuthStore } from "../stores/auth";
// import { useUserStore, type UserData } from "../stores/user";
// import { useProfileStore, type ProfileData } from "../stores/profile";
// import { useCashflowSocket } from "./useCashflowSocket"; // Renamed from useZilaWebsocket
// import type {
//   ClientSession,
//   ClientAuthUser, // Assuming this type exists in @cashflow/types for the user object within the session
//   ApiAuthError, // Assuming this type for API error responses
//   AuthCredentials, // Assuming { email: string, password?: string }
//   SignUpPayload,
//   User, // Assuming extends AuthCredentials with other fields like username
// } from "@cashflow/types"; // Make sure these types are correctly defined and exported
// import { WSStatus } from "@/utils/wsClient";

// // --- Configuration ---
// // Base URL for your Hono API (without /api at the end if endpoints include it)
// const HONO_API_BASE_URL =
//   import.meta.env.VITE_HONO_API_BASE_URL || "http://localhost:8787";
// // Base URL for your WebSocket server (e.g., ws://localhost:8787)
// const HONO_WEBSOCKET_BASE_URL =
//   import.meta.env.VITE_HONO_WEBSOCKET_URL || "ws://localhost:8787";
// const HONO_WEBSOCKET_PATH = "/ws"; // The path for the WebSocket endpoint on your Hono server

// // WebSocket Event Identifiers for Authentication
// // These should ideally come from @cashflow/types if shared with the server
// export const AUTH_EVENT_IDENTIFIERS = {
//   STATE_CHANGE: "auth:state_change", // Server sends this when auth state (login/logout/session update) changes
//   USER_UPDATED: "auth:user_updated", // Server sends this when the ClientAuthUser details change
//   PROFILE_UPDATED: "auth:profile_updated", // Server sends this when ProfileData changes
// } as const;

// // Module-level counter for shared WebSocket listener management
// let activeComposableInstances = 0;
// const listenerUnsubscribeCallbacks: (() => void)[] = [];

// // Dummy logToPage for environments where it's not globally available (like this composable file itself)
// // The actual test script (browser-test-client.ts) will provide a real implementation.
// function logToPage(level: string, ...args: any[]) {
//   const c = console as any;
//   if (typeof c[level] === "function") {
//     c[level](`[${level.toUpperCase()}] useBetterAuth:`, ...args);
//   } else {
//     console.log(`[${level.toUpperCase()}] useBetterAuth:`, ...args);
//   }
// }

// export function useBetterAuth() {
//   activeComposableInstances++;
//   logToPage(
//     "debug",
//     `Instance created. Active instances: ${activeComposableInstances}`
//   );

//   const authStore = useAuthStore();
//   const userStore = useUserStore();
//   const profileStore = useProfileStore();

//   const {
//     connectOrReconnect: connectWebSocketToUrl,
//     disconnectWebSocket,
//     onMessage: onWebSocketMessage,
//     // postMessage: postWebSocketMessage, // Not directly used by auth flow itself but available
//     // requestResponse: requestWebSocketResponse,
//     connectionStatus: webSocketStatus,
//     isConnected: isWebSocketConnected,
//     websocketError,
//   } = useCashflowSocket(); // Does not take URL here anymore if using connectOrReconnect

//   // --- Reactive State & Getters ---
//   const session = computed(() => authStore.session as ClientSession | null);
//   const isAuthenticated = computed(() => !!authStore.session?.user);
//   const isLoading = computed(() => authStore.isLoading); // isLoading specific to auth operations
//   const authError = computed(() => authStore.error as ApiAuthError | null);
//   const currentUser = computed(() => userStore.currentUser as UserData | null);
//   const currentProfile = computed(
//     () => profileStore.currentProfile as ProfileData | null
//   );
//   const initialAuthCheckComplete = computed(
//     () => authStore.initialAuthCheckComplete
//   );

//   // --- Helper: Construct WebSocket URL with Token ---
//   function getWebSocketUrlWithToken(token?: string | null): string {
//     let url = `${HONO_WEBSOCKET_BASE_URL}${HONO_WEBSOCKET_PATH}`;
//     if (token) {
//       url += `?token=${encodeURIComponent(token)}`;
//     }
//     return url;
//   }

//   // --- WebSocket Connection Management ---
//   async function establishWebSocketConnection() {
//     const token = authStore.session?.token; // Get current token
//     const targetWsUrl = getWebSocketUrlWithToken(token);
//     logToPage(
//       "info",
//       `Attempting to establish WebSocket connection to: ${targetWsUrl}`
//     );
//     try {
//       await connectWebSocketToUrl(targetWsUrl, { autoReconnect: true }); // Options can be configured
//       logToPage(
//         "debug",
//         `connectWebSocketToUrl called for ${targetWsUrl}. Current status: ${WSStatus[webSocketStatus.value]}`
//       );
//     } catch (e: any) {
//       logToPage(
//         "error",
//         `Failed to establish WebSocket connection to ${targetWsUrl}:`,
//         e.message
//       );
//     }
//   }

//   // --- API Fetch Helper ---
//   async function fetchApi(
//     endpoint: string,
//     options: RequestInit = {}
//   ): Promise<any> {
//     authStore.setLoading(true);
//     authStore.setError(null);
//     const completeUrl = endpoint.startsWith("http")
//       ? endpoint
//       : `${HONO_API_BASE_URL}${endpoint}`; // Assuming /api prefix for Hono
//     logToPage(
//       "debug",
//       `WorkspaceApi: Calling ${options.method || "GET"} ${completeUrl}`
//     );

//     try {
//       const token = authStore.session?.token;
//       const headers = new Headers(options.headers || {});
//       if (token && !headers.has("Authorization")) {
//         headers.set("Authorization", `Bearer ${token}`);
//       }
//       if (
//         !options.body ||
//         (options.body && !(options.body instanceof FormData))
//       ) {
//         if (!headers.has("Content-Type"))
//           headers.set("Content-Type", "application/json");
//       }

//       const response = await fetch(completeUrl, { ...options, headers });

//       if (!response.ok) {
//         let errorData: ApiAuthError = {
//           message: `HTTP error! Status: ${response.status} ${response.statusText}`,
//           code: response.status,
//         };
//         try {
//           const jsonError = await response.json();
//           errorData = { ...errorData, ...jsonError }; // Merge server error message if available
//         } catch (e) {
//           /* Ignore if response is not JSON */
//         }
//         logToPage("error", `WorkspaceApi: Error on ${completeUrl}:`, errorData);
//         authStore.setError(errorData);
//         throw errorData;
//       }

//       if (response.status === 204) {
//         // No Content
//         logToPage(
//           "debug",
//           `WorkspaceApi: Received 204 No Content from ${completeUrl}`
//         );
//         return null;
//       }
//       const data = await response.json();
//       logToPage("debug", `WorkspaceApi: Received data from ${completeUrl}`);
//       return data;
//     } catch (e: any) {
//       logToPage(
//         "error",
//         `WorkspaceApi: Exception during call to ${completeUrl}:`,
//         e
//       );
//       // Ensure error in store is an ApiAuthError
//       if (e.message && e.code) {
//         authStore.setError(e as ApiAuthError);
//       } else {
//         authStore.setError({
//           message: e.message || "Network or unexpected error during API call",
//         });
//       }
//       throw e; // Re-throw for the calling function to handle
//     } finally {
//       authStore.setLoading(false);
//     }
//   }

//   // --- Data Fetching for User and Profile ---
//   async function fetchPublicUserData(
//     userId: string
//   ): Promise<Partial<User> | null> {
//     if (!userId) {
//       logToPage("warn", "fetchPublicUserData: No userId provided.");
//       return null;
//     }
//     try {
//       logToPage("debug", `Workspaceing public user data for ${userId}...`);
//       // Adjust endpoint as per your Hono API structure
//       const userData = await fetchApi(`/users/${userId}`);
//       if (userData) {
//         userStore.setUser(userData as Partial<User>); // Update store
//         logToPage("info", `User data fetched and set for ${userId}`);
//       }
//       return userData as Partial<User> | null;
//     } catch (error) {
//       logToPage(
//         "error",
//         `Failed to fetch public user data for ${userId}:`,
//         error
//       );
//       userStore.clearUser(); // Clear on failure
//       return null;
//     }
//   }

//   async function fetchUserProfile(
//     userId: string,
//     activeProfileId?: string | null
//   ): Promise<ProfileData | null> {
//     if (!userId) {
//       logToPage("warn", "fetchUserProfile: No userId provided.");
//       return null;
//     }
//     // Endpoint might be /users/:userId/profile or /profiles/:profileId if activeProfileId is known
//     // This example assumes fetching the active profile for a user.
//     const endpoint = activeProfileId
//       ? `/profiles/${activeProfileId}` // Assuming profileId is globally unique and authorized
//       : `/users/${userId}/profile/active`; // Example endpoint for active profile

//     try {
//       logToPage("debug", `Workspaceing user profile from ${endpoint}...`);
//       const profileData = await fetchApi(endpoint);
//       if (profileData) {
//         profileStore.setProfile(profileData as ProfileData); // Update store
//         logToPage("info", `User profile fetched and set for ${userId}`);
//       }
//       return profileData as ProfileData | null;
//     } catch (error) {
//       logToPage(
//         "error",
//         `Failed to fetch user profile for ${userId} from ${endpoint}:`,
//         error
//       );
//       profileStore.clearProfile(); // Clear on failure
//       return null;
//     }
//   }

//   // --- WebSocket Auth Event Handlers ---
//   async function handleAuthStateChange(sessionPayload: ClientSession | null) {
//     logToPage(
//       "event",
//       `Handling Auth State Change. New session user: ${sessionPayload?.user?.id || "None"}`
//     );
//     authStore.setLoading(true); // Indicate loading while processing state change
//     authStore.setSession(sessionPayload);

//     if (sessionPayload?.user) {
//       const userId = sessionPayload.user.id;
//       // It's often good to re-fetch user/profile data to ensure freshness,
//       // even if some data is in sessionPayload.user.
//       const publicUserData = await fetchPublicUserData(userId);
//       if (publicUserData) {
//         // User store is updated by fetchPublicUserData
//         await fetchUserProfile(userId, publicUserData.activeProfileId); // Profile store updated by fetchUserProfile
//       } else {
//         logToPage(
//           "warn",
//           `User data not found for authenticated user ${userId} after auth state change. Clearing local user/profile.`
//         );
//         userStore.clearUser();
//         profileStore.clearProfile();
//         // Optionally, set an error or log out if essential data is missing post-auth
//         // authStore.setError({ message: "User data inconsistent after authentication." });
//         // await signOut(); // Drastic measure
//       }
//     } else {
//       // No user in session (logged out or invalid session)
//       userStore.clearUser();
//       profileStore.clearProfile();
//       logToPage("info", "Session cleared, user and profile stores cleared.");
//     }
//     authStore.setInitialAuthCheckComplete(true); // Mark check complete after processing first significant auth event
//     authStore.setLoading(false);
//   }

//   async function handleUserUpdate(userPayload: Partial<ClientAuthUser>) {
//     logToPage(
//       "event",
//       "Handling User Update event for user ID:",
//       userPayload?.id
//     );
//     if (
//       userPayload &&
//       userPayload.id &&
//       currentUser.value?.id === userPayload.id
//     ) {
//       authStore.setLoading(true);
//       // Re-fetch for full consistency is safer than merging partials
//       const fullUserData = await fetchPublicUserData(userPayload.id);
//       if (fullUserData) {
//         // userStore.setUser(fullUserData); // fetchPublicUserData already does this
//         // If ClientAuthUser structure (in session) needs updating based on UserData
//         if (
//           authStore.session?.user &&
//           authStore.session.user.id === fullUserData.id
//         ) {
//           authStore.setSession({
//             ...authStore.session,
//             user: {
//               // Map fields from UserData to ClientAuthUser as needed
//               ...authStore.session.user, // Keep existing ClientAuthUser fields
//               id: fullUserData.id, // from UserData
//               email: fullUserData.email as string, // from UserData
//               username: fullUserData.username, // from UserData
//               avatarUrl: fullUserData.avatar, // from UserData
//               // ... other fields from UserData that map to ClientAuthUser
//             },
//           });
//         }
//       }
//       authStore.setLoading(false);
//     }
//   }

//   async function handleProfileUpdate(profilePayload: Partial<ProfileData>) {
//     logToPage(
//       "event",
//       "Handling Profile Update event for profile ID:",
//       profilePayload?.id
//     );
//     if (
//       profilePayload &&
//       profilePayload.id &&
//       currentProfile.value?.id === profilePayload.id &&
//       currentUser.value?.id
//     ) {
//       authStore.setLoading(true);
//       // Re-fetch for full consistency
//       await fetchUserProfile(currentUser.value.id, profilePayload.id);
//       // profileStore.setProfile(fullProfileData); // fetchUserProfile already does this
//       authStore.setLoading(false);
//     }
//   }

//   // --- Auth Actions ---
//   async function commonPostAuthActions(
//     sessionData: ClientSession | null,
//     isInitialAuth: boolean = false
//   ) {
//     const oldToken = authStore.session?.token;
//     authStore.setSession(sessionData); // Update store immediately
//     const newToken = sessionData?.token;

//     // Re-establish WebSocket only if token status actually changes or if it's an initial auth process
//     if (newToken !== oldToken || isInitialAuth || !isWebSocketConnected.value) {
//       logToPage(
//         "debug",
//         `Token status changed or initial auth. Old: ${oldToken ? "yes" : "no"}, New: ${newToken ? "yes" : "no"}. Re-establishing WS.`
//       );
//       await establishWebSocketConnection();
//     }

//     // After setting session and potentially reconnecting WS, process the state
//     // Server should push AUTH_STATE_CHANGE via WebSocket after successful login/logout/session update.
//     // If immediate data update is critical and server push might be delayed, can call handleAuthStateChange.
//     // However, relying on server push promotes a single source of truth for state updates.
//     if (isInitialAuth && sessionData?.user) {
//       // For initial load with a valid session
//       await handleAuthStateChange(sessionData);
//     } else if (!sessionData?.user && (oldToken || isInitialAuth)) {
//       // For logout or initial load with no session
//       await handleAuthStateChange(null);
//     }
//     // For login/signup, handleAuthStateChange will be triggered by the server's WebSocket push.
//   }

//   async function signInWithPassword(credentials: AuthCredentials) {
//     logToPage("info", `Attempting sign in for ${credentials.email}...`);
//     try {
//       const sessionData = (await fetchApi("/auth/login", {
//         method: "POST",
//         body: JSON.stringify(credentials),
//       })) as ClientSession | null;
//       await commonPostAuthActions(sessionData);
//       return {
//         user: sessionData?.user || null,
//         session: sessionData,
//         error: null,
//       };
//     } catch (e: any) {
//       await commonPostAuthActions(null); // Ensure WS disconnects or connects without token
//       return { user: null, session: null, error: e as ApiAuthError };
//     } finally {
//       authStore.setInitialAuthCheckComplete(true);
//     }
//   }

//   async function signUpNewUser(payload: SignUpPayload) {
//     logToPage("info", `Attempting sign up for ${payload.email}...`);
//     try {
//       // Assuming your /auth/register endpoint creates user, profile, and returns a session
//       const sessionData = (await fetchApi("/auth/register", {
//         method: "POST",
//         body: JSON.stringify(payload),
//       })) as ClientSession | null;
//       await commonPostAuthActions(sessionData);
//       // If server doesn't auto-login and return session, you might need an extra signInWithPassword call.
//       return {
//         user: sessionData?.user || null,
//         session: sessionData,
//         error: null,
//       };
//     } catch (e: any) {
//       await commonPostAuthActions(null);
//       return { user: null, session: null, error: e as ApiAuthError };
//     }
//   }

//   async function signInWithGoogleIdToken(idToken: string) {
//     logToPage("info", "Attempting Google Sign In... ");
//     try {
//       const sessionData = (await fetchApi("/auth/google", {
//         method: "POST",
//         body: JSON.stringify({ token: idToken }),
//       })) as ClientSession | null;
//       await commonPostAuthActions(sessionData);
//       return {
//         user: sessionData?.user || null,
//         session: sessionData,
//         error: null,
//       };
//     } catch (e: any) {
//       await commonPostAuthActions(null);
//       return { user: null, session: null, error: e as ApiAuthError };
//     } finally {
//       authStore.setInitialAuthCheckComplete(true);
//     }
//   }

//   async function signOut() {
//     logToPage("info", "Attempting sign out...");
//     const currentToken = authStore.session?.token;
//     try {
//       // Pass token if your logout endpoint requires it for invalidation
//       await fetchApi("/auth/logout", { method: "POST" });
//       // commonPostAuthActions will handle clearing session and reconnecting WS
//     } catch (e: any) {
//       logToPage(
//         "error",
//         "Sign out API call failed, but clearing local session anyway.",
//         e
//       );
//       // Still proceed to clear local state and update WS
//     } finally {
//       await commonPostAuthActions(null); // Crucial: clear session, this triggers WS re-evaluation
//       authStore.setInitialAuthCheckComplete(true);
//     }
//     return { error: authStore.error }; // Return any error that might have been set by fetchApi
//   }

//   // --- Initialization and Lifecycle ---
//   async function initializeAuthSystem() {
//     logToPage(
//       "debug",
//       `useBetterAuth: Initializing auth system (Instance count: ${activeComposableInstances})`
//     );
//     if (authStore.initialAuthCheckComplete && authStore.session) {
//       logToPage(
//         "debug",
//         "Auth system already initialized and session exists. Re-establishing WebSocket."
//       );
//       await establishWebSocketConnection(); // Ensure WebSocket is connected with current token
//       return;
//     }
//     if (authStore.isLoading) {
//       logToPage("debug", "Auth system initialization already in progress.");
//       return;
//     }

//     authStore.setLoading(true);
//     try {
//       const initialSession = (await fetchApi("/auth/session", {
//         method: "GET",
//       })) as ClientSession | null;
//       // commonPostAuthActions will set session and establish WebSocket connection.
//       // The 'true' flag indicates it's an initial auth process.
//       await commonPostAuthActions(initialSession, true);
//     } catch (e: any) {
//       logToPage(
//         "warn",
//         "useBetterAuth: No active HTTP session found or error fetching session during init.",
//         e.message
//       );
//       await commonPostAuthActions(null, true); // Still ensure WS is attempted (unauthenticated) and state is clean.
//     } finally {
//       // setInitialAuthCheckComplete is handled by individual auth actions or commonPostAuthActions -> handleAuthStateChange
//       authStore.setLoading(false);
//     }

//     // Setup WebSocket listeners only once for all instances of useBetterAuth
//     // This needs to happen after the first establishWebSocketConnection attempt in initializeAuthSystem
//     // so that onWebSocketMessage is available from an initialized useCashflowSocket.
//     if (
//       activeComposableInstances === 1 &&
//       listenerUnsubscribeCallbacks.length === 0
//     ) {
//       logToPage(
//         "debug",
//         "useBetterAuth: Setting up shared WebSocket listeners for auth events."
//       );
//       listenerUnsubscribeCallbacks.push(
//         onWebSocketMessage(AUTH_EVENT_IDENTIFIERS.STATE_CHANGE, (p) =>
//           handleAuthStateChange(p as ClientSession | null)
//         ),
//         onWebSocketMessage(AUTH_EVENT_IDENTIFIERS.USER_UPDATED, (p) =>
//           handleUserUpdate(p as Partial<ClientAuthUser>)
//         ),
//         onWebSocketMessage(AUTH_EVENT_IDENTIFIERS.PROFILE_UPDATED, (p) =>
//           handleProfileUpdate(p as Partial<ProfileData>)
//         )
//       );
//     }
//   }

//   onMounted(async () => {
//     logToPage(
//       "debug",
//       `onMounted hook. Active instances: ${activeComposableInstances}`
//     );
//     // Initialize only if it's the first active instance or if auth check hasn't completed.
//     // This prevents re-initialization on every component mount if already done.
//     if (
//       !authStore.initialAuthCheckComplete ||
//       activeComposableInstances === 1
//     ) {
//       await initializeAuthSystem();
//     } else {
//       // If already initialized, just ensure WebSocket is connected with current token.
//       await establishWebSocketConnection();
//     }
//   });

//   onUnmounted(() => {
//     activeComposableInstances--;
//     logToPage(
//       "debug",
//       `onUnmounted hook. Active instances remaining: ${activeComposableInstances}`
//     );
//     if (activeComposableInstances === 0) {
//       logToPage(
//         "info",
//         "useBetterAuth: All instances unmounted. Cleaning up shared WebSocket listeners."
//       );
//       listenerUnsubscribeCallbacks.forEach((unsub) => unsub());
//       listenerUnsubscribeCallbacks.length = 0; // Clear the array
//       // The useCashflowSocket composable has its own onUnmounted to disconnect
//       // if it also has no active instances.
//     }
//   });

//   // Watch for WebSocket errors from useCashflowSocket and reflect them in authError if appropriate
//   watch(websocketError, (newWsError) => {
//     if (newWsError && !authStore.error) {
//       // Only set if no specific auth API error is already present
//       logToPage(
//         "warn",
//         `WebSocket error detected: ${newWsError}. Reflecting in auth error state.`
//       );
//       // authStore.setError({ message: `WebSocket connection error: ${newWsError}` });
//       // Decided against this: wsError is separate. Auth errors are for auth API calls.
//     }
//   });

//   // Watch for external token changes (e.g. from localStorage sync by Pinia persist plugin)
//   // This ensures WS reconnects if token appears/disappears outside of direct auth actions.
//   watch(
//     () => authStore.session?.token,
//     async (newToken, oldToken) => {
//       if (newToken !== oldToken && !authStore.isLoading) {
//         // Avoid race conditions during auth ops
//         logToPage(
//           "debug",
//           `Token changed externally (e.g. localStorage sync). New token: ${newToken ? "yes" : "no"}. Re-establishing WebSocket.`
//         );
//         await establishWebSocketConnection();
//       }
//     },
//     { deep: false }
//   ); // Watch the token itself, not the whole session object deeply for this specific purpose

//   return {
//     // State & Getters
//     session,
//     isAuthenticated,
//     isLoading,
//     authError,
//     currentUser,
//     currentProfile,
//     initialAuthCheckComplete,

//     // Auth Actions
//     signInWithPassword,
//     signUpNewUser,
//     signInWithGoogleIdToken,
//     signOut,

//     // Data Fetchers
//     fetchPublicUserData,
//     fetchUserProfile,

//     // System & WS
//     initializeAuthSystem, // Expose for manual re-init if needed by test script or app
//     isWebSocketConnected,
//     webSocketStatus,
//     establishWebSocketConnection, // Expose ability to explicitly try to connect WS
//   };
// }
