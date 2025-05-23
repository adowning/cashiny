import { onMounted, onUnmounted, readonly, ref } from 'vue'

import { type EventManagerInstance, useEventManager } from '@/composables/EventManager'
//
import { type WsMessage, useAppWebSocket } from '@/composables/useAppWebsocket'
//
import type { AnimationConfig, AnimationControlPayload, SpriteData } from '@/types/animation'

// Adjust path

// Store animation configurations - could be fetched or defined here
// For simplicity, we'll assume they are registered.
const animationRegistry = ref<Record<string, AnimationConfig>>({})
const loadedSpriteDataCache = ref<Record<string, SpriteData>>({}) // Cache for loaded sprite data JSONs

// Define event names for clarity
export const ANIMATION_PLAY_EVENT = 'animation:play'
export const ANIMATION_STOP_EVENT = 'animation:stop'
export const ANIMATION_STOP_ALL_EVENT = 'animation:stopAll' // New event

let eventManagerInstance: EventManagerInstance | null = null

export function useAnimationController() {
  if (!eventManagerInstance) {
    eventManagerInstance = useEventManager()
  }
  const {
    data: wsData,
    status: wsStatus,
    send: wsSend,
    open: wsOpen,
    close: wsClose,
  } = useAppWebSocket()

  const registerAnimation = async (config: AnimationConfig) => {
    animationRegistry.value[config.name] = config
    // Pre-fetch sprite data if not already cached
    if (config.spriteDataUrl && !loadedSpriteDataCache.value[config.spriteDataUrl]) {
      try {
        const response = await fetch(config.spriteDataUrl)
        if (!response.ok) throw new Error(`Failed to fetch ${config.spriteDataUrl}`)
        loadedSpriteDataCache.value[config.spriteDataUrl] = await response.json()
        console.log(`AnimationController: Loaded sprite data for ${config.name}`)
      } catch (error) {
        console.error(
          `AnimationController: Error pre-loading sprite data for ${config.name}:`,
          error
        )
      }
    }
  }

  const getAnimationConfig = (name: string): AnimationConfig | undefined => {
    return animationRegistry.value[name]
  }

  const getLoadedSpriteData = (url: string): SpriteData | undefined => {
    return loadedSpriteDataCache.value[url]
  }

  const handleWebSocketMessage = (message: WsMessage) => {
    if (!message || typeof message !== 'object') return

    // Adapt this to the actual message structure from your WebSocket server
    // Assuming message format: { type: "ANIMATION_CONTROL", payload: AnimationControlPayload }
    if (message.type === 'ANIMATION_CONTROL') {
      const controlPayload = message.payload as AnimationControlPayload
      if (controlPayload && controlPayload.name) {
        const config = getAnimationConfig(controlPayload.name)
        if (!config) {
          console.warn(
            `AnimationController: Received command for unknown animation "${controlPayload.name}"`
          )
          return
        }

        if (controlPayload.action === 'play') {
          console.log(
            `AnimationController: Emitting play for ${controlPayload.name} via WebSocket command`
          )
          eventManagerInstance?.emit(
            `${ANIMATION_PLAY_EVENT}:${controlPayload.name}`,
            controlPayload.options || {}
          )
        } else if (controlPayload.action === 'stop') {
          console.log(
            `AnimationController: Emitting stop for ${controlPayload.name} via WebSocket command`
          )
          eventManagerInstance?.emit(`${ANIMATION_STOP_EVENT}:${controlPayload.name}`)
        }
      }
    } else if (message.type === 'PLAY_ANIMATION' && message.payload?.name) {
      // Matching your earlier plan
      const animName = message.payload.name as string
      const options = message.payload.options || {}
      console.log(
        `AnimationController: Emitting play for ${animName} via WebSocket command (PLAY_ANIMATION)`
      )
      eventManagerInstance?.emit(`${ANIMATION_PLAY_EVENT}:${animName}`, options)
    } else if (message.type === 'STOP_ANIMATION' && message.payload?.name) {
      const animName = message.payload.name as string
      console.log(
        `AnimationController: Emitting stop for ${animName} via WebSocket command (STOP_ANIMATION)`
      )
      eventManagerInstance?.emit(`${ANIMATION_STOP_EVENT}:${animName}`)
    } else if (message.type === 'STOP_ALL_ANIMATIONS') {
      console.log(`AnimationController: Emitting stopAll via WebSocket command`)
      eventManagerInstance?.emit(ANIMATION_STOP_ALL_EVENT)
    }
  }

  // Subscribe to WebSocket messages when the controller is initialized
  // useAppWebSocket is a global state, so wsData will update globally.
  // We need to watch wsData for new messages.
  // The 'data' ref from useWebSocket is the last message. We need a way to process all messages.
  // The current `useAppWebsocket.ts` (from file upload) directly uses eventManager.emit('wsMessage', parsedMessage).
  // So, we should listen to 'wsMessage' from the eventManager.

  const processWsEventMessage = (rawMessage: any) => {
    // Assuming rawMessage is already the parsed WsMessage object
    // because useAppWebSocket emits it that way via eventManager.
    handleWebSocketMessage(rawMessage as WsMessage)
  }

  onMounted(() => {
    // Ensure WebSocket connection is managed (e.g., connected)
    // `useAppWebSocket` should handle its own connection logic.
    // We just need to listen for messages.
    eventManagerInstance?.on('wsMessage', processWsEventMessage, 'AnimationController')
    console.log(
      'AnimationController: Mounted and listening for WebSocket messages via EventManager.'
    )
  })

  onUnmounted(() => {
    eventManagerInstance?.off('wsMessage', processWsEventMessage, 'AnimationController')
    console.log('AnimationController: Unmounted, stopped listening for WebSocket messages.')
  })

  return {
    registerAnimation,
    getAnimationConfig,
    getLoadedSpriteData,
    // Exposing these for direct control if needed, though primary control is via EventManager
    playAnimation: (name: string, options?: any) =>
      eventManagerInstance?.emit(`${ANIMATION_PLAY_EVENT}:${name}`, options || {}),
    stopAnimation: (name: string) => eventManagerInstance?.emit(`${ANIMATION_STOP_EVENT}:${name}`),
    stopAllAnimations: () => eventManagerInstance?.emit(ANIMATION_STOP_ALL_EVENT),
    animationRegistry: readonly(animationRegistry),
    loadedSpriteDataCache: readonly(loadedSpriteDataCache),
  }
}
