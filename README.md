# GudangKita - Frontend

Sistem Manajemen Gudang berbasis Vue.js dengan Tailwind CSS dan ShadCN Vue components.

## 🚀 Fitur Utama

### Untuk User:
- **Dashboard User**: Tampilan stok real-time dengan informasi lengkap
- **Form Pengajuan**: Request barang dengan validasi stok otomatis
- **Notifikasi**: Alert jika stok tidak mencukupi

### Untuk Admin:
- **Dashboard Admin**: Monitoring stok real-time dan statistik
- **Manajemen Request**: Approve/reject permintaan dengan feedback
- **Update Stok**: Manual stock updates dan restock management
- **Laporan**: View dan download transaction history

### Fitur Khusus:
- **Kanal Umum**: Form permintaan urgent tanpa login
- **Real-time Updates**: Stok terupdate secara real-time
- **Export Data**: Download laporan dalam format CSV/PDF

## 🛠️ Tech Stack

- **Vue.js 3** - Progressive JavaScript framework
- **TypeScript** - Type safety
- **Vite** - Build tool dan dev server
- **Vue Router** - Client-side routing
- **Pinia** - State management
- **Tailwind CSS** - Utility-first CSS framework
- **ShadCN Vue** - High-quality component library
- **Lucide Vue** - Icon library

## 📋 Prerequisites

- Node.js 20+ (gunakan nvm untuk mengganti versi)
- npm atau yarn

## 🏃‍♂️ Quick Start

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd gudangkita-web-app/gudangkita-frontend
   ```

2. **Setup Node.js version**
   ```bash
   nvm use 20
   # atau nvm install 20 jika belum terinstall
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   - Buka http://localhost:5173

## 🎯 Task List Implementation

Semua fitur telah diimplementasi sesuai dengan task list:

### ✅ Page Structure & Routing
- [x] Halaman Login (User/Admin)
- [x] Dashboard User
- [x] Dashboard Admin  
- [x] Form Pengajuan Permintaan Barang (User)
- [x] Daftar Request (Admin)
- [x] Kanal Umum (permintaan urgent tanpa login)

### ✅ UI/UX Design Implementation
- [x] Login Page dengan form input username & password
- [x] User Dashboard dengan tampilan stok real-time
- [x] Admin Dashboard dengan monitoring stok dan navigasi
- [x] Form Pengajuan dengan pilihan barang dan validasi stok
- [x] Daftar Request dengan tombol approve/reject dan feedback
- [x] Update & Restock forms untuk admin
- [x] Kanal Umum untuk permintaan urgent

### ✅ API Integration Ready
- [x] Authentication endpoints setup
- [x] Inventory data fetching
- [x] Request submission dan approval
- [x] Stock update operations
- [x] Real-time stock monitoring
- [x] Report generation dan download

### ✅ Additional Features
- [x] Laporan transaksi dan history
- [x] Export functionality (CSV)
- [x] Responsive design
- [x] Modern UI dengan ShadCN components

## 📁 Struktur Project

```
src/
├── components/
│   └── ui/              # ShadCN Vue components
├── stores/
│   ├── auth.ts          # Authentication state
│   └── inventory.ts     # Inventory management state
├── views/
│   ├── LoginView.vue
│   ├── DashboardLayout.vue
│   ├── UserDashboard.vue
│   ├── AdminDashboard.vue
│   ├── RequestFormView.vue
│   ├── AdminRequestsView.vue
│   ├── AdminInventoryView.vue
│   ├── PublicRequestView.vue
│   └── ReportsView.vue
├── router/
│   └── index.ts         # Route configuration
├── assets/
│   └── main.css         # Tailwind dan custom styles
└── main.ts
```

## 🎨 Design System

### Colors
- Primary: Blue theme
- Secondary: Gray tones
- Success: Green
- Warning: Yellow  
- Danger: Red

### Components
- Menggunakan ShadCN Vue untuk konsistensi
- Responsive design dengan Tailwind CSS
- Clean dan modern interface

## 🚀 Build untuk Production

```bash
npm run build
```

## 🧪 Testing

```bash
# Unit tests
npm run test:unit

# E2E tests  
npm run test:e2e
```

## 📝 Notes

1. **Backend Integration**: Semua API calls sudah disiapkan dengan placeholder endpoints. Ganti URL dan implement authentication headers sesuai backend API.

2. **State Management**: Menggunakan Pinia untuk state yang reactive dan persistent.

3. **Real-time Updates**: Siap diintegrasikan dengan WebSocket atau Server-Sent Events.

4. **Authentication**: JWT token disimpan di localStorage dengan automatic logout jika expired.

5. **Export Features**: CSV export sudah implemented, PDF export butuh library tambahan seperti jsPDF.

## 🔧 Development Commands

```bash
# Development server
npm run dev

# Build production
npm run build

# Preview production build  
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format
```

## 🌐 Demo Users

Untuk testing, system mendukung:
- **Admin users**: Full access ke semua fitur
- **Regular users**: Dashboard dan request functionality
- **Public access**: Emergency request form

## 📞 Support

Untuk pertanyaan atau issue, silakan buat GitHub issue atau contact tim development.

---

*Happy coding! 🎉*
