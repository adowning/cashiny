// apps/client/src/scripts/browser-test-client.ts
import {
  createApp,
  watch,
  onMounted,
  onUnmounted,
  nextTick,
  type App as VueApp,
} from "vue";
import { createPinia, setActivePinia, type Pinia } from "pinia";

// Adjust paths based on your project structure if this script is outside /src
import { useAuthStore } from "../stores/auth";
import { useUserStore } from "../stores/user";
import { useProfileStore } from "../stores/profile";
import { useBetterAuth } from "../composables/useBetterAuth";
import {
  useCashflowSocket,
  type ZilaMessagePayload,
} from "../composables/useCashflowSocket";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

// Assuming types are correctly exported from your @cashflow/types package
import type {
  ClientSession,
  AuthCredentials,
  SignUpPayload,
  // UserData,
  // ProfileData,
  // ClientAuthUser,
  // ApiAuthError,
} from "@cashflow/types";
import { WSStatus } from "./wsClient";
import { createPersistedState } from "pinia-plugin-persistedstate";

// --- Configuration ---
const HONO_API_BASE_URL =
  import.meta.env.VITE_HONO_API_BASE_URL || "http://localhost:6589/api";
const HONO_WEBSOCKET_URL =
  import.meta.env.VITE_HONO_WEBSOCKET_URL || "ws://localhost:6589/ws";
// const r = Math.floor(Math.random() * 100000);
// const TEST_USER_EMAIL = `test${r}@user.com`; // REPLACE with your actual test user
const TEST_USER_EMAIL = `testuser@cashflow.com`; // REPLACE with your actual test user
const TEST_USER_PASSWORD = "asdfasdf"; // REPLACE with your actual test user's password
const PERFORM_REGISTRATION = false; // Set to true if you want to create a new test user each time
// WebSocket Event Identifiers (ensure these match your server and @cashflow/types)
const AUTH_EVENT_IDENTIFIERS = {
  STATE_CHANGE: "auth:state_change",
  USER_UPDATED: "auth:user_updated",
  PROFILE_UPDATED: "auth:profile_updated",
} as const;

const TEST_WS_EVENT_IDENTIFIERS = {
  CLIENT_PING: "test:client_ping",
  SERVER_PONG: "test:server_pong",
  ECHO_MESSAGE: "test:echo_message",
  SERVER_ECHO_RESPONSE: "test:echo_response",
  // Example for a feature specific to your app
  REQUEST_LOBBY_INFO: "lobby:request_info",
  LOBBY_INFO_UPDATE: "lobby:info_update", // Server pushes this
  GET_SERVER_TIME: "test:get_server_time", // Added missing identifier
} as const;

// --- Logging to HTML Page ---
const logsElement = document.getElementById("logs") as HTMLPreElement;
type LogType =
  | "info"
  | "success"
  | "error"
  | "warn"
  | "event"
  | "debug"
  | "title";

function logToPage(type: LogType, ...args: any[]) {
  const message = args
    .map((arg) => {
      if (typeof arg === "object") {
        try {
          return JSON.stringify(arg, null, 2);
        } catch (e) {
          return String(arg) + " (Unserializable Object)";
        }
      }
      return String(arg);
    })
    .join(" ");

  console[type === "error" ? "error" : type === "warn" ? "warn" : "log"](
    ...args
  ); // Also log to browser console

  if (logsElement) {
    const entry = document.createElement("div");
    entry.className = `log-entry log-${type}`;
    const timestamp = new Date().toLocaleTimeString();
    entry.innerHTML = `<strong>[${type.toUpperCase()}] ${timestamp}:</strong> ${message.replace(/\n/g, "<br>")}`;
    logsElement.appendChild(entry);
    logsElement.scrollTop = logsElement.scrollHeight;
  }
}

// Helper to pause execution
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// --- Vue App Setup for Composables ---
let app: VueApp | null = null;
let piniaInstance: Pinia | null = null;

function setupVueContext(callback: () => void) {
  if (!app) {
    app = createApp({
      setup() {
        // Initialize Pinia within the app context
        piniaInstance = createPinia();
        piniaInstance.use(piniaPluginPersistedstate);
        app!.use(piniaInstance); // Use app instance directly
        setActivePinia(piniaInstance); // Set active Pinia for composables

        // Call the main logic once Pinia and app context are ready
        callback();

        // onMounted and onUnmounted for composables will now work if they are called within this setup or downstream
        return {}; // Minimal render function for the host component
      },
    });
    // Mount to a dummy element if not using a full Vue app structure for the test page itself.
    // The #app div in test-runner.html is for logs, not for this Vue app instance.
    const dummyHostElement = document.createElement("div");
    app.mount(dummyHostElement); // Mount the minimal app to activate its context
    logToPage("info", " Minimal Vue app context and Pinia initialized.");
  } else {
    // If app already exists, ensure Pinia is active and run callback
    if (piniaInstance) setActivePinia(piniaInstance);
    callback();
  }
}

// --- Main Test Function ---
async function runTestScenario() {
  logToPage("title", "🚀 Starting Test Scenario...");

  // Get instances of stores and composables *within the Vue app context*
  const authStore = useAuthStore();
  const userStore = useUserStore(); // Assuming it's defined
  const profileStore = useProfileStore(); // Assuming it's defined
  const r = Math.floor(Math.random() * 100000);
  const clientId = `client-${r}`; // Unique client ID for this test run

  const betterAuth = useBetterAuth();
  const zilaWebsocket =
    useCashflowSocket();
    // HONO_WEBSOCKET_URL, clientId, {
    // autoReconnect: true, // Enable auto-reconnect for testing resilience
    // maxReconnectAttempts: 3,
    // reconnectInterval: 2000,
    // }

  // Log initial states
  logToPage("debug", "Initial Auth Store:", {
    session: authStore.session,
    token: authStore.token,
    loading: authStore.isLoading,
    error: authStore.error,
    initialAuthCheckComplete: authStore.initialAuthCheckComplete,
  });
  logToPage(
    "debug",
    "Initial ZilaWS Status:",
    WSStatus[zilaWebsocket.connectionStatus.value]
  );

  // Watch WebSocket status reactively (Vue's watch)
  const stopWsStatusWatcher = watch(
    zilaWebsocket.connectionStatus,
    (newStatus, oldStatus) => {
      logToPage(
        "event",
        `WebSocket Status Changed: ${WSStatus[oldStatus || -1]} -> ${WSStatus[newStatus]}`
      );
      if (newStatus === WSStatus.ERROR && zilaWebsocket.websocketError.value) {
        logToPage(
          "error",
          "WebSocket Reported Error:",
          zilaWebsocket.websocketError.value
        );
      }
    }
  );

  // Call initial auth system setup (simulates onMounted behavior of useBetterAuth)
  logToPage("info", "🔐 Initializing Authentication System...");
  await betterAuth.initializeAuthSystem();
  logToPage(
    "info",
    `Initial auth check complete state: ${betterAuth.initialAuthCheckComplete.value}`
  );
  if (betterAuth.isAuthenticated.value) {
    logToPage(
      "success",
      "User is already authenticated from previous session:",
      betterAuth.currentUser.value?.email
    );
  } else {
    logToPage("info", "User is not initially authenticated.");
  }

  // --- Test Scenarios ---
  try {
    // B2. Sign In
    if (PERFORM_REGISTRATION) {
      logToPage(
        "title",
        `🔑 Attempting Sign Up for user: ${TEST_USER_EMAIL}...`
      );
      const signUpCredentials: SignUpPayload = {
        email: TEST_USER_EMAIL,
        username: TEST_USER_EMAIL.split("@")[0],
        password: TEST_USER_PASSWORD,
      };
      const signUpData = await betterAuth.signUpNewUser(signUpCredentials);
      console.log("Sign Up Result:", {
        signUpData,
      });
      if (!signUpData) {
        logToPage("error", "❌ Sign Up Failed: No response from server.");
      } else if (signUpData.error) {
        logToPage("error", "❌ Sign Up Failed:", signUpData.error);
      } else if (signUpData.user) {
        logToPage("success", "✅ Sign Up Successful!");
        logToPage("info", "   User ID:", signUpData.user.id);
        logToPage("info", "   User Email:", signUpData.user.email);
        // logToPage('info', '   Session
      } // C. Sign In
      logToPage(
        "title",
        `🔑 Attempting Sign In for user: ${TEST_USER_EMAIL}...`
      );
    }
    const signInCredentials: SignUpPayload = {
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
      username: TEST_USER_EMAIL.split("@")[0],
    };

    const {
      user,
      session,
      error: signInError,
    } = await betterAuth.signInWithPassword(signInCredentials);

    if (signInError) {
      logToPage("error", "❌ Sign In Failed:", signInError);
    } else if (user && session) {
      logToPage("success", "✅ Sign In Successful!");
      logToPage("info", "   User ID:", user.id);
      logToPage("info", "   User Email:", user.email);
      // logToPage('info', '   Session Token (first 10 chars):', session.token?.substring(0, 10) + '...');
      logToPage(
        "debug",
        "   Auth Store isAuthenticated:",
        authStore.isAuthenticated
      );
      logToPage(
        "debug",
        "   Composable isAuthenticated:",
        betterAuth.isAuthenticated.value
      );

      await delay(1000);
      // A. WebSocket Connection (initializeAuthSystem should attempt connection)
      if (!zilaWebsocket.isConnected.value) {
        logToPage(
          "info",
          "Attempting WebSocket connection via useBetterAuth..."
        );
        // initializeAuthSystem implicitly calls connectWebSocket via useBetterAuth's onMounted.
        // If it didn't connect, let's try explicitly:
        if (
          zilaWebsocket.connectionStatus.value !== WSStatus.OPENING &&
          zilaWebsocket.connectionStatus.value !== WSStatus.OPEN
        ) {
          logToPage("info", "connecting...");
          await zilaWebsocket.connectOrReconnect(HONO_WEBSOCKET_URL, {
            autoReconnect: true, // Enable auto-reconnect for testing resilience
            maxReconnectAttempts: 3,
            reconnectInterval: 2000,
          });
        }

        let connectRetries = 5;
        while (
          !zilaWebsocket.isConnected.value &&
          connectRetries > 0 &&
          zilaWebsocket.connectionStatus.value !== WSStatus.ERROR
        ) {
          logToPage(
            "debug",
            `Waiting for WebSocket... Status: ${WSStatus[zilaWebsocket.connectionStatus.value]} (Retries: ${connectRetries})`
          );
          await delay(1000);
          connectRetries--;
        }
      }

      if (zilaWebsocket.isConnected.value) {
        logToPage("success", "✅ WebSocket connected successfully.");
      } else {
        logToPage(
          "error",
          `❌ WebSocket failed to connect. Status: ${WSStatus[zilaWebsocket.connectionStatus.value]}. Error: ${zilaWebsocket.websocketError.value || "N/A"}`
        );
        logToPage(
          "warn",
          "WebSocket dependent tests might fail or be skipped."
        );
      }

      // B. WebSocket Listeners Setup
      logToPage("title", "🎧 Setting up WebSocket listeners...");
      const unsubAuthListener = zilaWebsocket.onMessage(
        AUTH_EVENT_IDENTIFIERS.STATE_CHANGE,
        (payload) => {
          logToPage(
            "event",
            `WS Event [${AUTH_EVENT_IDENTIFIERS.STATE_CHANGE}]:`,
            payload
          );
          const session = payload as ClientSession | null;
          logToPage(
            "info",
            `   Auth state changed. IsAuthenticated: ${!!session?.user}`
          );
        }
      );
      const unsubPongListener = zilaWebsocket.onMessage(
        TEST_WS_EVENT_IDENTIFIERS.SERVER_PONG,
        (payload) => {
          logToPage(
            "event",
            `WS Event [${TEST_WS_EVENT_IDENTIFIERS.SERVER_PONG}]:`,
            payload
          );
        }
      );
      const unsubEchoListener = zilaWebsocket.onMessage(
        TEST_WS_EVENT_IDENTIFIERS.SERVER_ECHO_RESPONSE,
        (payload) => {
          logToPage(
            "event",
            `WS Event [${TEST_WS_EVENT_IDENTIFIERS.SERVER_ECHO_RESPONSE}]:`,
            payload
          );
        }
      );
      logToPage(
        "info",
        "   Listeners for AUTH_STATE_CHANGE, SERVER_PONG, SERVER_ECHO_RESPONSE active."
      );
      // Wait for server to potentially push AUTH_STATE_CHANGE

      // D. REST API Calls (after login)
      if (betterAuth.isAuthenticated.value && betterAuth.currentUser.value) {
        logToPage("title", "🌐 Performing REST API calls...");
        const currentUserId = betterAuth.currentUser.value.id;
        logToPage(
          "info",
          `   Fetching public user data for User ID: ${currentUserId}...`
        );
        const fetchedUser = await betterAuth.fetchPublicUserData(currentUserId);
        if (fetchedUser) {
          logToPage("success", "     ✅ User Data Received:", {
            username: fetchedUser.username,
            email: fetchedUser.email,
          });
        } else {
          logToPage("error", "     ❌ Failed to fetch user data.");
        }

        logToPage(
          "info",
          `   Fetching user profile for User ID: ${currentUserId}...`
        );
        const fetchedProfile = await betterAuth.fetchUserProfile(
          currentUserId,
          betterAuth.currentUser.value.activeProfileId
        );
        if (fetchedProfile) {
          logToPage("success", "     ✅ Profile Data Received (sample):", {
            balance: fetchedProfile.balance,
            xp: fetchedProfile.xpEarned,
          });
        } else {
          logToPage("error", "     ❌ Failed to fetch profile data.");
        }
      } else {
        logToPage(
          "warn",
          "⚠️ Skipping REST API calls as user is not authenticated or current user data is missing post-login."
        );
      }

      // E. WebSocket Interactions (after login)
      if (zilaWebsocket.isConnected.value) {
        logToPage("title", "💬 Performing WebSocket interactions...");
        const pingPayload = { timestamp: Date.now(), client: "TestRunner" };
        logToPage(
          "info",
          `   Sending [${TEST_WS_EVENT_IDENTIFIERS.CLIENT_PING}] with payload:`,
          pingPayload
        );
        await zilaWebsocket.postMessage(
          TEST_WS_EVENT_IDENTIFIERS.CLIENT_PING,
          pingPayload
        );

        const echoPayload = {
          message: "Hello from Browser Test Script!",
          sentAt: new Date().toISOString(),
          version: "1.0",
        };
        logToPage(
          "info",
          `   Sending [${TEST_WS_EVENT_IDENTIFIERS.ECHO_MESSAGE}] with payload:`,
          echoPayload
        );
        await zilaWebsocket.postMessage(
          TEST_WS_EVENT_IDENTIFIERS.ECHO_MESSAGE,
          echoPayload
        );

        // Example: requestResponse - ensure your server handles 'test:get_server_time' and responds
        logToPage(
          "info",
          `   Sending request-response [${TEST_WS_EVENT_IDENTIFIERS.GET_SERVER_TIME}]...`
        );
        try {
          const serverTimeResponse = await zilaWebsocket.requestResponse(
            TEST_WS_EVENT_IDENTIFIERS.GET_SERVER_TIME,
            {},
            5000
          ); // 5s timeout
          logToPage(
            "success",
            `     ✅ Response from [${TEST_WS_EVENT_IDENTIFIERS.GET_SERVER_TIME}]:`,
            serverTimeResponse
          );
        } catch (e: any) {
          logToPage(
            "error",
            `     ❌ Error in request-response for [${TEST_WS_EVENT_IDENTIFIERS.GET_SERVER_TIME}]:`,
            e.message
          );
        }
      } else {
        logToPage(
          "warn",
          "⚠️ Skipping WebSocket interactions as WebSocket is not connected."
        );
      }

      logToPage(
        "info",
        "\n⏳ Waiting for 5 seconds for any async WebSocket messages to arrive..."
      );
      await delay(5000);

      // F. Sign Out
      logToPage("title", "🚪 Attempting Sign Out...");
      const { error: signOutError } = await betterAuth.signOut();
      if (signOutError) {
        logToPage("error", "❌ Sign Out Failed:", signOutError);
      } else {
        logToPage("success", "✅ Sign Out Successful!");
        logToPage(
          "debug",
          "   Auth Store isAuthenticated:",
          authStore.isAuthenticated
        );
        logToPage(
          "debug",
          "   Composable isAuthenticated:",
          betterAuth.isAuthenticated.value
        );
      }
      unsubAuthListener();
      unsubPongListener();
      unsubEchoListener();
      logToPage("info", "🔌 Custom test WebSocket listeners unsubscribed.");
      await delay(1000); // Wait for server to potentially push AUTH_STATE_CHANGE
    } else {
      logToPage(
        "error",
        "❌ Sign In did not return user or session, and no explicit signInError was caught."
      );
    }

    // Unsubscribe WebSocket listeners registered by this test script
  } catch (e: any) {
    logToPage(
      "error",
      "💥 An unexpected error occurred in the main test scenario:",
      e.message,
      e.stack
    );
  } finally {
    // Cleanup (simulates onUnmounted for composables, though Vue app context handles some)
    stopWsStatusWatcher(); // Stop watching WebSocket status

    logToPage("title", "🧹 Cleaning up: Disconnecting WebSocket...");
    if (zilaWebsocket.isConnected.value) {
      await zilaWebsocket.disconnectWebSocket();
      logToPage(
        "info",
        zilaWebsocket.isConnected.value
          ? "   WebSocket disconnect attempt made, check status."
          : "   WebSocket disconnected."
      );
    } else {
      logToPage(
        "info",
        "   WebSocket was not connected, no disconnect needed."
      );
    }

    // The onUnmounted hooks within useBetterAuth and useZilaWebsocket should ideally
    // handle their own internal listener cleanup if they were properly triggered
    // by the Vue app context. If running them without a component tree, their
    // onUnmounted might not fire automatically unless the app instance itself is unmounted.
    // For this script, the primary cleanup is disconnecting the WS.

    logToPage("title", "🎉 Test Scenario Finished.");
  }
}

// --- Attach to Button and Run ---
const runButton = document.getElementById("runTestBtn");
if (runButton) {
  runButton.onclick = () => {
    if (logsElement) logsElement.innerHTML = ""; // Clear previous logs
    logToPage("info", "Button clicked, setting up Vue context for test run...");
    // Setup Vue context and then run the scenario
    // This ensures composables are called within an active app/Pinia context
    try {
      setupVueContext(runTestScenario);
    } catch (e: any) {
      logToPage(
        "error",
        "Failed to setup Vue Context or run scenario:",
        e.message,
        e.stack
      );
    }
  };
  logToPage(
    "info",
    'Test environment initialized. Click "Run Test Scenario" to start.'
  );
} else {
  logToPage("error", "Could not find run button.");
}
