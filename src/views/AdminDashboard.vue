<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
        <p class="mt-2 text-sm text-gray-700">
          Monitor stok real-time dan kelola permintaan pengguna
        </p>
      </div>
      <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
        <Button @click="refreshData" :disabled="inventoryStore.loading">
          <svg
            class="w-4 h-4 mr-2"
            :class="{ 'animate-spin': inventoryStore.loading }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </Button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg
                  class="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Total Items</dt>
                <dd class="text-lg font-medium text-gray-900">{{ inventoryStore.items.length }}</dd>
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg
                  class="w-5 h-5 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Low Stock Items</dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ inventoryStore.lowStockItems.length }}
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <svg
                  class="w-5 h-5 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Pending Requests</dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ inventoryStore.pendingRequests.length }}
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  class="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">In Stock Items</dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{
                    inventoryStore.items.filter((item) => item.stok_terkini > item.minimum_stock)
                      .length
                  }}
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Quick Actions -->
    <div class="mt-8">
      <h2 class="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Button @click="router.push('/admin/requests')" class="h-auto p-4">
          <div class="text-center">
            <div class="text-2xl font-bold">{{ inventoryStore.pendingRequests.length }}</div>
            <div class="text-sm">Review Requests</div>
          </div>
        </Button>

        <Button @click="router.push('/admin/inventory')" variant="outline" class="h-auto p-4">
          <div class="text-center">
            <div class="text-2xl font-bold">{{ inventoryStore.lowStockItems.length }}</div>
            <div class="text-sm">Low Stock Items</div>
          </div>
        </Button>

        <Button @click="router.push('/reports')" variant="outline" class="h-auto p-4">
          <div class="text-center">
            <div class="text-2xl font-bold">📊</div>
            <div class="text-sm">View Reports</div>
          </div>
        </Button>

        <Button @click="router.push('/admin/inventory')" variant="outline" class="h-auto p-4">
          <div class="text-center">
            <div class="text-2xl font-bold">📦</div>
            <div class="text-sm">Manage Inventory</div>
          </div>
        </Button>
      </div>
    </div>

    <!-- Low Stock Alert -->
    <div v-if="inventoryStore.lowStockItems.length > 0" class="mt-8">
      <Alert variant="destructive">
        <AlertDescription>
          <div class="flex items-center justify-between">
            <span>
              <strong>{{ inventoryStore.lowStockItems.length }}</strong> items are running low on
              stock!
            </span>
            <Button @click="router.push('/admin/inventory')" size="sm" variant="outline">
              View Details
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>

    <!-- Recent Requests -->
    <div class="mt-8">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between">
          <CardTitle>Recent Requests</CardTitle>
          <Button @click="router.push('/admin/requests')" size="sm" variant="outline">
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div
              v-for="request in recentRequests"
              :key="request.id"
              class="flex items-center justify-between p-4 border rounded-lg"
            >
              <div class="flex-1">
                <div class="flex items-center space-x-2">
                  <span class="font-medium">{{ request.item?.nama_barang }}</span>
                  <Badge v-if="request.is_urgent" variant="destructive">URGENT</Badge>
                  <Badge
                    :variant="
                      request.status === 'pending'
                        ? 'secondary'
                        : request.status === 'approved'
                          ? 'default'
                          : 'destructive'
                    "
                  >
                    {{ request.status.toUpperCase() }}
                  </Badge>
                </div>
                <div class="text-sm text-gray-500">
                  Requested by: {{ request.user?.username || request.public_requester_name }} •
                  Quantity: {{ request.jumlah_diminta }} •
                  {{ new Date(request.created_at).toLocaleDateString('id-ID') }}
                </div>
              </div>
              <div v-if="request.status === 'pending'" class="flex space-x-2">
                <Button @click="quickApprove(request)" size="sm" variant="outline">Approve</Button>
                <Button @click="quickReject(request)" size="sm" variant="destructive"
                  >Reject</Button
                >
              </div>
            </div>
            <div v-if="recentRequests.length === 0" class="text-center text-gray-500 py-8">
              No recent requests
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useInventoryStore } from '@/stores/inventory'
import type { StockRequest } from '@/stores/inventory'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

const router = useRouter()
const inventoryStore = useInventoryStore()

const recentRequests = computed(() =>
  inventoryStore.requests
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5),
)

onMounted(() => {
  refreshData()
})

async function refreshData() {
  await Promise.all([
    inventoryStore.fetchItems(),
    inventoryStore.fetchRequests(true), // true for admin view
  ])
}

async function quickApprove(request: StockRequest) {
  const result = await inventoryStore.updateRequestStatus(
    request.id,
    'approved',
    'Quick approval from dashboard',
  )

  if (result.success) {
    await refreshData()
  }
}

async function quickReject(request: StockRequest) {
  const result = await inventoryStore.updateRequestStatus(
    request.id,
    'rejected',
    'Quick rejection from dashboard',
  )

  if (result.success) {
    await refreshData()
  }
}
</script>
