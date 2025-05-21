import { defineStore } from 'pinia'
import { ref } from 'vue'
// Assuming your database.types.ts is in src/types/
import type { Database } from '../types/database.types'

// Define a more specific type for the profile based on your Tables.profiles.Row
export type ProfileData = Database['public']['Tables']['profiles']['Row'] | null
// If you have multiple profiles per user, you might want:
// export type ProfileData = Database['public']['Tables']['profiles']['Row'][] | null;

export const useProfileStore = defineStore('profile', () => {
  // State
  // If a user can have multiple profiles, this would be an array.
  // For simplicity, assuming one active profile for now.
  const currentProfile = ref<ProfileData>(null)

  // Actions
  function setProfile(profileData: ProfileData) {
    currentProfile.value = profileData
  }

  function clearProfile() {
    currentProfile.value = null
  }

  return {
    currentProfile,
    setProfile,
    clearProfile,
  }
})
