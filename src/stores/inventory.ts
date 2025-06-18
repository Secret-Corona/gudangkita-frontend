import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface InventoryItem {
  id: number
  nama_barang: string
  stok_terkini: number
  satuan: string
  deskripsi: string
  minimum_stock: number
  created_at: string
  updated_at: string
  is_low_stock?: boolean
  stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock'
}

export interface StockRequest {
  id: number
  user_id: number | null
  item_id: number
  jumlah_diminta: number
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  feedback_admin?: string | null
  approved_by?: number | null
  approved_at?: string | null
  completed_at?: string | null
  is_urgent: boolean
  is_public_request: boolean
  public_requester_name?: string | null
  public_requester_contact?: string | null
  created_at: string
  updated_at: string
  user?: {
    id: number
    username: string
    role: string
  }
  item?: {
    id: number
    nama_barang: string
    stok_terkini: number
    satuan: string
  }
}

export interface Transaction {
  id: number
  item_id: number
  user_id: number
  request_id?: number | null
  type: 'request' | 'pickup' | 'restock' | 'adjustment'
  quantity: number
  previous_stock: number
  new_stock: number
  notes?: string
  created_at: string
  item: {
    id: number
    nama_barang: string
    satuan: string
  }
  user: {
    id: number
    username: string
    role: string
  }
  request?: {
    id: number
    status: string
    is_urgent: boolean
    is_public_request: boolean
  } | null
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

function getAuthHeaders() {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
}

export const useInventoryStore = defineStore('inventory', () => {
  const items = ref<InventoryItem[]>([])
  const requests = ref<StockRequest[]>([])
  const transactions = ref<Transaction[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const lowStockItems = computed(() =>
    items.value.filter(item => item.is_low_stock || item.stok_terkini <= item.minimum_stock)
  )

  const pendingRequests = computed(() =>
    requests.value.filter(request => request.status === 'pending')
  )

  async function fetchItems() {
    loading.value = true
    try {
      const response = await fetch(`${API_BASE_URL}/api/stock`, {
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        const data = await response.json()
        items.value = data.items || []
      } else {
        throw new Error('Failed to fetch items')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch items'
    } finally {
      loading.value = false
    }
  }

  async function fetchPublicItems() {
    loading.value = true
    try {
      const response = await fetch(`${API_BASE_URL}/api/public/items`)
      
      if (response.ok) {
        const data = await response.json()
        // Convert public format to internal format
        items.value = data.items.map((item: any) => ({
          ...item,
          minimum_stock: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch public items'
    } finally {
      loading.value = false
    }
  }

  async function fetchRequests(isAdmin = false) {
    loading.value = true
    try {
      const endpoint = isAdmin ? '/api/request/all' : '/api/request'
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        const data = await response.json()
        requests.value = data.requests || []
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch requests'
    } finally {
      loading.value = false
    }
  }

  async function createRequest(itemId: number, quantity: number, isUrgent = false) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/request`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          item_id: itemId, 
          jumlah_diminta: quantity, 
          is_urgent: isUrgent 
        }),
      })

      const data = await response.json()

      if (response.ok) {
        requests.value.push(data.request)
        return { success: true, request: data.request }
      } else {
        throw new Error(data.error || 'Failed to create request')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create request'
      return { 
        success: false, 
        error: error.value 
      }
    }
  }

  async function createPublicRequest(
    itemId: number, 
    quantity: number, 
    requesterName: string, 
    requesterContact: string
  ) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/public/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: itemId,
          jumlah_diminta: quantity,
          public_requester_name: requesterName,
          public_requester_contact: requesterContact
        }),
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true, request: data.request }
      } else {
        throw new Error(data.error || 'Failed to create public request')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create public request'
      return { 
        success: false, 
        error: error.value 
      }
    }
  }

  async function updateRequestStatus(
    requestId: number, 
    status: 'approved' | 'rejected', 
    feedback?: string
  ) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/request/${requestId}/${status === 'approved' ? 'approve' : 'reject'}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ feedback_admin: feedback }),
      })

      const data = await response.json()

      if (response.ok) {
        const index = requests.value.findIndex(r => r.id === requestId)
        if (index !== -1) {
          requests.value[index] = data.request
        }
        return { success: true, request: data.request }
      } else {
        throw new Error(data.error || 'Failed to update request')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update request'
      return { 
        success: false, 
        error: error.value 
      }
    }
  }

  async function updateStock(itemId: number, newStock: number, notes?: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stock/${itemId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ stok_terkini: newStock, notes }),
      })

      const data = await response.json()

      if (response.ok) {
        const index = items.value.findIndex(item => item.id === itemId)
        if (index !== -1) {
          items.value[index] = data.item
        }
        return { success: true, item: data.item }
      } else {
        throw new Error(data.error || 'Failed to update stock')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update stock'
      return { 
        success: false, 
        error: error.value 
      }
    }
  }

  async function restockItem(itemId: number, quantity: number, notes?: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stock/restock`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ item_id: itemId, quantity, notes }),
      })

      const data = await response.json()

      if (response.ok) {
        const index = items.value.findIndex(item => item.id === itemId)
        if (index !== -1) {
          items.value[index] = data.item
        }
        return { success: true, item: data.item }
      } else {
        throw new Error(data.error || 'Failed to restock item')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to restock item'
      return { 
        success: false, 
        error: error.value 
      }
    }
  }

  async function createItem(itemData: {
    nama_barang: string
    stok_terkini: number
    satuan: string
    deskripsi: string
    minimum_stock: number
  }) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stock/items`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(itemData),
      })

      const data = await response.json()

      if (response.ok) {
        items.value.push(data.item)
        return { success: true, item: data.item }
      } else {
        throw new Error(data.error || 'Failed to create item')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create item'
      return { 
        success: false, 
        error: error.value 
      }
    }
  }

  async function fetchTransactions(filters?: {
    start_date?: string
    end_date?: string
    type?: string
    page?: number
    limit?: number
  }) {
    loading.value = true
    try {
      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString())
          }
        })
      }

      const response = await fetch(`${API_BASE_URL}/api/report/transactions?${params}`, {
        headers: getAuthHeaders()
      })

      if (response.ok) {
        const data = await response.json()
        transactions.value = data.transactions || []
        return { success: true, data }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch transactions'
    } finally {
      loading.value = false
    }
  }

  function getItemById(id: number) {
    return items.value.find(item => item.id === id)
  }

  // Real-time event handlers for Socket.IO
  function handleStockUpdate(data: { itemId: number; newStock: number; item?: InventoryItem }) {
    // Update the specific item in the items array
    const itemIndex = items.value.findIndex(item => item.id === data.itemId)
    if (itemIndex !== -1) {
      items.value[itemIndex].stok_terkini = data.newStock
      items.value[itemIndex].updated_at = new Date().toISOString()
    } else if (data.item) {
      // If item not found and full item data provided, add it
      items.value.push(data.item)
    }
  }

  function handleNewRequest(data: { request: StockRequest }) {
    // Add new request to the beginning of the requests array
    requests.value.unshift(data.request)
  }

  function handleRequestStatusUpdate(data: { requestId: number; status: string; request?: StockRequest }) {
    // Update the specific request in the requests array
    const requestIndex = requests.value.findIndex(req => req.id === data.requestId)
    if (requestIndex !== -1) {
      if (data.request) {
        // Replace with full updated request data
        requests.value[requestIndex] = data.request
      } else {
        // Just update the status
        requests.value[requestIndex].status = data.status as any
      }
    }
  }

  function handleLowStockAlert(data: { itemId: number; currentStock: number; minimumStock: number; item?: InventoryItem }) {
    // Update the item and mark it as low stock
    const itemIndex = items.value.findIndex(item => item.id === data.itemId)
    if (itemIndex !== -1) {
      items.value[itemIndex].stok_terkini = data.currentStock
      items.value[itemIndex].is_low_stock = true
    }
    
    // You could also trigger a notification here
    console.warn(`Low stock alert: Item ${data.itemId} has ${data.currentStock} remaining (minimum: ${data.minimumStock})`)
  }

  return {
    items,
    requests,
    transactions,
    loading,
    error,
    lowStockItems,
    pendingRequests,
    fetchItems,
    fetchPublicItems,
    fetchRequests,
    fetchTransactions,
    createRequest,
    createPublicRequest,
    updateRequestStatus,
    updateStock,
    restockItem,
    createItem,
    getItemById,
    handleStockUpdate,
    handleNewRequest,
    handleRequestStatusUpdate,
    handleLowStockAlert,
  }
}) 