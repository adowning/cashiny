import { logToPage } from '@/utils/logger'
import { WebSocketClient } from '@/utils/websocketClient'
import { defineStore } from 'pinia'

import { useAuthStore } from './auth.store'

export const useSocketStore = defineStore('socket', () => {
  // --- State ---
  // Maybe a state to track connection status if needed
  // const isConnected = ref(false);

  // --- Actions ---
  function connectWebSocket() {
    logToPage('info', 'Attempting to connect WebSocket...')
    const authStore = useAuthStore()
    const token = authStore.accessToken

    if (token) {
      // WebSocketService.getInstance().connect(token); // Pass token if needed for connection/authentication
      WebSocketClient.getInstance().connect() // Assuming token is handled internally or not needed for initial connect
      // isConnected.value = true; // Update state
    } else {
      logToPage('warn', 'Cannot connect WebSocket, no token available.')
    }
  }

  function disconnectWebSocket() {
    logToPage('info', 'Attempting to disconnect WebSocket...')
    WebSocketClient.getInstance().close()
    // isConnected.value = false; // Update state
  }

  // --- Subscriptions ---
  function startWatchToSubscribe() {
    const authStore = useAuthStore()
    watch(
      () => authStore.initialAuthCheckComplete, // Source to watch
      (newIsAuthenticated, oldIsAuthenticated) => {
        console.log(
          `[SocketStore] Auth state changed: ${oldIsAuthenticated} -> ${newIsAuthenticated}`
        )
        if (newIsAuthenticated && authStore.accessToken) {
          connectWebSocket()
        } else {
          disconnectWebSocket()
        }
      },
      { immediate: false } // `immediate: true` would run this on store initialization
      // Set to true if you want to attempt connection immediately if already authenticated
    )
  }

  // authStore.$subscribe((mutation, state) => {
  //   if (mutation.storeId === "auth") {
  //     const isAuthenticated = state.sessionState?.token;

  //     if (isAuthenticated) {
  //       logToPage(
  //         "debug",
  //         "Socket store reacting to authStateChange: Authenticated. Connecting WebSocket..."
  //       );
  //       connectWebSocket();
  //     } else {
  //       logToPage(
  //         "debug",
  //         "Socket store reacting to authStateChange: Unauthenticated. Disconnecting WebSocket..."
  //       );
  //       disconnectWebSocket();
  //     }
  //   }
  // });

  return {
    startWatchToSubscribe,
    // Expose state if needed
    // isConnected,
    // Expose actions if needed for manual control (less common)
    // connectWebSocket,
    // disconnectWebSocket,
  }
})

// import { defineStore } from "pinia";
// import { ref, computed } from "vue";
// // import Cookies from 'js-cookie'
// // import { CacheKey } from '@/utils/cache-key'
// import { NETWORK_CONFIG } from "@cashflow/types";
// // import { Network } from '@/net/Network'
// // import { Network as Network1 } from '@/net/Network1'
// import { useAuthStore } from "./auth";
// // import { WSStatus } from 'zilaws-client'
// // import { useCashflow } from '@/libs/cashflowClient/vue'
// // import { useCashflowSocket } from '@/composables/useZilaWebsocket'
// import { useUserStore } from "./user";
// // import { WSStatus } from '@/services/wsClient'
// import {
//   initializeWebSocket,
//   useCashflowSocket,
// } from "@/composables/useZilaWebsocket";
// // import { NETWORK } from '@/utils/socket/NetworkCfg'
// // import { Network } from '@/utils/socket/network'
// // export const createWebSocket = (route: string) => {
// //   console.log(`${import.meta.env.VITE_SOKET_URL}${route}?token=${Cookies.get(CacheKey.TOKEN)}`)
// //   const socket = new WebSocket(
// //     `wss://mobile.cashflowcasino.com/api/setup?token=mock_token`, //?token=${Cookies.get(CacheKey.TOKEN)}`,
// //     // `${import.meta.env.VITE_SOKET_URL}${route}?token=${Cookies.get(CacheKey.TOKEN)}`,
// //   )
// //   return socket
// // }
// export interface GetUserBalance {
//   bal: string | number;
//   cur: string;
//   mt: number;
// }
// export const useSocketStore = defineStore("socket", () => {
//   // State
//   const success = ref<boolean>(false);
//   const cashflowSocket = ref();
//   const errMessage = ref<string>("");
//   const connectionStatus = ref<WSStatus>(WSStatus.CLOSED);
//   const socket = ref<any>(null);
//   const socketBalance = ref<GetUserBalance>({
//     bal: "",
//     cur: "",
//     mt: 0,
//   });
//   // Getters
//   const getSuccess = computed(() => success.value);
//   const getErrMessage = computed(() => errMessage.value);
//   const getSocketBalance = computed(() => socketBalance.value);
//   // Actions
//   function setSuccess(newSuccess: boolean) {
//     success.value = newSuccess;
//   }
//   function setErrorMessage(newMessage: string) {
//     errMessage.value = newMessage;
//   }
//   function setSocketBalance(newSocketBalance: GetUserBalance) {
//     socketBalance.value = newSocketBalance;
//   }
//   // async function connected(x: any) {
//   //   console.log('connected ', x)
//   // }
//   // socket connect check
//   async function dispatchSocketConnect() {
//     console.log("dispatchSocketConnect");
//     setSuccess(false);
//     const userStore = useUserStore();
//     const route: string = NETWORK_CONFIG.WEB_SOCKET.SOCKET_CONNECT;
//     console.log(route);
//     // const network: Network = Network.getInstance()
//     // const network1: Network1 = Network1.getInstance()
//     // network1.connect(connected)
//     // console.log('x')
//     // socket.value = createWebSocket(route)
//     if (userStore.currentUser == undefined) {
//       console.log("no currentuser returning ");
//       return;
//     }
//     await initializeWebSocket(route, userStore.currentUser.id as string);
//     const cashflowSocket = useCashflowSocket();
//     console.log(cashflowSocket);
//     if (socket.value) {
//       socket.value.onopen = handleOpen;
//       socket.value.onmessage = handleMessage;
//       socket.value.onerror = handleError;
//       socket.value.onclose = handleClose;
//     }
//   }
//   function handleOpen() {
//     const authStore = useAuthStore();
//     console.log("WebSocket connection established");
//     authStore.setIsAuthenticated(true);
//   }
//   function handleMessage(event: MessageEvent) {
//     // console.log('Received message:', event.data)
//     try {
//       const response = JSON.parse(event.data);
//       console.log(response);
//       if (response.onFundMessage !== undefined) {
//         console.log(response.onFundMessage.mt);
//         switch (response.onFundMessage.mt) {
//           case 101:
//             setSocketBalance(response.onFundMessage.data as GetUserBalance);
//             break;
//         }
//       }
//     } catch (error) {
//       console.error("Error parsing WebSocket message:", error);
//     }
//   }
//   function handleError(event: Event) {
//     console.error("WebSocket error:", event);
//   }
//   function handleClose(event: CloseEvent) {
//     console.log("WebSocket connection closed:", event);
//   }
//   return {
//     success,
//     errMessage,
//     socket,
//     socketBalance,
//     getSuccess,
//     connectionStatus,
//     getErrMessage,
//     getSocketBalance,
//     setSuccess,
//     setErrorMessage,
//     setSocketBalance,
//     dispatchSocketConnect,
//     handleOpen,
//     handleMessage,
//     handleError,
//     handleClose,
//   };
// });
// // // import { useUserStore } from '@/stores/modules/user';
// // import { eventBus } from '@/composables/eventBus';
// // import { CHANNEL_DEFAULT, CHANNEL_KICK_OFF, UPGRADE_CHANNEL } from '@/utils/constants';
// // import { defineStore } from 'pinia';
// // // import { LOGIN_URL } from '@/config';
// // import { ref } from 'vue';
// // // import { ElMessageBox } from 'element-plus';
// // import { useUserStore } from '@/stores/user';
// // // 是否使用socket 当 import.meta.env.VITE_SOCKET_URL 不为空时，启用websocket
// // const useSocket = Object.prototype.hasOwnProperty.call(import.meta.env, 'VITE_SOCKET_URL');
// // const socketUrl = import.meta.env.VITE_SOCKET_URL;
// // const MAX_RECONNECT_COUNT = 10;
// // /**
// //  * 使用socket
// //  * @param url
// //  * @returns {{init: (function(): void), socket: null}}
// //  */
// // export const useSocketStore = defineStore('socket', () => {
// //   /**
// //    * 定义socket变量
// //    *
// //    * @type {WebSocket|null}
// //    */
// //   const socket = ref<WebSocket | null>(null);
// //   const canReconnect = ref(true);
// //   const reconnectCount = ref(0);
// //   const _onOpen = () => {
// //     canReconnect.value = true;
// //     reconnectCount.value = 0;
// //   };
// //   const _onMessage = (event: MessageEvent) => {
// //     const { data } = event;
// //     const userStore = useUserStore();
// //     // const authStore = useAuthStore();
// //     try {
// //       const res = JSON.parse(data);
// //       switch (res.channel) {
// //         case CHANNEL_DEFAULT:
// //           break;
// //         case CHANNEL_KICK_OFF:
// //           close();
// //           // 1.清除 Token
// //           // userStore.clear();
// //           userStore.$reset()
// //           // authStore.clear();
// //           console.log('kicked off')
// //           // ElMessageBox.alert('您已经被强制踢下线了！', '温馨提示', {
// //           //   confirmButtonText: '确定',
// //           //   type: 'warning',
// //           //   callback: () => {
// //           //     // 2.重定向到登陆页
// //           //     router.replace(LOGIN_URL);
// //           //   }
// //           // });
// //           break;
// //         case UPGRADE_CHANNEL:
// //           close();
// //           // 1.清除 Token
// //           // userStore.clear();
// //           // authStore.clear();
// //           // authStore.clear();
// //           console.log('UPGRADE_CHANNEL')
// //           // ElMessageBox.alert(res.data + '！', '温馨提示', {
// //           //   confirmButtonText: '确定',
// //           //   type: 'warning',
// //           //   callback: () => {
// //           //     // 2.重定向到登陆页
// //           //     router.replace(LOGIN_URL);
// //           //   }
// //           // });
// //           break;
// //         default:
// //           eventBus.emit(`socket.${res.channel}`, res.data);
// //       }
// //       console.log('接收到的消息：', res);
// //     } catch (e) {
// //       /* empty */
// //     }
// //   };
// //   const _onError = (event: Event) => {
// //     eventBus.emit('socket.error', event);
// //   };
// //   const _onClose = () => {
// //     socket.value = null;
// //     if (canReconnect.value) {
// //       handleReconnect();
// //     }
// //   };
// //   const handleReconnect = () => {
// //     let timeout;
// //     if (reconnectCount.value < MAX_RECONNECT_COUNT) {
// //       timeout = Math.min(10000 * Math.pow(2, reconnectCount.value), 30000); // 指数退避算法
// //     } else {
// //       timeout = 60000; // 超过最大次数次后，每分钟重试一次
// //     }
// //     setTimeout(() => {
// //       reconnectCount.value++;
// //       open();
// //     }, timeout);
// //   };
// //   /**
// //    * 初始化开启socket
// //    */
// //   const open = () => {
// //     if (!useSocket) return;
// //     if (socket.value) return;
// //     const userStore = useUserStore();
// //     // 建立WebSocket连接
// //     const webSocket = new WebSocket(socketUrl, [userStore.token]);
// //     const { status, data, send, open, close } = useWebSocket(socketUrl, {
// //       autoReconnect: {
// //         retries: 2,
// //         delay: 1000,
// //         onFailed() {
// //           Message.error('连接失败,请去GrasscuttersWebDashboard查看处理方法')
// //           localStorage.removeItem("WSS")
// //         },
// //       },
// //       // 监听WebSocket事件
// //       webSocket.onopen = _onOpen;
// //       webSocket.onmessage = _onMessage;
// //       webSocket.onerror = _onError;
// //       webSocket.onclose = _onClose;
// //       // 连接时处理
// //       socket.value = webSocket;
// //     };
// //     /**
// //      * 关闭socket
// //      */
// //     const close = () => {
// //       if (!useSocket) return;
// //       if (!socket.value) return;
// //       canReconnect.value = false;
// //       reconnectCount.value = 0;
// //       socket.value.close();
// //       socket.value = null;
// //     };
// //     const send = (data: any, channel: string = CHANNEL_DEFAULT) => {
// //       if (!socket.value || socket.value.readyState !== 1) return;
// //       if (typeof data !== 'object') {
// //         data = { data };
// //       }
// //       const msgData = {
// //         channel,
// //         data
// //       };
// //       socket.value.send(JSON.stringify(msgData));
// //     };
// //     return {
// //       open,
// //       send,
// //       close
// //     };
// //   });
// apps/client/src/stores/socket.ts (Example)
// Assuming this is your WebSocket client utility
