# LinkVault

Aplikasi bookmark manager berbasis React Native untuk menyimpan, mengorganisir, dan mengelola URL secara personal dengan antarmuka gelap (dark-themed) dan pengalaman pengguna premium.

## Fitur

- **Manajemen Bookmark** — Tambah, edit, hapus, dan cari bookmark dengan validasi URL real-time
- **Kategori** — Organisir bookmark ke dalam kategori berwarna (8 warna predefined)
- **Pencarian Real-time** — Cari bookmark berdasarkan judul, kategori, atau URL dengan debounce 300ms
- **Statistik Kunjungan** — Tracking jumlah kunjungan dan waktu terakhir dibuka
- **Live Preview** — Preview expandable pada setiap kartu bookmark
- **Share** — Bagikan bookmark via WhatsApp, Email, atau share sheet sistem
- **Export Data** — Export seluruh data bookmark dan kategori ke file JSON
- **100% Offline** — Semua data tersimpan lokal di SQLite, tidak memerlukan internet

## Tech Stack

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| React Native | 0.83.6 | Framework mobile |
| Expo SDK | ~55.0 | Development platform |
| Expo Router | ~55.0 | File-based navigation |
| Expo SQLite | ~55.0 | Database lokal |
| React | 19.2.0 | UI library |
| Plus Jakarta Sans | - | Typography |

## Struktur Proyek

```
LinkVault/
├── app/                          # Routes (Expo Router)
│   ├── _layout.jsx               # Root layout + DB init
│   ├── (tabs)/
│   │   ├── _layout.jsx           # Tab navigator + FAB
│   │   ├── index.jsx             # Dashboard (Home)
│   │   └── categories/
│   │       └── index.jsx         # Daftar kategori
│   ├── add-url.jsx               # Tambah bookmark (modal)
│   ├── edit-url.jsx              # Edit bookmark
│   ├── detail-url.jsx            # Detail bookmark
│   ├── settings.jsx              # Pengaturan
│   └── categories/
│       └── [id].jsx              # Detail kategori
├── components/                   # Reusable UI components
│   ├── BookmarkCard.jsx
│   ├── CategoryCard.jsx
│   ├── ColorPicker.jsx
│   ├── LivePreview.jsx
│   ├── ModalDialog.jsx
│   ├── SearchBar.jsx
│   └── ShareSheet.jsx
├── constants/                    # Design tokens
│   ├── colors.js                 # Palet warna
│   ├── typography.js             # Font sizes & weights
│   └── categories.js             # Warna & kategori default
├── database/                     # SQLite layer
│   ├── db.js                     # Koneksi database
│   ├── migrations.js             # Skema & migrasi
│   ├── bookmarkRepository.js     # CRUD bookmark
│   └── categoryRepository.js     # CRUD kategori
├── hooks/                        # Custom React hooks
│   ├── useBookmarks.js
│   ├── useCategories.js
│   ├── useSearch.js
│   └── useSettings.js
└── utils/                        # Helper functions
    ├── formatters.js
    ├── helpers.js
    └── validators.js
```

## Design System

### Palet Warna

| Token | Hex | Penggunaan |
|-------|-----|------------|
| `bg` | `#1A1A1A` | Background utama |
| `surface` | `#242424` | Kartu & modal |
| `surfaceVariant` | `#2D2D2D` | Input & tombol sekunder |
| `gold` | `#D4AF37` | Aksen utama, FAB, CTA |
| `textPrimary` | `#FFFFFF` | Teks utama |
| `textSecondary` | `#B8B8B8` | Teks sekunder |
| `textTertiary` | `#7A7A7A` | Teks placeholder |

### Tipografi

Font: **Plus Jakarta Sans** dengan weight 400/500/600/700 dan ukuran 10px–32px.

## Instalasi

```bash
# Clone repository
git clone <repo-url>
cd LinkVault

# Install dependencies
npm install

# Jalankan di development
npx expo start
```

## Database

Menggunakan SQLite dengan migrasi berbasis `PRAGMA user_version`. Tabel:

- **`categories`** — id, name, color, created_at, updated_at
- **`bookmarks`** — id, title, url, icon_url, category_id (FK), notes, visit_count, last_visited, created_at, updated_at

6 kategori default di-seed saat pertama kali: Uncategorized, Design, Development, Resources, Marketing, Personal.

## Scripts

| Command | Deskripsi |
|---------|-----------|
| `npm start` | Mulai Expo dev server |
| `npm run android` | Jalankan di Android |
| `npm run ios` | Jalankan di iOS |
| `npm run web` | Jalankan di web |
