<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-2xl font-semibold text-gray-900">Manage Requests</h1>
        <p class="mt-2 text-sm text-gray-700">Review and manage all stock requests from users</p>
      </div>
      <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
        <Button @click="refreshRequests" :disabled="inventoryStore.loading">
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

    <!-- Status Filter -->
    <div class="mt-6 flex space-x-4">
      <Button
        v-for="status in statusOptions"
        :key="status.value"
        @click="selectedStatus = status.value"
        :variant="selectedStatus === status.value ? 'default' : 'outline'"
        size="sm"
      >
        {{ status.label }}
        <Badge v-if="getRequestCountByStatus(status.value)" variant="secondary" class="ml-2">
          {{ getRequestCountByStatus(status.value) }}
        </Badge>
      </Button>
    </div>

    <!-- Requests Table -->
    <div class="mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Stock Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Requester</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date Requested</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="request in filteredRequests" :key="request.id">
                  <TableCell class="font-medium">
                    <div>
                      <div>{{ request.user?.username || request.public_requester_name }}</div>
                      <div v-if="request.public_requester_contact" class="text-xs text-gray-500">
                        {{ request.public_requester_contact }}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div class="font-medium">{{ request.item?.nama_barang }}</div>
                      <div class="text-sm text-gray-500">
                        Available: {{ request.item?.stok_terkini }} {{ request.item?.satuan }}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{{ request.jumlah_diminta }} {{ request.item?.satuan }}</TableCell>
                  <TableCell>
                    <div class="flex space-x-1">
                      <Badge v-if="request.is_urgent" variant="destructive">URGENT</Badge>
                      <Badge v-if="request.is_public_request" variant="secondary">PUBLIC</Badge>
                      <Badge v-else variant="outline">USER</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div>{{ new Date(request.created_at).toLocaleDateString('id-ID') }}</div>
                      <div class="text-xs text-gray-500">
                        {{ new Date(request.created_at).toLocaleTimeString('id-ID') }}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>
                    <div class="flex space-x-2">
                      <Button
                        v-if="request.status === 'pending'"
                        @click="openApprovalDialog(request)"
                        size="sm"
                        variant="outline"
                      >
                        Review
                      </Button>
                      <Button
                        v-else
                        @click="viewRequestDetails(request)"
                        size="sm"
                        variant="outline"
                      >
                        View
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow v-if="filteredRequests.length === 0">
                  <TableCell colspan="7" class="text-center text-gray-500">
                    {{ inventoryStore.loading ? 'Loading...' : 'No requests found' }}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Approval Dialog -->
    <Dialog v-model:open="showApprovalDialog">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Review Request</DialogTitle>
        </DialogHeader>
        <div v-if="selectedRequest" class="space-y-4">
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="font-medium">Request Details</h3>
            <div class="mt-2 text-sm space-y-1">
              <div>
                <strong>Requester:</strong>
                {{ selectedRequest.user?.username || selectedRequest.public_requester_name }}
              </div>
              <div><strong>Item:</strong> {{ selectedRequest.item?.nama_barang }}</div>
              <div>
                <strong>Quantity:</strong> {{ selectedRequest.jumlah_diminta }}
                {{ selectedRequest.item?.satuan }}
              </div>
              <div>
                <strong>Available Stock:</strong> {{ selectedRequest.item?.stok_terkini }}
                {{ selectedRequest.item?.satuan }}
              </div>
              <div v-if="selectedRequest.is_urgent">
                <strong>Type:</strong> <span class="text-red-600">URGENT</span>
              </div>
            </div>
          </div>

          <div>
            <Label for="feedback">Admin Feedback</Label>
            <textarea
              id="feedback"
              v-model="feedback"
              rows="3"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              placeholder="Provide feedback or reason for decision..."
            ></textarea>
          </div>

          <Alert v-if="requestError" variant="destructive">
            <AlertDescription>
              {{ requestError }}
            </AlertDescription>
          </Alert>

          <div class="flex justify-end space-x-3">
            <Button @click="closeApprovalDialog" variant="outline">Cancel</Button>
            <Button @click="handleReject" variant="destructive" :disabled="processing">
              {{ processing ? 'Processing...' : 'Reject' }}
            </Button>
            <Button @click="handleApprove" :disabled="processing || !canApprove">
              {{ processing ? 'Processing...' : 'Approve' }}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Request Details Dialog -->
    <Dialog v-model:open="showDetailsDialog">
      <DialogContent class="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Request Details</DialogTitle>
        </DialogHeader>
        <div v-if="selectedRequest" class="space-y-4">
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="space-y-3">
              <div>
                <strong>Requester:</strong>
                {{ selectedRequest.user?.username || selectedRequest.public_requester_name }}
              </div>
              <div v-if="selectedRequest.public_requester_contact">
                <strong>Contact:</strong> {{ selectedRequest.public_requester_contact }}
              </div>
              <div><strong>Item:</strong> {{ selectedRequest.item?.nama_barang }}</div>
              <div>
                <strong>Quantity:</strong> {{ selectedRequest.jumlah_diminta }}
                {{ selectedRequest.item?.satuan }}
              </div>
              <div>
                <strong>Status:</strong>
                <Badge
                  :variant="
                    selectedRequest.status === 'pending'
                      ? 'secondary'
                      : selectedRequest.status === 'approved'
                        ? 'default'
                        : 'destructive'
                  "
                >
                  {{ selectedRequest.status.toUpperCase() }}
                </Badge>
              </div>
              <div>
                <strong>Date Requested:</strong>
                {{ new Date(selectedRequest.created_at).toLocaleString('id-ID') }}
              </div>
              <div v-if="selectedRequest.approved_at">
                <strong>Date Reviewed:</strong>
                {{ new Date(selectedRequest.approved_at).toLocaleString('id-ID') }}
              </div>
              <div v-if="selectedRequest.feedback_admin">
                <strong>Admin Feedback:</strong>
                <div class="mt-1 p-2 bg-white rounded border text-sm">
                  {{ selectedRequest.feedback_admin }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex justify-end">
          <Button @click="showDetailsDialog = false" variant="outline">Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
import type { StockRequest } from '@/stores/inventory'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const inventoryStore = useInventoryStore()

const selectedStatus = ref('all')
const showApprovalDialog = ref(false)
const showDetailsDialog = ref(false)
const selectedRequest = ref<StockRequest | null>(null)
const feedback = ref('')
const processing = ref(false)
const requestError = ref('')

const statusOptions = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

const filteredRequests = computed(() => {
  if (selectedStatus.value === 'all') return inventoryStore.requests
  return inventoryStore.requests.filter((request) => request.status === selectedStatus.value)
})

const canApprove = computed(() => {
  if (!selectedRequest.value) return false
  return selectedRequest.value.jumlah_diminta <= (selectedRequest.value.item?.stok_terkini || 0)
})

onMounted(() => {
  refreshRequests()
})

async function refreshRequests() {
  await inventoryStore.fetchRequests(true) // true for admin view
}

function getRequestCountByStatus(status: string) {
  if (status === 'all') return inventoryStore.requests.length
  return inventoryStore.requests.filter((request) => request.status === status).length
}

function openApprovalDialog(request: StockRequest) {
  selectedRequest.value = request
  feedback.value = ''
  requestError.value = ''
  showApprovalDialog.value = true
}

function closeApprovalDialog() {
  showApprovalDialog.value = false
  selectedRequest.value = null
  feedback.value = ''
  requestError.value = ''
}

function viewRequestDetails(request: StockRequest) {
  selectedRequest.value = request
  showDetailsDialog.value = true
}

async function handleApprove() {
  if (!selectedRequest.value || processing.value) return

  processing.value = true
  requestError.value = ''

  try {
    const result = await inventoryStore.updateRequestStatus(
      selectedRequest.value.id,
      'approved',
      feedback.value || 'Request approved',
    )

    if (result.success) {
      closeApprovalDialog()
      await refreshRequests()
    } else {
      requestError.value = result.error || 'Failed to approve request'
    }
  } catch (error) {
    requestError.value = 'An error occurred while processing the request'
    console.error('Approval error:', error)
  } finally {
    processing.value = false
  }
}

async function handleReject() {
  if (!selectedRequest.value || processing.value) return

  processing.value = true
  requestError.value = ''

  try {
    const result = await inventoryStore.updateRequestStatus(
      selectedRequest.value.id,
      'rejected',
      feedback.value || 'Request rejected',
    )

    if (result.success) {
      closeApprovalDialog()
      await refreshRequests()
    } else {
      requestError.value = result.error || 'Failed to reject request'
    }
  } catch (error) {
    requestError.value = 'An error occurred while processing the request'
    console.error('Rejection error:', error)
  } finally {
    processing.value = false
  }
}
</script>
