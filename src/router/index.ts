import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/public-request',
      name: 'public-request',
      component: () => import('../views/PublicRequestView.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'user',
          name: 'user-dashboard',
          component: () => import('../views/UserDashboard.vue'),
          meta: { requiresAuth: true, role: 'user' }
        },
        {
          path: 'admin',
          name: 'admin-dashboard',
          component: () => import('../views/AdminDashboard.vue'),
          meta: { requiresAuth: true, role: 'admin' }
        },
      ]
    },
    {
      path: '/request',
      name: 'request',
      component: () => import('../views/DashboardLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'request-form',
          component: () => import('../views/RequestFormView.vue'),
          meta: { requiresAuth: true, role: 'user' }
        }
      ]
    },
    {
      path: '/admin',
      component: () => import('../views/DashboardLayout.vue'),
      meta: { requiresAuth: true, role: 'admin' },
      children: [
        {
          path: 'requests',
          name: 'admin-requests',
          component: () => import('../views/AdminRequestsView.vue'),
          meta: { requiresAuth: true, role: 'admin' }
        },
        {
          path: 'inventory',
          name: 'admin-inventory',
          component: () => import('../views/AdminInventoryView.vue'),
          meta: { requiresAuth: true, role: 'admin' }
        }
      ]
    },
    {
      path: '/reports',
      name: 'reports',
      component: () => import('../views/DashboardLayout.vue'),
      meta: { requiresAuth: true, role: 'admin' },
      children: [
        {
          path: '',
          name: 'reports-view',
          component: () => import('../views/ReportsView.vue'),
          meta: { requiresAuth: true, role: 'admin' }
        }
      ]
    },
    // Catch all 404
    {
      path: '/:pathMatch(.*)*',
      redirect: '/login'
    }
  ],
})

// Navigation guard for authentication
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Allow access to public routes without authentication
  if (!to.meta.requiresAuth) {
    next()
    return
  }
  
  // If user has a token but no user data, initialize auth first
  if (authStore.token && !authStore.user) {
    try {
      await authStore.initializeAuth()
    } catch (error) {
      console.error('Auth initialization failed:', error)
      // If initialization fails, redirect to login
      next('/login')
      return
    }
  }
  
  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }
  
  // Check role-based access
  if (to.meta.role === 'admin' && !authStore.isAdmin) {
    next('/dashboard/user')
    return
  }
  
  if (to.meta.role === 'user' && !authStore.isUser) {
    next('/dashboard/admin')
    return
  }
  
  next()
})

export default router
