<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-2xl font-semibold text-gray-900">Manage Inventory</h1>
        <p class="mt-2 text-sm text-gray-700">
          Update stock manually, restock items, and add new products
        </p>
      </div>
      <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
        <Button @click="showAddItemDialog = true"> Add New Item </Button>
      </div>
    </div>

    <!-- Inventory Table -->
    <div class="mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Min Stock</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="item in inventoryStore.items" :key="item.id">
                  <TableCell class="font-medium">{{ item.nama_barang }}</TableCell>
                  <TableCell>{{ item.deskripsi }}</TableCell>
                  <TableCell>
                    <span
                      :class="{
                        'text-red-600 font-semibold': item.stok_terkini <= item.minimum_stock,
                        'text-yellow-600 font-semibold':
                          item.stok_terkini <= item.minimum_stock * 1.5 &&
                          item.stok_terkini > item.minimum_stock,
                        'text-green-600': item.stok_terkini > item.minimum_stock * 1.5,
                      }"
                    >
                      {{ item.stok_terkini }}
                    </span>
                  </TableCell>
                  <TableCell>{{ item.minimum_stock }}</TableCell>
                  <TableCell>{{ item.satuan }}</TableCell>
                  <TableCell>
                    <Badge
                      :variant="
                        item.stok_terkini <= item.minimum_stock
                          ? 'destructive'
                          : item.stok_terkini <= item.minimum_stock * 1.5
                            ? 'secondary'
                            : 'default'
                      "
                    >
                      {{
                        item.stok_terkini <= item.minimum_stock
                          ? 'Low Stock'
                          : item.stok_terkini <= item.minimum_stock * 1.5
                            ? 'Warning'
                            : 'Normal'
                      }}
                    </Badge>
                  </TableCell>
                  <TableCell class="text-sm text-gray-500">
                    {{ new Date(item.updated_at).toLocaleString('id-ID') }}
                  </TableCell>
                  <TableCell>
                    <div class="flex space-x-2">
                      <Button @click="openUpdateDialog(item)" size="sm" variant="outline">
                        Update
                      </Button>
                      <Button @click="openRestockDialog(item)" size="sm" variant="outline">
                        Restock
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow v-if="inventoryStore.items.length === 0">
                  <TableCell colspan="8" class="text-center text-gray-500">
                    {{ inventoryStore.loading ? 'Loading...' : 'No items found' }}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Update Stock Dialog -->
    <Dialog v-model:open="showUpdateDialog">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Stock</DialogTitle>
        </DialogHeader>
        <div v-if="selectedItem" class="space-y-4">
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="font-medium">{{ selectedItem.nama_barang }}</h3>
            <p class="text-sm text-gray-600">
              Current Stock: {{ selectedItem.stok_terkini }} {{ selectedItem.satuan }}
            </p>
          </div>

          <div>
            <Label for="newStock">New Stock Amount</Label>
            <Input
              id="newStock"
              v-model.number="updateForm.newStock"
              type="number"
              min="0"
              placeholder="Enter new stock amount"
              class="mt-1"
            />
          </div>

          <div>
            <Label for="updateNotes">Notes (Optional)</Label>
            <textarea
              id="updateNotes"
              v-model="updateForm.notes"
              rows="3"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              placeholder="Reason for stock update..."
            ></textarea>
          </div>

          <Alert v-if="updateError" variant="destructive">
            <AlertDescription>{{ updateError }}</AlertDescription>
          </Alert>

          <div class="flex justify-end space-x-3">
            <Button @click="closeUpdateDialog" variant="outline">Cancel</Button>
            <Button @click="handleUpdateStock" :disabled="updateProcessing">
              {{ updateProcessing ? 'Updating...' : 'Update Stock' }}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Restock Dialog -->
    <Dialog v-model:open="showRestockDialog">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Restock Item</DialogTitle>
        </DialogHeader>
        <div v-if="selectedItem" class="space-y-4">
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="font-medium">{{ selectedItem.nama_barang }}</h3>
            <p class="text-sm text-gray-600">
              Current Stock: {{ selectedItem.stok_terkini }} {{ selectedItem.satuan }}
            </p>
          </div>

          <div>
            <Label for="restockQuantity">Quantity to Add</Label>
            <Input
              id="restockQuantity"
              v-model.number="restockForm.quantity"
              type="number"
              min="1"
              placeholder="Enter quantity to add"
              class="mt-1"
            />
          </div>

          <div>
            <Label for="restockNotes">Notes (Optional)</Label>
            <textarea
              id="restockNotes"
              v-model="restockForm.notes"
              rows="3"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              placeholder="Restock details, supplier, etc..."
            ></textarea>
          </div>

          <Alert v-if="restockError" variant="destructive">
            <AlertDescription>{{ restockError }}</AlertDescription>
          </Alert>

          <div class="flex justify-end space-x-3">
            <Button @click="closeRestockDialog" variant="outline">Cancel</Button>
            <Button @click="handleRestock" :disabled="restockProcessing">
              {{ restockProcessing ? 'Adding...' : 'Add Stock' }}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Add New Item Dialog -->
    <Dialog v-model:open="showAddItemDialog">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
        </DialogHeader>
        <div class="space-y-4">
          <div>
            <Label for="itemName">Item Name</Label>
            <Input
              id="itemName"
              v-model="addItemForm.nama_barang"
              type="text"
              placeholder="Enter item name"
              class="mt-1"
            />
          </div>

          <div>
            <Label for="itemDescription">Description</Label>
            <textarea
              id="itemDescription"
              v-model="addItemForm.deskripsi"
              rows="3"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              placeholder="Item description..."
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label for="initialStock">Initial Stock</Label>
              <Input
                id="initialStock"
                v-model.number="addItemForm.stok_terkini"
                type="number"
                min="0"
                placeholder="0"
                class="mt-1"
              />
            </div>

            <div>
              <Label for="unit">Unit</Label>
              <Input
                id="unit"
                v-model="addItemForm.satuan"
                type="text"
                placeholder="pcs, kg, liter"
                class="mt-1"
              />
            </div>
          </div>

          <div>
            <Label for="minStock">Minimum Stock</Label>
            <Input
              id="minStock"
              v-model.number="addItemForm.minimum_stock"
              type="number"
              min="0"
              placeholder="5"
              class="mt-1"
            />
          </div>

          <Alert v-if="addItemError" variant="destructive">
            <AlertDescription>{{ addItemError }}</AlertDescription>
          </Alert>

          <div class="flex justify-end space-x-3">
            <Button @click="closeAddItemDialog" variant="outline">Cancel</Button>
            <Button @click="handleAddItem" :disabled="addItemProcessing">
              {{ addItemProcessing ? 'Adding...' : 'Add Item' }}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
import type { InventoryItem } from '@/stores/inventory'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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

const showUpdateDialog = ref(false)
const showRestockDialog = ref(false)
const showAddItemDialog = ref(false)
const selectedItem = ref<InventoryItem | null>(null)

const updateForm = reactive({
  newStock: 0,
  notes: '',
})

const restockForm = reactive({
  quantity: 1,
  notes: '',
})

const addItemForm = reactive({
  nama_barang: '',
  deskripsi: '',
  stok_terkini: 0,
  satuan: '',
  minimum_stock: 5,
})

const updateProcessing = ref(false)
const restockProcessing = ref(false)
const addItemProcessing = ref(false)
const updateError = ref('')
const restockError = ref('')
const addItemError = ref('')

onMounted(() => {
  inventoryStore.fetchItems()
})

/**
 * Opens the update stock dialog for a specific inventory item
 * This function prepares the form with current stock data and shows the dialog
 * @param item - The inventory item to update
 */
function openUpdateDialog(item: InventoryItem) {
  selectedItem.value = item
  updateForm.newStock = item.stok_terkini
  updateForm.notes = ''
  updateError.value = ''
  showUpdateDialog.value = true
}

/**
 * Closes the update stock dialog and resets form data
 * This ensures clean state when dialog is reopened
 */
function closeUpdateDialog() {
  showUpdateDialog.value = false
  selectedItem.value = null
  updateForm.newStock = 0
  updateForm.notes = ''
  updateError.value = ''
}

/**
 * Opens the restock dialog for adding new stock to an item
 * This function initializes the restock form with default values
 * @param item - The inventory item to restock
 */
function openRestockDialog(item: InventoryItem) {
  selectedItem.value = item
  restockForm.quantity = 1
  restockForm.notes = ''
  restockError.value = ''
  showRestockDialog.value = true
}

/**
 * Closes the restock dialog and resets form data
 * This ensures clean state when dialog is reopened
 */
function closeRestockDialog() {
  showRestockDialog.value = false
  selectedItem.value = null
  restockForm.quantity = 1
  restockForm.notes = ''
  restockError.value = ''
}

function closeAddItemDialog() {
  showAddItemDialog.value = false
  addItemForm.nama_barang = ''
  addItemForm.deskripsi = ''
  addItemForm.stok_terkini = 0
  addItemForm.satuan = ''
  addItemForm.minimum_stock = 5
  addItemError.value = ''
}

/**
 * Handles the stock update process
 * This function validates input, calls the API, and updates the UI accordingly
 * It also creates an audit trail entry for the stock update
 */
async function handleUpdateStock() {
  if (!selectedItem.value || updateProcessing.value) return

  updateProcessing.value = true
  updateError.value = ''

  try {
    // Call inventory store method to update stock
    // This will also create an audit log entry automatically
    const result = await inventoryStore.updateStock(
      selectedItem.value.id,
      updateForm.newStock,
      updateForm.notes,
    )

    if (result.success) {
      closeUpdateDialog()
    } else {
      updateError.value = result.error || 'Failed to update stock'
    }
  } catch (error) {
    updateError.value = 'An error occurred while updating stock'
    console.error('Update stock error:', error)
  } finally {
    updateProcessing.value = false
  }
}

/**
 * Handles the restock process for adding new inventory
 * This function validates input, calls the API, and updates the UI accordingly
 * It also creates an audit trail entry for the restock operation
 */
async function handleRestock() {
  if (!selectedItem.value || restockProcessing.value) return

  restockProcessing.value = true
  restockError.value = ''

  try {
    // Call inventory store method to restock item
    // This will also create an audit log entry automatically
    const result = await inventoryStore.restockItem(
      selectedItem.value.id,
      restockForm.quantity,
      restockForm.notes,
    )

    if (result.success) {
      closeRestockDialog()
    } else {
      restockError.value = result.error || 'Failed to restock item'
    }
  } catch (error) {
    restockError.value = 'An error occurred while restocking'
    console.error('Restock error:', error)
  } finally {
    restockProcessing.value = false
  }
}

async function handleAddItem() {
  if (addItemProcessing.value) return

  addItemProcessing.value = true
  addItemError.value = ''

  try {
    const result = await inventoryStore.createItem(addItemForm)

    if (result.success) {
      closeAddItemDialog()
    } else {
      addItemError.value = result.error || 'Failed to add item'
    }
  } catch (error) {
    addItemError.value = 'An error occurred while adding item'
    console.error('Add item error:', error)
  } finally {
    addItemProcessing.value = false
  }
}
</script>
