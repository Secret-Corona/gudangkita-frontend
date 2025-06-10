<template>
  <div
    v-if="authStore.isInitializing"
    class="min-h-screen flex items-center justify-center bg-gray-50"
  >
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
  <RouterView v-else />
</template>

<script setup lang="ts">
import { watch, onUnmounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { socketManager } from '@/lib/socket'

const authStore = useAuthStore()

// Watch for authentication changes to manage socket connection
watch(
  () => authStore.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) {
      // Connect to socket when user is authenticated
      socketManager.connect()

      // Join appropriate rooms based on user role
      if (authStore.isAdmin) {
        socketManager.joinRoom('admin')
      } else {
        socketManager.joinRoom('users')
      }
    } else {
      // Disconnect socket when user logs out
      socketManager.disconnect()
    }
  },
  { immediate: true },
)

// Clean up on app unmount
onUnmounted(() => {
  socketManager.disconnect()
})
</script>
