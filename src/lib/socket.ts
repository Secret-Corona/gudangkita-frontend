import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/stores/auth'
import { useInventoryStore } from '@/stores/inventory'

class SocketManager {
  private socket: Socket | null = null

  // Lazy getters for stores to avoid Pinia initialization issues
  private get authStore() {
    return useAuthStore()
  }

  private get inventoryStore() {
    return useInventoryStore()
  }

  connect() {
    if (this.socket?.connected) return

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
    const token = localStorage.getItem('token')

    if (!token) return

    this.socket = io(API_BASE_URL, {
      auth: {
        token: `Bearer ${token}`
      },
      transports: ['websocket', 'polling']
    })

    this.setupEventListeners()
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  private setupEventListeners() {
    if (!this.socket) return

    // Connection events
    this.socket.on('connect', () => {
      console.log('Connected to server', this.socket?.id)
    })

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server')
    })

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error)
    })

    // Handle real-time stock updates from the server
    // This ensures the UI stays synchronized with inventory changes
    this.socket.on('stock_updated', (data) => {
      console.log('Stock updated:', data)
      // Update the inventory store with real-time stock changes
      // This maintains audit trail consistency across all connected clients
      this.inventoryStore.handleStockUpdate(data)
    })

    this.socket.on('request_created', (data) => {
      console.log('New request created:', data)
      this.inventoryStore.handleNewRequest(data)
    })

    this.socket.on('request_status_updated', (data) => {
      console.log('Request status updated:', data)
      this.inventoryStore.handleRequestStatusUpdate(data)
    })

    this.socket.on('notification', (data) => {
      console.log('New notification:', data)
      // Handle notifications (could integrate with a toast system)
      this.handleNotification(data)
    })

    this.socket.on('low_stock_alert', (data) => {
      console.log('Low stock alert:', data)
      this.inventoryStore.handleLowStockAlert(data)
    })
  }

  private handleNotification(notification: any) {
    // You can integrate this with a toast notification system
    // For now, we'll just log it
    console.log('Notification:', notification)
    
    // If you have a notification store, you can update it here
    // notificationStore.addNotification(notification)
  }

  // Public methods to emit events
  joinRoom(room: string) {
    this.socket?.emit('join_room', room)
  }

  leaveRoom(room: string) {
    this.socket?.emit('leave_room', room)
  }

  updateStock(itemId: number, newStock: number) {
    this.socket?.emit('update_stock', { itemId, newStock })
  }

  createRequest(requestData: any) {
    this.socket?.emit('create_request', requestData)
  }
}

export const socketManager = new SocketManager()
export default socketManager
 