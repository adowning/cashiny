<template>
  <div class="login-view-container overflow-hidden" v-if="authDialogVisible">
    <Logo class="logo-main"></Logo>
    <div class="flex justify-center items-center min-h-[20px] w-80 glow text-sm">
      <div :style="`color: ${!isSignUpMode ? 'white' : 'green'};`">Login</div>

      <input
        type="checkbox"
        id="switch"
        style="transform: scale(0.5)"
        @click="authStore.toggleSignUp"
      /><label style="transform: scale(0.5)" for="switch">Toggle</label>

      <div :style="`color: ${isSignUpMode ? 'white' : 'green'};`">Signup</div>
    </div>

    <RegisterForm v-if="isSignUpMode" />
    <LoginForm v-else />

    <!-- </div>  -->
  </div>
  <div v-else>
    <Loading />
  </div>
</template>

<script setup lang="ts">
  import LoginForm from './LoginForm.vue'
  import RegisterForm from './RegisterForm.vue'
  import { ref, reactive, onMounted, onUnmounted, watch } from 'vue' // Import necessary Vue 3 APIs
  import { storeToRefs } from 'pinia' // Import storeToRefs
  import { useRouter } from 'vue-router' // For navigation (though handled elsewhere now)
  // import { loadingFadeOut } from 'virtual:app-loading' // Assuming this utility exists

  // --- Google Identity Services (GSI) ---
  // Note: You can choose to use the 'better-auth' library OR the direct GSI script.
  // I'm simplifying to use the direct GSI script initialization as per your original code.
  // If using 'better-auth', remove the manual GSI script loading and initialization.
  // import { createAuthClient } from "better-auth/vue";
  // import { oneTapClient } from "better-auth/client/plugins";

  // --- Composables & Stores ---
  const router = useRouter() // Router might still be needed for direct push in specific cases, but main auth nav is in App.vue
  const authStore = useAuthStore()
  const notificationStore = useNotificationStore()

  // Use storeToRefs for reactive state from stores
  const {
    currentUser,
    isSignUpMode,
    authDialogVisible,
    isLoading: isAuthLoading, // Auth store's loading state
    isAuthenticated, // Auth store's authentication status
  } = storeToRefs(authStore)

  const showError = ref<boolean>(false)
  const isRegistering = ref<boolean>(false)
  // Destructure actions directly (they are not reactive)
  const { signInWithPassword, signUpNewUser, signInWithGoogleIdToken } = authStore

  // --- Component State ---
  const formData = reactive({
    email: '',
    password: '',
    confirmPassword: '', // For sign-up
    username: '', // For sign-up
  })

  // Removed componentLoading as isAuthLoading from store should suffice
  // const componentLoading = ref(false);

  // --- Computed Properties ---
  // Removed currentAuthError computed as authError from storeToRefs is directly usable

  // --- Methods ---

  // Google Sign-In Handler (called by Google Identity Services callback)
  const handleGoogleSignIn = async (response: any) => {
    // Prevent multiple requests if already loading
    console.log('sign in google')
    if (isAuthLoading.value) {
      // Use store's loading state
      console.warn('Google Credential Response received while already loading. Ignoring.')
      notificationStore.addNotification('warning', 'Processing a previous request, please wait.')
      return
    }

    console.log('Google credential response:', response)

    if (response.credential) {
      // Loading state managed by authStore.signInWithGoogleIdToken
      // componentLoading.value = true; // Removed
      const { success, error } = await signInWithGoogleIdToken(response.credential)
      // componentLoading.value = false; // Removed

      if (success) {
        console.log('Google sign-in action dispatched successfully.')
        // Notification and navigation handled by watchers/guards elsewhere
        // notificationStore.addNotification("success", "Successfully signed in with Google!");
        // router.push("/home"); // Removed - handled by App.vue/Guard
      } else if (error) {
        console.error('Google sign-in action failed:', error)
        // Error state set in store and displayed in template or App.vue
        // notificationStore.addNotification(
        //   "error",
        //   error.message || "Google sign-in failed."
        // );
        showError.value = true
        notificationStore.addNotification('error', error.message)
        setTimeout(() => {
          showError.value = false
          // window.location.reload()
        }, 3000)
      }
    } else {
      console.log('errror')
      showError.value = true
      notificationStore.addNotification(
        'error',
        'Google Sign-In credential not received. Please try again.'
      )
      console.error('Google Sign-In failed or no credential received:', response)
      // authStore.setError({ message: 'Google Sign-In failed.', code: 400 }) // Set auth store error
      setTimeout(() => {
        showError.value = false
        window.location.reload()
      }, 3000)
    }
  }

  // --- Google Identity Services (GSI) Initialization ---
  // This function loads the GSI script and initializes the client/button
  function initializeGoogleSignIn() {
    // Check if the GSI script is already loaded
    if (
      !(window as any).google ||
      !(window as any).google.accounts ||
      !(window as any).google.accounts.id
    ) {
      console.log('Loading Google GSI script...')
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = () => {
        console.log('Google GSI script loaded.')
        // Once script is loaded, initialize and render the button
        if (
          (window as any).google &&
          (window as any).google.accounts &&
          (window as any).google.accounts.id
        ) {
          ;(window as any).google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID, // Ensure this is correct
            callback: handleGoogleSignIn, // Link GSI callback to your method
          })

          // Render the button inside the specified container
          const googleButtonContainer = document.getElementById('googleSignInButtonContainer')
          if (googleButtonContainer) {
            ;(window as any).google.accounts.id.renderButton(googleButtonContainer, {
              theme: 'outline',
              size: 'large',
              type: 'standard',
              text: 'signin_with',
              width: 300, // Set a width to prevent button resizing issues
            })
            console.log('Google Sign-In button rendered.')
          } else {
            console.warn('Google Sign-In button container not found.')
          }

          // Optional: Trigger One Tap prompt if desired, but be mindful of UX
          // (window as any).google.accounts.id.prompt();
        } else {
          console.error('Google GSI library not fully available after script load.')
          notificationStore.addNotification('error', 'Could not initialize Google Sign-In.')
          authStore.setAuthError({
            message: 'Could not initialize Google Sign-In.',
            code: 500,
          })
        }
      }
      script.onerror = () => {
        console.error('Failed to load Google GSI script.')
        notificationStore.addNotification('error', 'Failed to load Google Sign-In script.')
        authStore.setAuthError({
          message: 'Failed to load Google Sign-In script.',
          code: 500,
        })
      }
      document.head.appendChild(script)
    } else {
      // Script is already loaded, just initialize and render button
      console.log('Google GSI script already loaded, initializing...')
      ;(window as any).google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleSignIn,
      })
      const googleButtonContainer = document.getElementById('googleSignInButtonContainer')
      if (googleButtonContainer) {
        ;(window as any).google.accounts.id.renderButton(googleButtonContainer, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          text: 'signin_with',
          width: 300, // Set a width
        })
        console.log('Google Sign-In button re-rendered.')
      } else {
        console.warn('Google Sign-In button container not found on re-initialization.')
      }
      // (window as any).google.accounts.id.prompt(); // Optional: Auto prompt
    }
  }

  // --- Component Lifecycle Hooks ---
  onMounted(() => {
    console.log('LoginView mounted.')
    authStore.setAuthDialogVisible(true)

    // Clear any previous authentication errors when the login view is accessed
    authStore.clearAuthError()

    // Initialize Google Sign-In
    initializeGoogleSignIn()

    // If already authenticated when reaching LoginView, redirect immediately
    // This handles cases like browser back button or direct access while logged in
    // Use the single source of truth from authStore
    if (isAuthenticated.value) {
      console.log('Already authenticated, redirecting from LoginView.')
      router.push({ name: 'Home' }) // Assuming 'Home' is your main app route
    }

    // Remove the initial app loading overlay if it's still present
    // This might be redundant if App.vue already calls loadingFadeOut after its initial check
    // loadingFadeOut()
  })

  onUnmounted(() => {
    console.log('LoginView unmounted.')
    // Clean up Google One Tap/GSI prompts if active
    if (
      (window as any).google &&
      (window as any).google.accounts &&
      (window as any).google.accounts.id
    ) {
      ;(window as any).google.accounts.id.cancel()
      // Disconnect any listeners if necessary (though callback should handle this)
    }
    // Clear form data on unmount? Depends on UX preference.
    // formData.email = "";
    // formData.password = "";
    // formData.confirmPassword = "";
    // formData.username = "";
  })

  // --- Watchers ---
  // Watch for authentication state change to navigate *away* from the login page
  // This watcher is crucial for reacting to successful logins (form or Google)
  watch(isAuthenticated, (isNowAuthenticated) => {
    console.log('LoginView reacting to isAuthenticated change:', isNowAuthenticated)
    // If the user becomes authenticated while on the LoginView, navigate away
    if (isNowAuthenticated) {
      console.log('Authenticated successfully, navigating to home.')
      if (currentUser.value !== null)
        notificationStore.addNotification(
          'success',
          `Welcome, ${currentUser.value.username || currentUser.value.email || 'user'}!` // Use userStore to get user info
        )
      router.push({ name: 'Home' }) // Navigate to your main app route
    }
    // No else block here - navigating TO login is handled by App.vue/Guard
  })

  // --- UI Toggle Logic ---
  const flipCardInner = ref<HTMLElement | null>(null)

  function toggleMode() {
    isSignUpMode.value = !isSignUpMode.value
    if (flipCardInner.value) {
      if (isSignUpMode.value) {
        flipCardInner.value.style.transform = 'rotateY(180deg)'
      } else {
        flipCardInner.value.style.transform = 'rotateY(0deg)'
      }
    }
    // Clear form and errors when toggling mode for a clean start
    formData.email = ''
    formData.password = ''
    formData.confirmPassword = ''
    formData.username = ''
    authStore.clearAuthError() // Clear auth errors
    // userStore.setError(null) // Clear user store errors
  }
</script>

<style scoped>
  input[type='checkbox'] {
    height: 0;
    width: 0;
    visibility: hidden;
  }

  label {
    cursor: pointer;
    text-indent: -9999px;
    width: 100px;
    height: 50px;
    background: #d19ae4;
    display: block;
    border-radius: 50px;
    position: relative;
  }

  label:after {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 45px;
    height: 45px;
    background: #fff;
    border-radius: 90px;
    transition: 0.3s;
  }

  input:checked + label {
    background: #5b0091;
  }

  input:checked + label:after {
    left: calc(100% - 5px);
    transform: translateX(-100%);
  }

  label:active:after {
    width: 130px;
  }

  .auth-mode-toggle {
    /* CSS Variables for easy theming and consistent sizing */
    --toggle-track-width: 50px;
    --toggle-track-height: 26px;
    --knob-size: 20px;
    /* Horizontal padding within the track for the knob */
    --track-internal-padding: 3px;

    /* Colors */
    --track-bg-login: #b954f3; /* Tailwind gray-400 */
    --track-bg-signup: #4a90e2; /* Tailwind blue-400 */
    --knob-bg-color: white;
    --text-color-inactive: #718096; /* Tailwind gray-600 */
    --text-color-active: #b954f3; /* Tailwind gray-800 */
    --label-font-weight-inactive: 400;
    --label-font-weight-active: 600;
    --focus-ring-color: #b954f3; /* Blue-400 for focus outline */

    /* Transitions */
    --transition-duration: 0.3s;
    --transition-timing-function: ease-in-out;
    margin-bottom: 20px;
    height: 50px;
    display: inline-flex; /* Use inline-flex to allow other elements on the same line */
    align-items: center;
    gap: 8px; /* Space between labels and the switch visual */
    cursor: pointer;
    user-select: none; /* Prevents text selection when clicking */
    padding: 4px; /* Padding for focus ring visibility */
    border-radius: 18px; /* Rounded corners for the entire component for focus */
    outline: none; /* Remove default outline, we'll add a custom one */
  }

  .auth-mode-toggle:focus-visible {
    box-shadow: 0 0 0 2px var(--focus-ring-color);
  }

  .lab {
    font-size: 18px;
    font-weight: 700;
    transition:
      color var(--transition-duration) var(--transition-timing-function),
      font-weight var(--transition-duration) var(--transition-timing-function);
  }

  .login-label {
    color: var(--text-color-inactive);
    font-weight: var(--label-font-weight-inactive);
  }
  .auth-mode-toggle .login-label.active {
    color: var(--text-color-active);
    font-weight: var(--label-font-weight-active);
  }

  .signup-label {
    color: var(--text-color-inactive);
    font-weight: var(--label-font-weight-inactive);
  }
  .auth-mode-toggle .signup-label.active {
    color: var(--text-color-active);
    font-weight: var(--label-font-weight-active);
  }

  .switch-visual-container {
    position: relative;
    width: var(--toggle-track-width);
    height: var(--toggle-track-height);
  }

  .switch-track {
    width: 100%;
    height: 100%;
    background-color: var(--track-bg-login);
    border-radius: calc(var(--toggle-track-height) / 2); /* Pill shape */
    transition: background-color var(--transition-duration) var(--transition-timing-function);
  }

  /* Change track background when sign up is active */
  .auth-mode-toggle.is-signup-active .switch-track {
    background-color: var(--track-bg-signup);
  }

  .switch-knob {
    position: absolute;
    top: calc((var(--toggle-track-height) - var(--knob-size)) / 2);
    left: var(--track-internal-padding);
    width: var(--knob-size);
    height: var(--knob-size);
    background-color: var(--knob-bg-color);
    border-radius: 50%; /* Circular knob */
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    transition: transform var(--transition-duration) var(--transition-timing-function);
  }

  /* Move knob to the right when sign up is active */
  .auth-mode-toggle.is-signup-active .switch-knob {
    transform: translateX(
      calc(var(--toggle-track-width) - var(--knob-size) - (2 * var(--track-internal-padding)))
    );
  }
  /* Scoped styles specific to LoginView */
  .login-view-container {
    width: 100%;
    min-height: 100%; /* Ensure it takes full viewport height */
    margin-top: 0;
    display: flex; /* Use flex to center content */
    flex-direction: column;
    justify-content: start; /* Vertically center */
    align-items: center; /* Horizontally center */
    /* background-image: url('/src/assets/login-bg.jpg'); */ /* Ensure path is correct if used */
    background-size: cover; /* Changed from contain for full coverage */
    background-position: center; /* Center the background */
    background-repeat: no-repeat;
    background-color: #021130;
    background-image: url('/images/starsbg.png');
    background-size: 120% 120%;
    background-origin: border-box;
    background-position: center;
    background-repeat: no-repeat;
    height: 100vh;
    padding: 20px; /* Add some padding for smaller screens */
    box-sizing: border-box;
  }

  .wrapper {
    /* Removed height: 100vh and width: 80vw to let content size itself within login-view-container */
    /* max-width: 520px; Already handled by parent */
    width: 100%; /* Take full width of the centered container */
    /* margin: auto; */
    display: flex;
    flex-direction: column;
    justify-content: start; /* Center flip card vertically if space allows */
    align-items: center;
    color: white; /* Assuming default text color is white based on original */
  }

  .logo-main {
    width: 70%;
    /* margin-top: 2rem; Vuetify mt-8 is usually 2rem */
    /* margin-bottom: 2rem; Add some space below logo */
  }

  .auth-error-message {
    background-color: rgba(255, 0, 0, 0.1);
    color: red;
    padding: 10px;
    border-radius: 5px;
    margin-bottom: 15px;
    border: 1px solid red;
    text-align: center;
    width: 100%;
    max-width: 420px; /* Match form width */
  }

  .loading-indicator {
    color: #fff;
    margin-bottom: 15px;
  }

  /* Flip card styles from the original component */
  .switch {
    transform: translateY(0); /* Adjusted from -200px, let flexbox handle positioning */
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 30px;
    width: 50px;
    height: 20px;
    margin-top: 2rem; /* Add some margin above the switch */
    margin-bottom: 2rem;
  }

  .card-side::before {
    position: absolute;
    content: 'Log in';
    left: -70px;
    top: 0;
    width: 200px;
    text-decoration: underline;
    color: var(--font-color, #fefefe); /* Added fallback */
    font-weight: 600;
    /* content: "Log in"; ... etc. */
    z-index: 1; /* Above the card, below the slider */
  }

  .card-side::after {
    position: absolute;
    content: 'Sign up';
    left: 70px;
    top: 0;
    width: 200px;
    text-decoration: none;
    color: var(--font-color, #fefefe); /* Added fallback */
    font-weight: 600;
    position: absolute;
    /* content: "Sign up"; ... etc. */
    z-index: 1; /* Above the card, below the slider */
  }

  .toggle {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    box-sizing: border-box;
    border-radius: 5px;
    border: 2px solid var(--main-color);
    box-shadow: 4px 4px var(--main-color);
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--bg-color);
    transition: 0.3s;
    position: absolute;
    /* cursor: pointer; ... etc. */
    z-index: 2; /* Ensure slider is on top for interaction and visibility */
  }

  .slider:before {
    box-sizing: border-box;
    position: absolute;
    content: '';
    height: 20px;
    width: 20px;
    border: 2px solid var(--main-color);
    border-radius: 5px;
    left: -2px;
    bottom: 2px;
    background-color: var(--bg-color);
    box-shadow: 0 3px 0 var(--main-color);
    transition: 0.3s;
  }

  .toggle:checked + .slider {
    background-color: var(--input-focus);
  }

  .toggle:checked + .slider:before {
    transform: translateX(30px);
  }

  .toggle:checked ~ .card-side:before {
    text-decoration: none;
  }

  .toggle:checked ~ .card-side:after {
    text-decoration: underline;
  }
  /* Logic for toggle moved to JS for direct style manipulation for simplicity */
  /* .toggle:checked + .slider { background-color: var(--input-focus, #2d8cf0); } */
  /* .toggle:checked + .slider:before { transform: translateX(30px); } */
  /* .toggle:checked ~ .card-side:before { text-decoration: none; } */
  /* .toggle:checked ~ .card-side:after { text-decoration: underline; } */

  .flip-card__inner {
    width: 320px; /* Take full width of its parent label */
    max-width: 420px; /* Max width for the form area */
    height: auto; /* Let content define height, was 350px */
    min-height: 380px; /* Ensure enough space for inputs */
    position: relative;
    background-color: transparent;
    perspective: 1000px;
    text-align: center;
    transition: transform 0.8s;
    transform-style: preserve-3d;
    margin-top: 16px;
    position: relative; /* This should already be present */
    z-index: 0;
  }

  .flip-card__front,
  .flip-card__back {
    box-sizing: border-box; /* Added for better padding control */
    width: 100%;

    justify-content: center;
    align-items: center;
    /* max-width: 420px; /* Let parent control max-width */
    padding: 20px; /* Unified padding */
    position: absolute;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center; /* Center form content */
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    background: var(--bg-color, #1f2937); /* Slightly lighter dark for card */
    gap: 15px; /* Adjusted gap */
    border-radius: 8px; /* Softer radius */
    border: 1px solid var(--main-color, #b954f3); /* Thinner border */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); /* Softer shadow */
  }

  .flip-card__back {
    transform: rotateY(180deg);
  }

  .flip-card__form {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px; /* Adjusted gap */
    width: 100%; /* Form takes full width of card */
  }

  .title {
    margin-bottom: 15px; /* Adjusted margin */
    font-size: 24px; /* Slightly smaller */
    font-weight: 700; /* Adjusted weight */
    text-align: center;
    color: var(--font-color, #fefefe);
  }

  .flip-card__input {
    width: 100%; /* Full width inputs */
    /* max-width: 300px;  */
    height: 45px; /* Slightly taller */
    border-radius: 5px;
    border: 2px solid var(--main-color, #b954f3);
    background-color: var(--bg-color-input, #2c3748); /* Different input bg */
    box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.2); /* Inset shadow */
    font-size: 16px;
    font-weight: 500;
    color: var(--font-color, #fefefe);
    padding: 5px 15px; /* More padding */
    outline: none;
    transition: border-color 0.3s;
  }

  .flip-card__input::placeholder {
    color: var(--font-color-sub, #7e7e7e);
    opacity: 0.8;
  }

  .flip-card__input:focus {
    border-color: var(--input-focus, #2d8cf0); /* Use border-color for focus */
  }

  .flip-card__btn {
    margin-top: 15px; /* Adjusted margin */
    width: auto; /* Let content define width */
    min-width: 150px; /* Minimum width */
    padding: 10px 20px; /* Padding for button */
    height: 45px;
    border-radius: 5px;
    border: 2px solid var(--main-color, #b954f3);
    background-color: var(--main-color, #b954f3); /* Button bg same as border */
    box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.2); /* Softer shadow */
    font-size: 16px;
    font-weight: 600;
    color: var(--font-color-btn, #fefefe); /* Ensure button text color is set */
    cursor: pointer;
    transition:
      background-color 0.3s,
      box-shadow 0.3s,
      transform 0.1s;
  }
  .flip-card__btn:hover {
    background-color: darken(var(--main-color, #b954f3), 10%); /* Darken on hover */
  }
  .flip-card__btn:active {
    box-shadow: 0px 0px var(--main-color, #b954f3);
    transform: translate(2px, 2px); /* Slightly less movement */
  }
  .flip-card__btn:disabled {
    background-color: #555;
    border-color: #444;
    color: #888;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }

  .social-login-divider {
    margin: 15px 0;
    color: var(--font-color-sub, #7e7e7e);
    text-align: center;
    width: 100%;
  }
  .google-signin-container {
    /* display: flex;
    min-width: 100%;
    min-height: 60px;
    justify-content: center;
    align-items: center; */
    /* width: 100%;
    height: 40%; */
    /* margin-top: 10px; */
  }

  /* CSS Variables for theming (optional, but good practice) */
  :root {
    --input-focus: #4a90e2; /* Example: A lighter blue */
    --font-color: #e0e0e0; /* Light gray for text */
    --font-color-sub: #a0a0a0; /* Medium gray for subtext/placeholders */
    --bg-color: #1e2a3b; /* Dark blue-gray background */
    --bg-color-input: #2c3a4b; /* Slightly lighter for inputs */
    --main-color: #6c63ff; /* Example: A vibrant purple */
    --font-color-btn: #ffffff;
  }
</style>
