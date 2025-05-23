import { h } from 'vue'

import { IEventManagerService, useEventManager } from '@/composables/EventManager'
import { useNotificationStore } from '@/stores/notification.store'
import { ChatMessage } from '@cashflow/types'

// Message type definition
export interface WebSocketMessage {
  type: string
  data?: any
  [key: string]: any
}

// Message type mapping
const messageTypeMap: Record<string, { color: string; text: string }> = {
  connected: { color: 'success', text: '实时通信连接成功' },
  workflow_create: { color: 'warning', text: '新建工作流' },
  workflow_approve: { color: 'success', text: '工作流已审批' },
  workflow_reject: { color: 'error', text: '工作流已拒绝' },
  workflow_complete: { color: 'success', text: '工作流已完成' },
  workflow_transfer: { color: 'info', text: '工作流已转派' },
  chat: { color: 'primary', text: '新消息' },
  recall_notification: { color: 'info', text: '消息撤回提醒' },
}

// Initialize message handler
export function setupWebSocketHandlers(): void {
  const emitter: IEventManagerService = useEventManager()
  const notificationStore = useNotificationStore()
  // Handle WebSocket messages
  emitter.on('wsMessage', (message: WebSocketMessage) => {
    console.log('[WebSocket] 收到消息:', message)

    if (message.type === 'read_status_update') {
      return
    }

    // If it is a chat message, forward it directly to the chat component for processing
    if (message.type === 'text' || message.type === 'image' || message.type === 'file') {
      // 直接转发原始消息
      emitter.emit('chatMessage', message as ChatMessage)
      return
    }

    // Handle recall message notification
    if (message.type === 'recall_notification') {
      emitter.emit('recallMessage', {
        fromUserId: message.fromUserId,
        toUserId: message.toUserId,
        id: message.id,
      })
      return
    }

    const typeInfo = messageTypeMap[message.type] || {
      color: 'info',
      text: '系统消息',
    }

    notificationStore.addComplexNotification('info', {
      title: typeInfo.text,
      message: h('div', { class: 'flex flex-col gap-1' }, [
        h('div', { class: 'text-[var(--el-text-color-primary)]' }, message.title),
        h('div', { class: 'text-[var(--el-text-color-regular)] text-[13px]' }, message.content),
        message.instanceId &&
          h(
            'el-button',
            {
              type: 'primary',
              text: true,
              class: 'mt-1 !p-0 cursor-pointer',
              onClick: () => {
                // Mark message as read
                // readMessage({ messageId: message.id });
                // Close current notification
                // notification.close();

                if (['workflow_reject', 'workflow_complete'].includes(message.type)) {
                  // Jump to workflow details page
                  window.location.href = `/engine/instance/index?id=${message.instanceId}`
                } else {
                  // Jump to task details page
                  window.location.href = `/engine/todo/index?id=${message.instanceId}`
                }
              },
            },
            '查看详情'
          ),
      ]),
      type: typeInfo.color as any,
      duration: 5000,
      position: 'top-right',
      offset: 16,
    })
  })

  // Handle connection status changes
  emitter.on('wsConnected', (connected: boolean) => {
    if (connected) {
      console.log('WebSocket连接已建立')
    } else {
      console.log('WebSocket连接已断开')
    }
  })

  // Handle error
  emitter.on('wsError', (error: string) => {
    notificationStore.addNotification('error', error)
  })
}

// Export message type mapping
export function getMessageTypeInfo(type: string) {
  return messageTypeMap[type] || { color: 'info', text: '系统消息' }
}
