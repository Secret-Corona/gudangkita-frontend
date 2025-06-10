<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          GudangKita - Sistem Manajemen Gudang
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">Silakan login untuk mengakses sistem</p>
      </div>

      <Card class="p-6">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div class="space-y-4">
            <div>
              <Label for="username">Username</Label>
              <Input
                id="username"
                v-model="form.username"
                type="text"
                placeholder="Masukkan username"
                required
                class="mt-1"
              />
            </div>

            <div>
              <Label for="password">Password</Label>
              <Input
                id="password"
                v-model="form.password"
                type="password"
                placeholder="Masukkan password"
                required
                class="mt-1"
              />
            </div>
          </div>

          <Alert v-if="error" variant="destructive">
            <AlertDescription>
              {{ error }}
            </AlertDescription>
          </Alert>

          <Button type="submit" class="w-full" :disabled="loading">
            {{ loading ? 'Logging in...' : 'Login' }}
          </Button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600 mb-2">
            Demo credentials:<br />
            <strong>Admin:</strong> admin / admin123<br />
            <strong>User:</strong> user1 / password123
          </p>
          <p class="text-sm text-gray-600">
            Untuk permintaan urgent tanpa login,
            <router-link
              to="/public-request"
              class="font-medium text-primary hover:text-primary/80"
            >
              klik di sini
            </router-link>
          </p>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')

const form = reactive({
  username: '',
  password: '',
})

async function handleLogin() {
  loading.value = true
  error.value = ''

  try {
    const result = await authStore.login(form.username, form.password)

    if (result.success) {
      // Redirect based on user role
      if (authStore.isAdmin) {
        router.push('/dashboard/admin')
      } else {
        router.push('/dashboard/user')
      }
    } else {
      error.value = result.error || 'Login gagal'
    }
  } catch {
    error.value = 'Terjadi kesalahan sistem'
  } finally {
    loading.value = false
  }
}
</script>
