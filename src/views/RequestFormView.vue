<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <div class="max-w-2xl mx-auto">
      <div class="mb-8">
        <h1 class="text-2xl font-semibold text-gray-900">Form Pengajuan Permintaan Barang</h1>
        <p class="mt-2 text-sm text-gray-700">
          Isi form di bawah untuk mengajukan permintaan barang
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detail Permintaan</CardTitle>
        </CardHeader>
        <CardContent>
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Item Selection -->
            <div>
              <Label for="item">Pilih Barang</Label>
              <select
                id="item"
                v-model="form.itemId"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                required
                @change="onItemSelect"
              >
                <option value="">Pilih barang...</option>
                <option v-for="item in availableItems" :key="item.id" :value="item.id">
                  {{ item.nama_barang }} - Stok: {{ item.stok_terkini }} {{ item.satuan }}
                </option>
              </select>
            </div>

            <!-- Selected Item Info -->
            <div v-if="selectedItem" class="bg-blue-50 p-4 rounded-lg">
              <h3 class="text-sm font-medium text-blue-900">Informasi Barang</h3>
              <div class="mt-2 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-blue-700 font-medium">Nama:</span>
                  <span class="ml-2">{{ selectedItem.nama_barang }}</span>
                </div>
                <div>
                  <span class="text-blue-700 font-medium">Deskripsi:</span>
                  <span class="ml-2">{{ selectedItem.deskripsi }}</span>
                </div>
                <div>
                  <span class="text-blue-700 font-medium">Stok Tersedia:</span>
                  <span class="ml-2"
                    >{{ selectedItem.stok_terkini }} {{ selectedItem.satuan }}</span
                  >
                </div>
                <div>
                  <span class="text-blue-700 font-medium">Unit:</span>
                  <span class="ml-2">{{ selectedItem.satuan }}</span>
                </div>
              </div>
            </div>

            <!-- Quantity Input -->
            <div>
              <Label for="quantity">Jumlah yang Dibutuhkan</Label>
              <Input
                id="quantity"
                v-model.number="form.quantity"
                type="number"
                min="1"
                :max="selectedItem?.stok_terkini || 999"
                placeholder="Masukkan jumlah"
                required
                class="mt-1"
              />
              <p v-if="selectedItem" class="mt-1 text-sm text-gray-500">
                Maksimal: {{ selectedItem.stok_terkini }} {{ selectedItem.satuan }}
              </p>
            </div>

            <!-- Urgent Checkbox -->
            <div class="flex items-center space-x-2">
              <input
                id="urgent"
                v-model="form.isUrgent"
                type="checkbox"
                class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <Label for="urgent" class="text-sm">Ini adalah permintaan urgent</Label>
            </div>

            <!-- Stock Validation Alert -->
            <Alert v-if="stockError" variant="destructive">
              <AlertDescription>
                {{ stockError }}
              </AlertDescription>
            </Alert>

            <!-- Success Alert -->
            <Alert v-if="successMessage" variant="default" class="bg-green-50 border-green-200">
              <AlertDescription class="text-green-800">
                {{ successMessage }}
              </AlertDescription>
            </Alert>

            <!-- Submit Button -->
            <div class="flex justify-end space-x-4">
              <Button type="button" variant="outline" @click="$router.back()"> Kembali </Button>
              <Button type="submit" :disabled="loading || !isFormValid">
                {{ loading ? 'Mengirim...' : 'Kirim Permintaan' }}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useInventoryStore } from '@/stores/inventory'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

const route = useRoute()
const router = useRouter()
const inventoryStore = useInventoryStore()

const loading = ref(false)
const stockError = ref('')
const successMessage = ref('')

const form = reactive({
  itemId: 0,
  quantity: 1,
  isUrgent: false,
})

const availableItems = computed(() => inventoryStore.items.filter((item) => item.stok_terkini > 0))

const selectedItem = computed(() => inventoryStore.items.find((item) => item.id === form.itemId))

const isFormValid = computed(() => {
  return (
    form.itemId &&
    form.quantity > 0 &&
    selectedItem.value &&
    form.quantity <= selectedItem.value.stok_terkini
  )
})

// Watch for quantity changes to validate stock
watch(
  () => form.quantity,
  (newQuantity) => {
    if (selectedItem.value && newQuantity > selectedItem.value.stok_terkini) {
      stockError.value = `Stok tidak mencukupi! Tersedia hanya ${selectedItem.value.stok_terkini} ${selectedItem.value.satuan}`
    } else {
      stockError.value = ''
    }
  },
)

onMounted(() => {
  inventoryStore.fetchItems()

  // Pre-select item if passed from query
  if (route.query.itemId) {
    form.itemId = parseInt(route.query.itemId as string)
  }
})

function onItemSelect() {
  // Reset quantity when item changes
  form.quantity = 1
  stockError.value = ''
}

async function handleSubmit() {
  if (!isFormValid.value) return

  loading.value = true
  stockError.value = ''
  successMessage.value = ''

  try {
    const result = await inventoryStore.createRequest(form.itemId, form.quantity, form.isUrgent)

    if (result.success) {
      successMessage.value = 'Permintaan berhasil dikirim! Status akan diupdate oleh admin.'

      // Reset form
      form.itemId = 0
      form.quantity = 1
      form.isUrgent = false

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard/user')
      }, 2000)
    } else {
      stockError.value = result.error || 'Gagal mengirim permintaan'
    }
  } catch (error) {
    stockError.value = 'Terjadi kesalahan sistem'
    console.error('Submit error:', error)
  } finally {
    loading.value = false
  }
}
</script>
