<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-2xl mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-extrabold text-gray-900">Kanal Umum - Permintaan Urgent</h1>
        <p class="mt-2 text-sm text-gray-600">Form permintaan barang urgent tanpa perlu login</p>
        <p class="mt-1 text-xs text-red-600">
          Hanya untuk kebutuhan mendesak yang tidak bisa menunggu
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Permintaan Urgent</CardTitle>
        </CardHeader>
        <CardContent>
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Contact Information -->
            <div class="space-y-4">
              <h3 class="text-lg font-medium text-gray-900">Informasi Kontak</h3>

              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label for="name">Nama Lengkap</Label>
                  <Input
                    id="name"
                    v-model="form.name"
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    required
                    class="mt-1"
                  />
                </div>

                <div>
                  <Label for="phone">Nomor Telepon</Label>
                  <Input
                    id="phone"
                    v-model="form.phone"
                    type="tel"
                    placeholder="Contoh: 08123456789"
                    required
                    class="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label for="email">Email (Opsional)</Label>
                <Input
                  id="email"
                  v-model="form.email"
                  type="email"
                  placeholder="email@example.com"
                  class="mt-1"
                />
              </div>

              <div>
                <Label for="department">Departemen/Bagian</Label>
                <Input
                  id="department"
                  v-model="form.department"
                  type="text"
                  placeholder="Contoh: IT, Marketing, Operations"
                  required
                  class="mt-1"
                />
              </div>
            </div>

            <hr />

            <!-- Request Information -->
            <div class="space-y-4">
              <h3 class="text-lg font-medium text-gray-900">Detail Permintaan</h3>

              <div>
                <Label for="itemName">Nama Barang yang Diminta</Label>
                <Input
                  id="itemName"
                  v-model="form.itemName"
                  type="text"
                  placeholder="Contoh: Kertas A4, Spidol, Kabel HDMI"
                  required
                  class="mt-1"
                />
              </div>

              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label for="quantity">Jumlah yang Dibutuhkan</Label>
                  <Input
                    id="quantity"
                    v-model.number="form.quantity"
                    type="number"
                    min="1"
                    placeholder="1"
                    required
                    class="mt-1"
                  />
                </div>

                <div>
                  <Label for="unit">Satuan</Label>
                  <Input
                    id="unit"
                    v-model="form.unit"
                    type="text"
                    placeholder="pcs, kg, liter, pack"
                    required
                    class="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label for="urgency">Tingkat Urgensi</Label>
                <select
                  id="urgency"
                  v-model="form.urgency"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  required
                >
                  <option value="">Pilih tingkat urgensi</option>
                  <option value="high">Sangat Urgent (&lt; 2 jam)</option>
                  <option value="medium">Urgent (&lt; 1 hari)</option>
                  <option value="low">Cukup Urgent (&lt; 3 hari)</option>
                </select>
              </div>

              <div>
                <Label for="reason">Alasan Permintaan Urgent</Label>
                <textarea
                  id="reason"
                  v-model="form.reason"
                  rows="4"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  placeholder="Jelaskan mengapa permintaan ini urgent dan tidak bisa menunggu proses normal..."
                  required
                ></textarea>
              </div>

              <div>
                <Label for="deadline">Batas Waktu Dibutuhkan</Label>
                <Input
                  id="deadline"
                  v-model="form.deadline"
                  type="datetime-local"
                  required
                  class="mt-1"
                  :min="minDateTime"
                />
              </div>
            </div>

            <!-- Validation Alert -->
            <Alert v-if="error" variant="destructive">
              <AlertDescription>
                {{ error }}
              </AlertDescription>
            </Alert>

            <!-- Success Alert -->
            <Alert v-if="successMessage" variant="default" class="bg-green-50 border-green-200">
              <AlertDescription class="text-green-800">
                {{ successMessage }}
              </AlertDescription>
            </Alert>

            <!-- Disclaimer -->
            <div class="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-yellow-800">Perhatian!</h3>
                  <div class="mt-2 text-sm text-yellow-700">
                    <p>
                      • Permintaan ini akan langsung dikirim ke admin untuk review<br />
                      • Pastikan informasi kontak yang Anda berikan benar<br />
                      • Admin akan menghubungi Anda untuk konfirmasi<br />
                      • Gunakan jalur ini hanya untuk kebutuhan yang benar-benar urgent
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Submit Button -->
            <div class="flex justify-end space-x-4">
              <Button type="button" variant="outline" @click="$router.push('/login')">
                Login Normal
              </Button>
              <Button type="submit" :disabled="loading || !isFormValid">
                {{ loading ? 'Mengirim...' : 'Kirim Permintaan Urgent' }}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useInventoryStore } from '@/stores/inventory'

const router = useRouter()
const inventoryStore = useInventoryStore()

const loading = ref(false)
const error = ref('')
const successMessage = ref('')

const form = reactive({
  name: '',
  phone: '',
  email: '',
  department: '',
  itemName: '',
  quantity: 1,
  unit: '',
  urgency: '',
  reason: '',
  deadline: '',
})

const minDateTime = computed(() => {
  const now = new Date()
  now.setMinutes(now.getMinutes() + 30) // Minimum 30 minutes from now
  return now.toISOString().slice(0, 16)
})

const isFormValid = computed(() => {
  return (
    form.name.trim() &&
    form.phone.trim() &&
    form.department.trim() &&
    form.itemName.trim() &&
    form.quantity > 0 &&
    form.unit.trim() &&
    form.urgency &&
    form.reason.trim() &&
    form.deadline
  )
})

async function handleSubmit() {
  if (!isFormValid.value) return

  loading.value = true
  error.value = ''
  successMessage.value = ''

  try {
    const result = await inventoryStore.createPublicRequest(
      // Find item by name (simplified for demo)
      1, // This would need proper item selection in a real app
      form.quantity,
      form.name,
      `${form.phone}${form.email ? ' / ' + form.email : ''}`,
    )

    if (result.success) {
      successMessage.value =
        'Permintaan urgent berhasil dikirim! Admin akan segera menghubungi Anda.'

      // Reset form
      form.name = ''
      form.phone = ''
      form.email = ''
      form.department = ''
      form.itemName = ''
      form.quantity = 1
      form.unit = ''
      form.urgency = ''
      form.reason = ''
      form.deadline = ''

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } else {
      throw new Error(result.error || 'Failed to submit request')
    }
  } catch (err) {
    error.value = 'Terjadi kesalahan sistem. Silakan coba lagi atau hubungi admin langsung.'
    console.error('Submit error:', err)
  } finally {
    loading.value = false
  }
}
</script>
