<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-2xl font-semibold text-gray-900">Dashboard User</h1>
        <p class="mt-2 text-sm text-gray-700">
          Lihat stok barang yang tersedia dan buat permintaan barang
        </p>
      </div>
      <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
        <Button @click="$router.push('/request')"> Buat Permintaan Baru </Button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
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
                <dt class="text-sm font-medium text-gray-500 truncate">Available Items</dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ inventoryStore.items.filter((item) => item.stok_terkini > 0).length }}
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
    </div>

    <!-- Inventory Table -->
    <div class="mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Daftar Barang dan Stok Terkini</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Barang</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Stok Tersedia</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="item in inventoryStore.items" :key="item.id">
                  <TableCell class="font-medium">{{ item.nama_barang }}</TableCell>
                  <TableCell>{{ item.deskripsi }}</TableCell>
                  <TableCell>
                    <span
                      :class="{
                        'text-red-600': item.stok_terkini <= item.minimum_stock,
                        'text-yellow-600':
                          item.stok_terkini <= item.minimum_stock * 1.5 &&
                          item.stok_terkini > item.minimum_stock,
                        'text-green-600': item.stok_terkini > item.minimum_stock * 1.5,
                      }"
                    >
                      {{ item.stok_terkini }}
                    </span>
                  </TableCell>
                  <TableCell>{{ item.satuan }}</TableCell>
                  <TableCell>
                    <Badge :variant="getStockStatus(item).variant">
                      {{ getStockStatus(item).label }}
                    </Badge>
                  </TableCell>
                  <TableCell class="text-sm text-gray-500">
                    {{ new Date(item.updated_at).toLocaleDateString('id-ID') }}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      :disabled="item.stok_terkini === 0"
                      @click="openRequestDialog(item)"
                    >
                      Request
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow v-if="inventoryStore.items.length === 0">
                  <TableCell colspan="7" class="text-center text-gray-500">
                    {{ inventoryStore.loading ? 'Loading...' : 'No items found' }}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useInventoryStore } from '@/stores/inventory'
import type { InventoryItem } from '@/stores/inventory'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const router = useRouter()
const inventoryStore = useInventoryStore()

onMounted(() => {
  inventoryStore.fetchItems()
})

function getStockStatus(item: InventoryItem) {
  if (item.stok_terkini === 0) {
    return { variant: 'destructive' as const, label: 'Out of Stock' }
  } else if (item.stok_terkini <= item.minimum_stock) {
    return { variant: 'destructive' as const, label: 'Low Stock' }
  } else if (item.stok_terkini <= item.minimum_stock * 1.5) {
    return { variant: 'secondary' as const, label: 'Warning' }
  } else {
    return { variant: 'default' as const, label: 'Available' }
  }
}

function openRequestDialog(item: InventoryItem) {
  // Navigate to request form with pre-selected item
  router.push({
    name: 'request',
    query: { itemId: item.id.toString() },
  })
}
</script>
