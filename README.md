# SIDIK-KAKAO

Platform Digital Ketertelusuran Kakao & Manajemen Kelompok Tani (Poktan).

![Astro](https://img.shields.io/badge/Astro-7.x-BC52EE?logo=astro&logoColor=white)
![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%2B%20Auth-3ECF8E?logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg)

---

## ✨ Core Features

### 📱 Mobile Module (Petani Lapangan)

- **Offline-first harvest logging** dengan fallback `localStorage` dan auto-sync engine saat koneksi kembali.
- **Simulated AI quality analysis** untuk klasifikasi Grade A/B dan deteksi jamur.
- **Instant Batch QR Label** untuk setiap setoran panen, siap cetak langsung dari browser.
- **Farmer profile view** dengan tampilan dinamis luas kebun (`estate_area_ha`).

### 🖥️ Admin Dashboard (Pengurus Poktan)

- **Multi-tenancy Poktan** berbasis Supabase RLS.
- **Registrasi petani dinamis** lewat server-side API route `/api/petani`.
- **Real-time verifikasi setoran** dan pelacakan batch panen end-to-end.
- **Grafik tren kontinu 6 bulan** (volume & harga) dengan baseline historis zero-filled.
- **Admin Helpdesk & FAQ** komprehensif untuk operasional harian.

---

## 🏗️ Architecture & Database Schema

SIDIK-KAKAO dibangun dengan Astro (server mode) + React untuk antarmuka, dan Supabase sebagai backend utama (database PostgreSQL, autentikasi, serta kebijakan akses data).

### Tabel Inti

| Tabel | Fungsi |
| --- | --- |
| `profiles` | Profil pengguna (petani/admin), role, relasi Poktan, dan metadata seperti `estate_area_ha`. |
| `poktans` | Data master kelompok tani (nama, lokasi, identitas tenant). |
| `harvest_batches` | Catatan batch setoran panen: grade, berat, nilai, status verifikasi, payload QR, dll. |
| `grade_prices` | Referensi harga per grade/kategori untuk kalkulasi nilai setoran. |

### Security Highlights

- **Row Level Security (RLS)** aktif untuk isolasi data antar-Poktan.
- **`service_role` backend validation** dipakai pada endpoint administratif (mis. pembuatan akun petani) untuk operasi terkontrol tingkat server.

---

## 🚀 Getting Started (Local Setup)

### 1) Clone & Install Dependency

```bash
git clone https://github.com/your-repo/FE-Sidik-Kakao.git
cd FE-Sidik-Kakao
bun install
```

### 2) Siapkan Environment Variables

Buat file `.env` dari template berikut:

```env
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> Opsional (direkomendasikan untuk backend route):  
> `SUPABASE_URL=https://your-project.supabase.co`

### 3) Jalankan Development Server

```bash
bun dev
```

App default akan berjalan di `http://localhost:4321`.

---

## 📦 Build & Deployment

### Build Produksi

```bash
bun build
```

### Preview Build Lokal

```bash
bun preview
```

### Deploy ke Vercel

- Proyek sudah menggunakan adapter `@astrojs/vercel`.
- Konfigurasi Astro output server-side (`output: "server"`).
- Pastikan seluruh environment variable Supabase tersedia di Vercel Project Settings.

---

## 📁 Directory Structure

```text
src/
├── components/   # UI components (mobile, dashboard, auth, layout)
├── pages/        # Astro pages + API routes (termasuk /api/petani)
├── lib/          # Integrasi Supabase & query layer
├── utils/        # Utility helper (offline sync, storage, QR, formatter)
└── data/         # Konten statis seperti FAQ/helpdesk
```

---

## 📜 License

This project is licensed under the **MIT License**.
