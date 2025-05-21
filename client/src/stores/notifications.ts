// src/stores/notificationStore.ts
import {
  computed,
  ref, // type Ref,
  // type ComputedRef,
  // RendererElement,
  // RendererNode,
} from 'vue';

import { defineStore } from 'pinia';

// Define the structure of a notification (Your existing interface - unchanged)
export interface Notification {
  id: number;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration: number;
}

// --- Interface for the Notification Store INSTANCE ---
/**
 * Defines the structure of the publicly accessible notification store instance,
 * reflecting automatically unwrapped refs and computed properties.
 */
export interface INotificationStore {
  addComplexNotification: (
    type: Notification['type'] | undefined,
    message: any,
    duration?: number,
  ) => void;
  /**
   * State: An array holding all currently active notification objects.
   * This is the automatically unwrapped value of the internal 'notifications' ref.
   * To maintain reactivity in components when destructuring, use `storeToRefs`.
   */
  notifications: Notification[]; // <<<< CORRECTED: Unwrapped type

  /**
   * Getter: A reactive array of the currently active notifications.
   * This is the automatically unwrapped value of the internal 'activeNotifications' computed property.
   */
  activeNotifications: Notification[]; // <<<< CORRECTED: Unwrapped type

  /**
   * Adds a new notification to the store.
   * (Action signature remains the same)
   */
  addNotification: (
    type: Notification['type'] | undefined,
    message: string,
    duration?: number,
  ) => void;

  /**
   * Removes a notification from the store based on its unique ID.
   * (Action signature remains the same)
   */
  removeNotification: (id: number) => void;
}

// --- Store Definition ---
// We define the setup function. Pinia will infer its return type.
// Then we type the exported store hook to ensure it returns our INotificationStore instance type.
export const useNotificationStore: () => INotificationStore = defineStore('notifications', () => {
  // Inside the setup function, we work with actual Refs and ComputedRefs
  const notifications_ref = ref<Notification[]>([]); // Internal ref
  const activeNotifications_computed = computed(() => notifications_ref.value); // Internal computed

  function addNotification(
    type: Notification['type'] = 'info',
    message: string,
    duration: number = 5000,
  ) {
    const newNotification: Notification = {
      id: Date.now(),
      message,
      type,
      duration,
    };
    notifications_ref.value.push(newNotification);
    setTimeout(() => {
      removeNotification(newNotification.id);
    }, duration);
  }
  function addComplexNotification(
    type: Notification['type'] = 'info',
    message: any,
    duration: number = 5000,
  ) {
    const m = message.toString();
    const newNotification: Notification = {
      id: Date.now(),
      message: m,
      type,
      duration,
    };
    notifications_ref.value.push(newNotification);
    setTimeout(() => {
      removeNotification(newNotification.id);
    }, duration);
  }
  function removeNotification(id: number) {
    notifications_ref.value = notifications_ref.value.filter(
      (notification) => notification.id !== id,
    );
  }

  // The setup function returns an object with Refs, ComputedRefs, and functions
  return {
    notifications: notifications_ref, // Exposing the ref
    activeNotifications: activeNotifications_computed, // Exposing the computed ref
    addNotification,
    removeNotification,
    addComplexNotification,
  };
});
