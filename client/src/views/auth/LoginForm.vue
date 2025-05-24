<script setup lang="ts">
  import { ref, reactive, onMounted, onUnmounted, watch } from 'vue' // Import necessary Vue 3 APIs
  import { storeToRefs } from 'pinia' // Import storeToRefs
  import { useRouter } from 'vue-router' // For navigation (though handled elsewhere now)
  import MyPanel from './MyPanel.vue'
  // For navigation (though handled elsewhere now)
  // --- Composables & Stores ---
  const { id, css, load, unload, isLoaded } = useStyleTag('.foo { margin-top: 32px; }')
  const router = useRouter() // Router might still be needed for direct push in specific cases, but main auth nav is in App.vue
  const authStore = useAuthStore()
  const notificationStore = useNotificationStore()
  const {
    currentUser,
    isSignUpMode,
    authDialogVisible,
    isLoading: isAuthLoading, // Auth store's loading state
    isAuthenticated, // Auth store's authentication status
  } = storeToRefs(authStore)
  const formData = reactive({
    email: '',
    password: '',
    confirmPassword: '', // For sign-up
    username: '', // For sign-up
  })
  const showError = ref<boolean>(false)
  const { signInWithPassword, signUpNewUser, signInWithGoogleIdToken } = authStore
  const handleSignIn = async () => {
    if (!formData.username || !formData.password) {
      console.log('error in')
      notificationStore.addNotification('error', 'Please enter both email and password.')

      return
    }
    authStore.setAuthDialogVisible(false)
    // Use the store's loading state
    // componentLoading.value = true; // Removed
    const { success, error } = await signInWithPassword({
      username: formData.username,
      password: formData.password,
    })
    // componentLoading.value = false; // Removed

    // Notifications based on action result and store state
    if (success) {
      // Notification handled implicitly by the watch in this component (or App.vue)
      // that triggers on isAuthenticated = true, or show a generic success here
      // notificationStore.addNotification("success", "Successfully signed in!");
      // Navigation is handled elsewhere (App.vue or Navigation Guard)
    } else if (error) {
      showError.value = true
      // Error state is already set in the store and displayed in template or App.vue
      // Optionally add a notification here as well if needed
      notificationStore.addNotification('error', error.message || 'Sign in failed.')
      setTimeout(() => {
        showError.value = false
        window.location.reload()
      }, 3000)
    }
  }
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
          window.location.reload()
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
            auto_select: true, // Enable auto selection
            cancel_on_tap_outside: false, // Don't cancel when clicking outside
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

          // Show One Tap prompt
          ;(window as any).google.accounts.id.prompt((notification: any) => {
            if (notification.isNotDisplayed() || notification.isSkipped) {
              console.log(
                'One Tap prompt not displayed (reason: ' + notification.getNotDisplayedReason()
              )
            }
          })
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
        auto_select: true, // Enable auto selection
        cancel_on_tap_outside: false, // Don't cancel when clicking outside
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
      // Show One Tap prompt
      ;(window as any).google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkipped()) {
          console.log(
            'One Tap prompt not displayed (reason: ' + notification.getNotDisplayedReason()
          )
        }
      })
    }
  }

  // --- Component Lifecycle Hooks ---
  onMounted(() => {
    console.log('LoginView mounted.')

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
</script>
<template>
  <MyPanel title="Login">
    <form
      class="flip-card__form flex mx-4 px-4 mt-5 overflow-hidden"
      @submit.prevent="handleSignIn"
    >
      <input
        v-model="formData.username"
        type="username"
        placeholder="username"
        required
        class="flip-card__input"
        :disabled="isAuthLoading || showError"
      />
      <input
        v-model="formData.password"
        type="password"
        placeholder="Password"
        required
        autocomplete="current-password"
        class="flip-card__input"
        :disabled="isAuthLoading || showError"
      />
      <GlassButton
        type="submit"
        class="flip-card__btn mt-3"
        :disabled="isAuthLoading || showError"
        @click="handleSignIn"
      >
        Let's Go!
      </GlassButton>
    </form>

    <div class="flex flex-col">
      <div class="w-full flex justify-center glow">
        <div class="flex mt-8">OR</div>
      </div>
      <div
        id="googleSignInButtonContainer"
        class="google-signin-container flex mt-2 mx-3 px-3 justify-center"
      ></div>
    </div>

    <!-- <div class="w-full flex justify-center items-center my-2"> -->
    <!-- <div class="flex-grow border-t border-gray-600"></div> -->

    <!-- <div class="flex-grow border-t border-gray-600"></div> -->
    <!-- </div> -->
  </MyPanel>
</template>
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

  body {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }
  .login-view-container {
    width: 100%;
    height: 60%; /* Ensure it takes full viewport height */
    margin-top: 0;
    display: flex; /* Use flex to center content */
    flex-direction: column;
    justify-content: start; /* Vertically center */
    align-items: center; /* Horizontally center */
    /* background-image: url('/src/assets/login-bg.jpg'); */
    background-size: cover; /* Changed from contain for full coverage */
    background-position: center; /* Center the background */
    background-repeat: no-repeat;
    background-color: #021130;
    /* background-image: url('/images/starsbg.png'); */
    background-size: 120% 120%;
    background-origin: border-box;
    background-position: center;
    background-repeat: no-repeat;
    height: 100vh;
    padding: 20px; /* Add some padding for smaller screens */
    box-sizing: border-box;
  }

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
    /* justify-content: center; */
    /* align-items: center; Center button text */
    /* min-width: 150px; Minimum width */
    padding: 8px 20px;
    font-size: 16px;
    /* height: 45px; */
    /* box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.2); Softer shadow */
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
  /* Move knob to the right when sign up is active */
  .auth-mode-toggle.is-signup-active .switch-knob {
    transform: translateX(
      calc(var(--toggle-track-width) - var(--knob-size) - (2 * var(--track-internal-padding)))
    );
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
