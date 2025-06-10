<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-900">GudangKita</h1>
          </div>

          <nav class="hidden md:flex space-x-8">
            <router-link
              v-if="authStore.isUser"
              to="/dashboard/user"
              class="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              :class="{ 'text-primary bg-primary/10': $route.name === 'user-dashboard' }"
            >
              Dashboard
            </router-link>
            <router-link
              v-if="authStore.isUser"
              to="/request"
              class="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              Request Barang
            </router-link>

            <router-link
              v-if="authStore.isAdmin"
              to="/dashboard/admin"
              class="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              :class="{ 'text-primary bg-primary/10': $route.name === 'admin-dashboard' }"
            >
              Dashboard
            </router-link>
            <router-link
              v-if="authStore.isAdmin"
              to="/admin/requests"
              class="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              Request Management
            </router-link>
            <router-link
              v-if="authStore.isAdmin"
              to="/admin/inventory"
              class="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              Inventory Management
            </router-link>
            <router-link
              v-if="authStore.isAdmin"
              to="/reports"
              class="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              Reports
            </router-link>
          </nav>

          <div class="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="ghost" class="flex items-center space-x-2">
                  <span class="text-sm font-medium">{{ authStore.user?.username }}</span>
                  <Badge variant="secondary" class="text-xs">
                    {{ authStore.user?.role }}
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem @click="handleLogout"> Logout </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const router = useRouter()
const authStore = useAuthStore()

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>
