<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-2xl font-semibold text-gray-900">Transaction Reports</h1>
        <p class="mt-2 text-sm text-gray-700">
          View and download transaction history and system reports
        </p>
      </div>
      <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
        <Button @click="downloadCSV" :disabled="loading">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Download CSV
        </Button>
      </div>
    </div>

    <!-- Filters -->
    <Card class="mt-8">
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label for="startDate">Start Date</Label>
            <Input id="startDate" v-model="filters.start_date" type="date" class="mt-1" />
          </div>

          <div>
            <Label for="endDate">End Date</Label>
            <Input id="endDate" v-model="filters.end_date" type="date" class="mt-1" />
          </div>

          <div>
            <Label for="transactionType">Transaction Type</Label>
            <select
              id="transactionType"
              v-model="filters.type"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            >
              <option value="">All Types</option>
              <option value="request">Request</option>
              <option value="pickup">Pickup</option>
              <option value="restock">Restock</option>
              <option value="adjustment">Adjustment</option>
            </select>
          </div>

          <div class="flex items-end">
            <Button @click="fetchTransactions" :disabled="loading" class="w-full">
              {{ loading ? 'Loading...' : 'Apply Filters' }}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Transaction History -->
    <div class="mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Previous Stock</TableHead>
                  <TableHead>New Stock</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="transaction in inventoryStore.transactions" :key="transaction.id">
                  <TableCell class="text-sm">
                    {{ new Date(transaction.created_at).toLocaleString('id-ID') }}
                  </TableCell>
                  <TableCell class="font-medium">{{ transaction.item.nama_barang }}</TableCell>
                  <TableCell>
                    <Badge
                      :variant="
                        transaction.type === 'restock'
                          ? 'default'
                          : transaction.type === 'pickup'
                            ? 'secondary'
                            : 'outline'
                      "
                    >
                      {{ transaction.type.toUpperCase() }}
                    </Badge>
                  </TableCell>
                  <TableCell>{{ transaction.user.username }}</TableCell>
                  <TableCell>
                    <span
                      :class="{
                        'text-green-600':
                          transaction.type === 'restock' || transaction.type === 'adjustment',
                        'text-red-600': transaction.type === 'pickup',
                      }"
                    >
                      {{ transaction.type === 'pickup' ? '-' : '+' }}{{ transaction.quantity }}
                      {{ transaction.item.satuan }}
                    </span>
                  </TableCell>
                  <TableCell
                    >{{ transaction.previous_stock }} {{ transaction.item.satuan }}</TableCell
                  >
                  <TableCell>{{ transaction.new_stock }} {{ transaction.item.satuan }}</TableCell>
                  <TableCell>
                    <div class="max-w-xs truncate" :title="transaction.notes">
                      {{ transaction.notes || '-' }}
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow v-if="inventoryStore.transactions.length === 0">
                  <TableCell colspan="8" class="text-center text-gray-500">
                    {{ loading ? 'Loading...' : 'No transactions found' }}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Summary Stats -->
    <div class="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Total Transactions</dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ inventoryStore.transactions.length }}
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Restocks</dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ inventoryStore.transactions.filter((t) => t.type === 'restock').length }}
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
              <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  class="w-5 h-5 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M20 12H4"
                  />
                </svg>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Pickups</dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ inventoryStore.transactions.filter((t) => t.type === 'pickup').length }}
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const inventoryStore = useInventoryStore()
const loading = ref(false)

const filters = reactive({
  start_date: '',
  end_date: '',
  type: '',
})

onMounted(() => {
  fetchTransactions()
})

async function fetchTransactions() {
  loading.value = true
  try {
    await inventoryStore.fetchTransactions(filters)
  } finally {
    loading.value = false
  }
}

async function downloadCSV() {
  loading.value = true
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
    const token = localStorage.getItem('token')

    const params = new URLSearchParams()
    params.append('format', 'csv')
    if (filters.start_date && filters.start_date.trim()) {
      params.append('start_date', filters.start_date)
    }
    if (filters.end_date && filters.end_date.trim()) {
      params.append('end_date', filters.end_date)
    }
    if (filters.type && filters.type.trim()) {
      params.append('type', filters.type)
    }

    const response = await fetch(`${API_BASE_URL}/api/report/transactions?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (response.ok) {
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } else {
      console.error('Failed to download CSV')
    }
  } catch (error) {
    console.error('Error downloading CSV:', error)
  } finally {
    loading.value = false
  }
}
</script>
