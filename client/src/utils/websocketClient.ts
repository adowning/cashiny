// import { getToken } from "@/utils/authUtil";
import { IEventManagerService, useEventManager } from '@/composables/EventManager';
import { useAuthStore } from '@/stores/auth';
import { INotificationStore, useNotificationStore } from '@/stores/notifications';
import { UseWebSocketReturn, useWebSocket, watchTriggerable } from '@vueuse/core';
import destr from 'destr';

export interface WsMessage {
  type: string;
  payload: any;
  meta: any;
}

export interface DatabaseUpdate extends WsMessage {
  payload: {
    columnNameChanged: string[];
    data: any;
    operation: 'UPDATE' | 'INSERT' | 'DELETE';
    recordId: string;
    table: string;
  };
}

export class WebSocketClient {
  private static instance: WebSocketClient;
  public wsClient: UseWebSocketReturn<any> | null = null;
  private reconnectCount = 0;
  private readonly maxReconnectCount = 3;
  private readonly reconnectDelay = 3000;
  private timer: NodeJS.Timeout | null = null;
  static ticker: NodeJS.Timeout | null = null;
  private tick = 0;
  private messageQueue: any[] = [];
  private forceClose = false;
  private isReconnecting = false;
  private eventManager: IEventManagerService;
  private notificationStore: INotificationStore;
  static tickerStarted = false;
  private static instanceCount: number = 0;
  private emitter: IEventManagerService;

  private constructor() {
    WebSocketClient.instanceCount++;
    WebSocketClient.ticker = null;
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleOnline = this.handleOnline.bind(this);
    this.handleOffline = this.handleOffline.bind(this);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    this.eventManager = useEventManager();
    this.notificationStore = useNotificationStore();
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
    this.emitter = useEventManager();
  }

  static getInstanceCount(): number {
    return WebSocketClient.instanceCount;
  }

  public static getInstance(): WebSocketClient {
    if (!WebSocketClient.instance) {
      WebSocketClient.instance = new WebSocketClient();
    }
    return WebSocketClient.instance;
  }

  public connect(): void {
    // const authStore = useAuthStore();

    if (this.wsClient && (this.wsClient?.status.value === 'OPEN' || this.isReconnecting)) return;

    try {
      const auth = useAuthStore();
      const token = auth.accessToken ? auth.accessToken : null;
      if (!token) {
        console.warn('WebSocket: no token');
        return;
      }

      this.forceClose = false;
      this.close();
      const wsURL = `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${
        import.meta.env.VITE_HONO_WEBSOCKET_URL
      }/ws?token=${encodeURIComponent(token)}`;

      // this.ws = new WebSocket(wsURL);
      this.wsClient = useWebSocket(wsURL, {
        immediate: false,
        heartbeat: {
          interval: 10000,
          pongTimeout: 15000,
          message: JSON.stringify({ type: 'PING', meta: {}, payload: {} }),
          responseMessage() {
            return JSON.stringify({ type: 'PONG', meta: {}, payload: {} });
          },
        },
        autoReconnect: {
          retries: 3,
          delay: 1000,
          onFailed: () => {
            alert('Failed to connect WebSocket after 3 retries');
          },
        },
      });
      this.initEventHandlers();
    } catch (error) {
      console.error('WebSocket: initEventHandlers', error);
    }
  }

  public initEventHandlers(): void {
    if (!this.wsClient) return;

    this.wsClient.open = () => {
      this.reconnectCount = 0;
      // this.startHeartbeat();
      this.flushMessageQueue();
      console.log('socket count ', WebSocketClient.getInstanceCount());
      if (WebSocketClient.tickerStarted == false)
        WebSocketClient.ticker = setInterval(() => {
          this.tick = this.tick + 1;
          // console.log(this.tick);
        }, 1000);
      WebSocketClient.tickerStarted = true;
      // 发送连接成功事件
      this.eventManager.emit('wsConnected', true);
    };
    watchTriggerable(this.wsClient.open, (open) => {
      console.log('open up buttercup ', open);
    });
    this.wsClient.data.value = (event: MessageEvent) => {
      console.log(event);
      try {
        const _message: any = destr(event.data);
        const message: WsMessage = {
          type: _message.type,
          meta: _message.meta,
          payload: _message.payload,
        };
        // if (message.type === 'pong') return;
        this.handleMessage(message);
        // 使用专门的消息事件类型
        // this.eventManager.emit('wsMessage', message);
      } catch (e) {
        console.log(e);
      }
    };
    watchTriggerable(this.wsClient.data, (data) => {
      // console.log('we gotz that datas ', data);
      try {
        const _message: any = destr(data);
        const message: WsMessage = {
          type: _message.type,
          meta: _message.meta,
          payload: _message.payload,
        };
        // if (message.type === 'pong') return;
        this.handleMessage(message);
        // 使用专门的消息事件类型
        // this.eventManager.emit('wsMessage', message);
      } catch (e) {
        console.log(e);
      }
    });
    this.wsClient.close = (event) => {
      console.log('closing ....');
      this.handleClose(new CloseEvent('system', { code: event, reason: event?.toString() }));
      this.eventManager.emit('wsConnected', false);
    };
    watchTriggerable(this.wsClient.close, (close) => {
      console.log('fucker is trying to close on us! ', close);
    });
    watchTriggerable(this.wsClient.status, (status) => {
      console.log(status);
    });
    // this.ws.status.value = () => {
    //   console.error('WebSocket: onerror');
    //   this.eventManager.emit('wsError', 'onerror');
    //   this.reconnect();
    // };
  }

  private handleClose(event: CloseEvent): void {
    this.stopHeartbeat();

    if (event.wasClean) {
      console.log(`WebSocket: handleClose: ${event.code}`);
    } else {
      this.reconnect();
    }
  }

  private reconnect(): void {
    if (this.forceClose || this.isReconnecting) return;

    if (this.reconnectCount >= this.maxReconnectCount) {
      this.notificationStore.addNotification('error', 'WebSocket too many attempts');
      return;
    }

    this.isReconnecting = true;
    setTimeout(() => {
      this.reconnectCount++;
      this.connect();
      this.isReconnecting = false;
    }, this.reconnectDelay * this.reconnectCount);
  }

  // private startHeartbeat(): void {
  //   this.timer = setInterval(() => {
  //   this.send({ type: 'PING', meta: {}, payload: {} });
  //   }, 20000);
  // }

  private stopHeartbeat(): void {
    if (this.timer) {
      clearInterval(this.timer);
      WebSocketClient.ticker = null;
      this.timer = null;
    }
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.send(message);
    }
  }

  public send(data: any): void {
    if (this.wsClient?.status.value === 'OPEN') {
      this.wsClient.send(JSON.stringify(data));
    } else {
      this.messageQueue.push(data);
    }
  }

  public close(): void {
    this.forceClose = true;

    if (this.timer) {
      this.stopHeartbeat();
    }

    if (this.wsClient) {
      this.wsClient.close();
      this.wsClient = null;
    }
  }

  private handleVisibilityChange(): void {
    if (document.visibilityState === 'visible') {
      if (!this.wsClient || this.wsClient.status.value !== 'OPEN') {
        this.connect();
      }
    }
  }

  private handleOnline(): void {
    console.log('handleOnline');
    if (!this.wsClient || this.wsClient.status.value !== 'OPEN') {
      this.connect();
    }
  }

  private handleOffline(): void {
    console.log('handleOffline');
    this.close();
  }

  public destroy(): void {
    this.close();
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }
  private resetCountdown(): void {
    this.tick = 0;
    // console.log('instanceCount ', WebSocketService.instanceCount);
    // this.ticker?.refresh();
  }
  // private handleDatabaseUpdate(message: DatabaseUpdate): void {
  //   switch (message.payload.table) {
  //     case 'users':
  //       // this.userStore.updateUserByParam(message.payload.columnNameChanged, message.payload.data);
  //       break;
  //     case 'Profile':
  //       // this.profileStore.updateProfile(message.payload.id, message.payload.data);
  //       break;
  //   }
  // }
  private handleMessage(message: WsMessage): void {
    console.log('handleMessage', message);
    this.emitter.emit('wsMessage', message);

    // console.log('handleMessage', this.tick);
    // switch (message.type) {
    //   case 'PONG':
    //     this.resetCountdown();
    //     break;
    //   case 'DATABASE_UPDATE':
    //     // this.handleDatabaseUpdate(message);
    //     break;
    //   default:
    //     console.log(message);
    // }
  }
}
