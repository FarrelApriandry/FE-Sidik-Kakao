# Product Requirement Document (PRD): SIDIK-KAKAO

## 1. Overview & Core Objective

**SIDIK-KAKAO** (Sistem Digital Ketertelusuran & Manajemen Kakao) adalah platform berbasis web (Hybrid SSR) yang mendukung manajemen panen kakao, transparansi rantai pasok (traceability), dan pencatatan berbasis kelompok tani (Poktan).

* **Target Pengguna:**
* **Petani Lapangan:** Antarmuka mobile-first untuk mencatat panen, pemindaian AI kualitatif, dan pencetakan label QR.
* **Admin Poktan:** Antarmuka desktop dashboard untuk mengelola anggota, memverifikasi setoran panen, menetapkan acuan harga, dan memantau analitik.



---

## 2. Technical Architecture & Stack

* **Frontend Framework:** Astro (Server/Hybrid SSR Mode) + React 19
* **Styling & UI Components:** Tailwind CSS + Google Material Symbols
* **Database & Auth:** Supabase (PostgreSQL, Supabase Auth)
* **Adapter & Deployment:** `@astrojs/vercel` (Vercel Serverless Functions)
* **Runtime & Package Manager:** Bun / Node.js

---

## 3. Database Schema & Security Constraints

### 3.1 Key Tables

1. `poktans`: `id` (UUID, PK), `name`, `location`.
2. `profiles`: `id` (UUID, FK to auth.users), `poktan_id` (FK), `full_name`, `role` (`'admin_poktan'` | `'petani'`), `phone_number`, `estate_area_ha`.
3. `harvest_batches`: `id` (Text/PK), `farmer_id` (FK), `poktan_id` (FK), `weight_kg`, `category` (`'basah'` | `'fermentasi'` | `'kering'`), `grade` (`'A'` | `'B'`), `grade_label`, `moisture_pct`, `price_per_kg`, `total_value`, `status` (`'Proses Curing'` | `'Terverifikasi'`), `qr_payload` (JSONB).
4. `grade_prices`: `id` (UUID, PK), `grade`, `category`, `price_per_kg`.

### 3.2 Security Rules & Multi-Tenancy

* **Service Role Isolation:** `SUPABASE_SERVICE_ROLE_KEY` wajib digunakan **hanya** di sisi server Astro API Route (`src/pages/api/*`).
* **Database Row Level Security (RLS):**
* Admin Poktan hanya dapat membaca/mengubah data yang memiliki `poktan_id` sama dengan profil admin tersebut.
* Petani hanya dapat membaca/menulis data panen milik dirinya sendiri (`farmer_id = auth.uid()`).


* **Zero Hardcoded Credentials:** Dilarang menggunakan fallback dummy ID (`SEED_POKTAN_ID`) atau demo bypass di lingkungan produksi.

---

## 4. Module Specifications

### 4.1 Mobile Petani Module (`/petani/*`)

* **Layout:** Mobile-first container (`max-w-[430px]`).
* **Fitur Catat Panen (`/petani/catat`):**
* Input berat panen (kg) & kategori biji (Basah, Fermentasi, Kering).
* Simulasi analisis AI untuk deteksi Grade (A/B) dan status jamur.
* Kalkulasi nilai estimasi reaktif berdasarkan acuan harga dari tabel `grade_prices`.
* Pencatatan offline-first (Local Storage) dengan mesin autosinkronisasi saat koneksi internet aktif.
* Modal penampil label QR Batch beserta opsi cetak via browser.


* **Fitur Akun Saya (`/petani/akun`):**
* Menampilkan informasi profil, nama Poktan, dan atribut luas lahan (`estate_area_ha`).
* Antrean sinkronisasi lokal dan aksi pemicu sinkronisasi manual.



### 4.2 Admin Poktan Dashboard (`/dashboard/*`)

* **Layout:** Desktop Sidebar + Header Shell.
* **Manajemen Petani (`/dashboard/petani`):**
* Tabel daftar anggota Poktan.
* Modal form "Tambah Petani" yang memanggil endpoint `/api/petani`.


* **Rekap Panen & Verifikasi (`/dashboard/panen`):**
* Verifikasi setoran panen, penyesuaian kadar air (`moisture_pct`), dan konfirmasi status menjadi `'Terverifikasi'`.


* **Ketertelusuran & Detail Batch (`/dashboard/ketertelusuran`):**
* Pelacakan riwayat batch panen dan pencetakan ulang label QR.


* **Pusat Bantuan Admin (`/dashboard/bantuan`):**
* Panduan operasional non-teknis untuk pengurus Poktan (SOP pencatatan, verifikasi, dan bantuan layanan).



### 4.3 Server API Routes (`src/pages/api/*`)

* **Endpoint `/api/petani` (POST):**
* Memverifikasi token autentikasi Admin via header `Authorization: Bearer <token>`.
* Memastikan role eksekutor adalah `'admin_poktan'`.
* Memanggil `adminClient.auth.admin.createUser()` untuk meregistrasikan akun baru tanpa memutus sesi login Admin.
* Melakukan `.update()` pada baris `profiles` yang dibuat oleh trigger Supabase untuk menyimpan detail nama, nomor telepon, luas lahan, dan `poktan_id`.



---

## 5. Non-Functional Requirements & Acceptance Criteria

1. **Build Integrity:** Bebas dari TypeScript error dan lulus perintah `bun run build`.
2. **Error Handling & Sanitasi Log:** Menampilkan pesan error yang ramah pengguna di UI dan menyanitasi error log server agar tidak mengekspos metadata internal.
3. **Responsive UI:** Tampilan konsisten pada resolusi mobile (360px–430px) untuk modul petani dan desktop (>= 1024px) untuk modul admin.