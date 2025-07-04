import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface User {
  id: number
  username: string
  role: 'user' | 'admin'
  created_at: string
  updated_at?: string
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const isInitialized = ref(false)
  const isInitializing = ref(false)

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isUser = computed(() => user.value?.role === 'user')

  async function login(username: string, password: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      token.value = data.token
      user.value = data.user
      localStorage.setItem('token', data.token)
      isInitialized.value = true
      
      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Invalid credentials' 
      }
    }
  }

  async function register(username: string, password: string, email: string, role: 'user' | 'admin' = 'user') {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, email, role }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      return { success: true, user: data.user }
    } catch (error) {
      console.error('Registration error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Registration failed' 
      }
    }
  }

  async function fetchUser() {
    if (!token.value) return false

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token.value}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        user.value = data.user
        return true
      } else {
        logout()
        return false
      }
    } catch (error) {
      console.error('Fetch user error:', error)
      logout()
      return false
    }
  }

  async function initializeAuth() {
    // Prevent multiple simultaneous initialization attempts
    if (isInitialized.value || isInitializing.value) {
      return isAuthenticated.value
    }

    if (!token.value) {
      isInitialized.value = true
      return false
    }

    isInitializing.value = true
    try {
      const success = await fetchUser()
      isInitialized.value = true
      return success
    } catch (error) {
      console.error('Auth initialization error:', error)
      logout()
      return false
    } finally {
      isInitializing.value = false
    }
  }

  function logout() {
    user.value = null
    token.value = null
    isInitialized.value = false
    isInitializing.value = false
    localStorage.removeItem('token')
    
    // Disconnect socket on logout
    import('@/lib/socket').then(({ socketManager }) => {
      socketManager.disconnect()
    })
  }

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    isUser,
    isInitialized,
    isInitializing,
    login,
    register,
    logout,
    fetchUser,
    initializeAuth,
  }
}) 