<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Daftar Akun Baru</h2>
        <p class="mt-2 text-center text-sm text-gray-600">Buat akun baru untuk mengakses sistem</p>
      </div>

      <Card class="p-6">
        <form @submit.prevent="handleRegister" class="space-y-6">
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
              <Label for="email">Email</Label>
              <Input
                id="email"
                v-model="form.email"
                type="email"
                placeholder="Masukkan email"
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

            <div>
              <Label for="confirmPassword">Konfirmasi Password</Label>
              <Input
                id="confirmPassword"
                v-model="form.confirmPassword"
                type="password"
                placeholder="Konfirmasi password"
                required
                class="mt-1"
              />
            </div>

            <div>
              <Label for="role">Role</Label>
              <select
                id="role"
                v-model="form.role"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                required
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <Alert v-if="error" variant="destructive">
            <AlertDescription>
              {{ error }}
            </AlertDescription>
          </Alert>

          <Alert v-if="success" variant="default" class="border-green-200 bg-green-50">
            <AlertDescription class="text-green-800">
              {{ success }}
            </AlertDescription>
          </Alert>

          <Button type="submit" class="w-full" :disabled="loading">
            {{ loading ? 'Mendaftar...' : 'Daftar' }}
          </Button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Sudah punya akun?
            <router-link to="/login" class="font-medium text-primary hover:text-primary/80">
              Login di sini
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
const success = ref('')

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'user' as 'user' | 'admin',
})

async function handleRegister() {
  loading.value = true
  error.value = ''
  success.value = ''

  // Validate password confirmation
  if (form.password !== form.confirmPassword) {
    error.value = 'Password dan konfirmasi password tidak sama'
    loading.value = false
    return
  }

  // Validate password length
  if (form.password.length < 6) {
    error.value = 'Password minimal 6 karakter'
    loading.value = false
    return
  }

  try {
    const result = await authStore.register(form.username, form.password, form.email, form.role)

    if (result.success) {
      success.value = 'Registrasi berhasil! Anda akan dialihkan ke halaman login...'

      // Reset form
      form.username = ''
      form.email = ''
      form.password = ''
      form.confirmPassword = ''
      form.role = 'user'

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } else {
      error.value = result.error || 'Registrasi gagal'
    }
  } catch {
    error.value = 'Terjadi kesalahan sistem'
  } finally {
    loading.value = false
  }
}
</script>
