// <script setup lang="ts">
//   import { useCashflowSocket } from "@/composables/useCashflowSocket";
//   import { ref } from "vue";
//   import { useRouter } from "vue-router";
//   import { useAppBarStore } from "@/stores/appBar.store";
//   import { useAuthStore } from "@/stores/auth";
//   // import { useUserStore } from '@/stores/user'
//   import { useSocketStore } from "@/stores/socket";
//   import { useDepositStore } from "@/@/stores/deposit.store";
//   // import { useCurrencyStore } from '@/stores/currency'

//   // const { api } = useRequest()
//   const shopOpen = ref(false);
//   // const affiliateOpen = ref(false)
//   const appBarStore = useAppBarStore();
//   const authStore = useAuthStore();
//   // const userStore = useUserStore()
//   // const currencyStore = useCurrencyStore()
//   const depositStore = useDepositStore();
//   const socketStore = useSocketStore();
//   const { connectionStatus } = useCashflowSocket();
//   const router = useRouter();
//   const settingsModal = ref(false);
//   const isAsideMobileExpanded = ref(false);
//   const isAsideLgActive = ref(false);
//   const isConnected = computed(() => connectionStatus.value === WSStatus.OPEN);
//   const orientation = useScreenOrientation();
//   const overlayScrimBackground = ref<string>("rgb(var(--v-theme-on-surface))");
//   // const { dispatchSocketConnect } = socketStore

//   watch(orientation, async (newOrienation) => {
//     console.log(newOrienation);
//   });

//   router.beforeEach(() => {
//     isAsideMobileExpanded.value = false;
//     isAsideLgActive.value = false;
//   });

//   eventBus.on("settingsModal", (val) => {
//     settingsModal.value = val;
//   });

//   watch(
//     connectionStatus,
//     (newValue) => {
//       console.log(newValue);
//       // // console.log('myItems changed:', newValue, oldValue)
//       // playerBalance.value = newValue.new_balance

//       // Perform actions based on the change
//     },
//     { deep: true }
//   );

//   // main blur effect
//   // const mainBlurEffectShow = computed(() => {
//   //   const { getMainBlurEffectShow } = storeToRefs(appBarStore)
//   //   return getMainBlurEffectShow.value
//   // })

//   // overlay scrim show
//   const overlayScrimShow = computed(() => {
//     const { getOverlayScrimShow } = storeToRefs(appBarStore);
//     return getOverlayScrimShow.value;
//   });
//   watch(overlayScrimShow, (newValue) => {
//     if (newValue) {
//       overlayScrimBackground.value = "transparent";
//     } else {
//       overlayScrimBackground.value = "rgb(var(--v-theme-on-surface))";
//     }
//     document.documentElement.style.setProperty(
//       "--background-color",
//       overlayScrimBackground.value
//     );
//   });

//   function runTest() {
//     // api.appControllerGetHealth.send()
//   }

//   const token = computed(() => {
//     const { getToken } = storeToRefs(authStore);
//     return getToken.value;
//   });
//   onMounted(async () => {
//     if (token.value != undefined) {
//       // await authStore.dispatchUserProfile() // Changed: Use authStore instance
//       // await userStore.dispatchUserBalance() // Changed: Use userStore instance
//       // await currencyStore.dispatchCurrencyList() // Changed: Use currencyStore instance
//       await socketStore.dispatchSocketConnect(); // Assuming this was a local function call, not a store action
//     }
//   });
// </script>

// <template>
//   <!-- <div v-if="!mobile" id="LayoutAuthenticated" class="overflow-hidden" style="height: 100vh"> -->
//   <div
//     v-if="isConnected"
//     style="
//       z-index: 999999;
//       position: absolute;
//       top: -2px;
//       right: -6px;
//       width: 25px;
//     "
//   >
//     <img src="/images/connection-high.png" h="10" w="15" @click="runTest" />
//   </div>
//   <div
//     v-else
//     style="
//       z-index: 999999;
//       position: absolute;
//       top: -2px;
//       right: -6px;
//       width: 25px;
//     "
//   >
//     <img src="/images/connection-off.png" h="10" w="15" />
//   </div>
//   <!-- <div id="LayoutAuthenticated" class="overflow-hidden"
//     :class="{ 'overflow-hidden lg:overflow-hidden': isAsideMobileExpanded }" style="max-height: 100vh"> -->
//   <LobbyBackground />
//   <!-- <div style="position: fixed" v-if="orientation === 'portrait-primary'"> -->
//   <!-- {{ orientation.orientation }} -->

//   <div style="position: fixed">
//     <div class="flex flex-col gap-3 h-screen">
//       <!-- <TopBar /> -->
//       <!-- <NavBar
//           :menu="menuNavBar"
//           :class="[(layoutAsidePadding, { 'ml-60 lg:ml-0': isAsideMobileExpanded })]"
//           @menu-click="menuClick"
//         ></NavBar> -->
//       <!-- </TopBar> -->
//       <!-- </div> -->

//       <!-- <div :class="[
//     layoutAsidePadding,
//     { 'ml-60 lg:ml-0': isAsideMobileExpanded },
//     orientation === 'portrait-primary' ? 'pt-13' : 'pt-0',
//   ]" class="min-h-screen w-screen transition-position lg:w-auto dark:text-slate-100"> -->
//       <div class="flex flex-col mt-12 w-screen">
//         <slot />
//       </div>
//       <!-- </div> -->
//       <SettingsView :has-cancel="false" :model-value="settingsModal" />
//       <!-- <OverlayLayer v-if="depositStore.shopOpen" :model-value="depositStore.shopOpen"> -->
//       <ShopView v-if="depositStore.shopOpen" />
//       <!-- </OverlayLayer> -->
//       <!-- <OverlayLayer v-if="depositStore.shopOpen" :model-value="depositStore.shopOpen">
//         <AffiliatePage v-if="depositStore.shopOpen" />
//       </OverlayLayer> -->
//     </div>
//   </div>
//   <!-- </div> -->
// </template>
// <style scoped></style>
