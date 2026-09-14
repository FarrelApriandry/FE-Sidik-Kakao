# System Design Specification: SIDIK-KAKAO Web Dashboard

**Versi Dokumen:** 1.0.0  
**Tanggal:** 12 September 2026  
**Status:** Approved for Implementation  
**Referensi Layout:** `mockup-web-design.html`  
**Domain Aplikasi:** Platform Agroteknologi & Ketertelusuran Rantai Pasok Kakao (Kelompok Tani / Poktan)

---

## 1. Visi Produk & Ringkasan Sistem

### 1.1 Latar Belakang & Tujuan
**SIDIK-KAKAO** adalah platform digital yang dirancang khusus untuk memodernisasi tata kelola pengumpulan, penjaminan mutu, transparansi harga, dan ketertelusuran (traceability) komoditas kakao di tingkat Kelompok Tani (Poktan). Sistem ini menjembatani transaksi fisik setoran panen petani dengan verifikasi digital berbasis QR Code dan analitik presisi bertenaga AI.

### 1.2 Target Pengguna (User Personas)
1. **Admin Poktan (Primary User):**
   - Bertanggung jawab mencatat setoran, memverifikasi fisik & kadar air, mencetak label QR, dan mengelola rekapitulasi penjualan.
   - Membutuhkan antarmuka yang efisien, responsif di perangkat mobile/tablet lapangan, serta dapat bekerja secara offline (Offline-First).
2. **Pengurus & Ketum Poktan:**
   - Memantau tren produksi bulanan, margin harga pasar vs harga beli poktan, dan distribusi kualitas (Grade A/B/Non-standard).
3. **Auditor / Buyer Kakao (Secondary User):**
   - Memerlukan transparansi rantai pasok dan verifikasi skor ketertelusuran produk hingga ke petak kebun petani.

---

## 2. Design Tokens & Design System Specification

### 2.1 Palette Warna (Color Palette)

Design system SIDIK-KAKAO menggabungkan warna **Brand (Agri Green)** yang melambangkan kesuburan pertanian, **Cacao (Earth Brown)** sebagai aksen kearifan lokal komoditas kakao, serta **Neutral Slate** untuk kejernihan data visual.

#### A. Brand Palette (Primary Green)
| Token Name | Hex Code | Usage Context |
| :--- | :--- | :--- |
| `brand-50` | `#f2f9f4` | Background active tab, soft highlight, chip background |
| `brand-100` | `#e1f2e5` | Avatar background, hover state soft elements |
| `brand-600` | `#2e6f40` | Primary action buttons, primary chart line, primary icons |
| `brand-700` | `#11562a` | Text active navigation, primary headings, key highlight text |
| `brand-800` | `#0a421e` | Dark text contrast, deep brand accents |

#### B. Cacao Palette (Secondary Earth/Brown Accent)
| Token Name | Hex Code | Usage Context |
| :--- | :--- | :--- |
| `cacao-500` | `#775652` | Secondary chart series (Harga), Cacao metric icons, Grade B indicator |
| `cacao-700` | `#4a2e2b` | Deep brown headings, secondary branding accents |

#### C. Neutral Slate Palette (Base UI)
| Token Name | Hex Code | Usage Context |
| :--- | :--- | :--- |
| `slate-50` | `#f8fafc` | Page body background (`bg-slate-50`) |
| `slate-100` | `#f1f5f9` | Input fields, secondary buttons, table hover backgrounds |
| `slate-200` | `#e2e8f0` | Dividers, card borders (`border-slate-200/80`) |
| `slate-400` | `#94a3b8` | Placeholder text, inactive icons |
| `slate-500` | `#64748b` | Subtitles, label text, secondary metadata |
| `slate-600` | `#475569` | Navigation text default, table header labels |
| `slate-700` | `#334155` | Body text secondary, interactive item text |
| `slate-800` | `#1e293b` | Primary body text |
| `slate-900` | `#0f172a` | Main headings, title text (`font-bold text-slate-900`) |

#### D. Semantic & Status Colors
| Status / Context | Background | Border | Text / Icon | Meaning |
| :--- | :--- | :--- | :--- | :--- |
| **Success / Verified** | `bg-emerald-100` | - | `text-emerald-800` / `#10b981` | QR Status Terverifikasi, Grade A SNI, Trend positif |
| **Warning / Process** | `bg-amber-50` | `border-amber-200` | `text-amber-900` / `#f59e0b` | AI Alert Cuaca, Status Curing / Jemur, Grade B |
| **Danger / Alert** | `bg-red-500` | - | White / `text-red-500` | Quality non-standard, notification badge dot |

---

### 2.2 Tipografi (Typography)

Sistem tipografi menggunakan kombinasi dua typeface modern untuk membedakan struktur judul berkarakter (Display) dengan teks bacaan berpresisi tinggi (Body).

* **Display Font:** `Plus Jakarta Sans`, sans-serif
  * *Peruntukan:* Brand logo, H1 Title, Headings (H2/H3), KPI Big Numbers, Chart Center Stats.
  * *Weight:* SemiBold (600), Bold (700), ExtraBold (800).
* **Body Font:** `Inter`, sans-serif
  * *Peruntukan:* Navigation text, form input, table body, metadata labels, status chips, general body copy.
  * *Weight:* Regular (400), Medium (500), SemiBold (600).
* **Iconography:** `Material Symbols Outlined` (atau `Lucide Icons` setara)
  * Size standard: `14px` (inline trend), `18px` (kpi icon/search), `20px` (nav & topbar), `24px` (menu toggle).

#### Scale Hierarchy Table
| Element | Font Family | Size (px / rem) | Weight | Line Height | Letter Spacing |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **H1 (Page Title)** | Plus Jakarta Sans | 24px / 1.5rem | Bold (700) | 1.25 | `-0.025em` (tight) |
| **H2 (Section Header)**| Plus Jakarta Sans | 16px / 1.0rem | Bold (700) | 1.35 | Normal |
| **KPI Big Numbers** | Plus Jakarta Sans | 24px / 1.5rem | Bold (700) | 1.0 | Normal |
| **Nav Text** | Inter | 14px / 0.875rem | Medium (500) / Semi (600) | 1.25 | Normal |
| **Body Text** | Inter | 14px / 0.875rem | Regular (400) | 1.4 | Normal |
| **Table Header** | Inter | 12px / 0.75rem | SemiBold (600) | 1.2 | Normal |
| **Caption / Badge** | Inter | 11px - 12px | SemiBold (600) | 1.2 | `0.025em` (wider for uppercase) |

---

### 2.3 Spacing, Borders & Shadows

* **Border Radius System:**
  * Small Badges / Chips: `rounded-md` (6px) atau `rounded-lg` (8px)
  * Input & Buttons: `rounded-xl` (12px)
  * Cards & Containers: `rounded-xl` (12px)
  * Avatars / Badges Pill: `rounded-full` (9999px)
* **Shadow System:**
  * Default Cards: `shadow-xs` (`box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05)`)
  * Hover Elevate: `shadow-sm` hingga `shadow`
  * Brand Icon Box: `shadow-sm`
* **Grid Spacing:**
  * Base Padding Layout: Mobile `px-4`, Desktop `px-8`
  * Section Gap: `space-y-6` (24px)
  * Grid Gap: `gap-4` (16px) untuk KPI Cards, `gap-6` (24px) untuk Section Analytics.

---

## 3. Arsitektur Layout & Struktur Antarmuka

### 3.1 Layout Shell Structure (App Layout)

Aplikasi menggunakan pola **Sticky Header + Fixed Collapsible Sidebar Layout** yang dioptimalkan untuk performa desktop dan kenyamanan layar sentuh mobile.


```

+-----------------------------------------------------------------------------------+
| SIDEBAR (Fixed W: 64 / 256px)       | TOP HEADER (Sticky H: 16 / 64px)            |
| - Logo & Poktan Name                | [Menu Toggle] [Search] | [Season] (🔔) [User] |
| - Nav Items                         +---------------------------------------------+
|   * Dashboard (Active)              | MAIN CONTENT AREA (Scrollable)              |
|   * Data Petani                     |                                             |
|   * Rekap Panen                     | 1. Page Header & Primary Action (Setor)     |
|   * Ketertelusuran                  | 2. AI Early Warning Banner (Alert)          |
|   * AI Insight                      | 3. KPI Summary Grid (4 Cards)               |
|                                     | 4. Analytics Section (Trend SVG + Donut)    |
| - Bottom Offline Sync Card          | 5. Recent Transactions Table                |
| - Support Link                      |                                             |
+-----------------------------------------------------------------------------------+

```

### 3.2 Responsive Breakpoints Strategy
* **Mobile (`< 640px`):**
  * Sidebar tersembunyi secara default (`-translate-x-full`).
  * Muncul via overlay drawer (`z-50`) saat tombol hamburger diklik.
  * Search bar di topbar tersembunyi untuk menghemat area visual.
  * KPI Cards berubah menjadi layout 1 kolom.
  * Tabel setoran menggunakan scroll horizontal (`overflow-x-auto`).
* **Tablet (`640px - 1023px`):**
  * Grid KPI Cards menggunakan layout 2 kolom (`sm:grid-cols-2`).
  * Header menampilkan search bar dan indikator musim panen.
* **Desktop (`≥ 1024px`):**
  * Sidebar permanen di sisi kiri (`lg:translate-x-0`, width `16rem` / 256px).
  * Main content bergeser dengan margin kiri (`lg:pl-64`).
  * KPI Cards 4 kolom sejajar (`lg:grid-cols-4`).
  * Analytics Section terbagi 7:5 (Trend Chart : Quality Donut Chart).

---

## 4. Spesifikasi Komponen UI (Component Specifications)

### 4.1 Navigation Sidebar (`<aside>`)
* **Logo Header:**
  * Icon box 36x36px (`bg-brand-600`, `rounded-xl`, shadow halus).
  * Judul: "SIDIK-KAKAO" (`font-display font-bold text-base text-slate-900`).
  * Sub-label: "Poktan Kakao Utama" (`text-xs text-slate-500`).
* **Menu Links:**
  * Item Aktif: `bg-brand-50 text-brand-700 font-semibold` dengan icon `space_dashboard`.
  * Item Inaktif: `text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium`.
  * Efek Transisi: `transition-colors duration-150`.
* **Bottom Offline Sync Card:**
  * Container: `bg-slate-50 border border-slate-200/60 rounded-xl p-3`.
  * Status Indicator: Dot `h-2 w-2 rounded-full bg-emerald-500` dengan efek `animate-pulse`.
  * Label: "Sinkron Aktif" (`text-xs font-semibold`), Sub: "Offline-Ready" (`text-[11px] text-slate-500`).

### 4.2 Top Header (`<header>`)
* **Properti Layout:** `sticky top-0 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 z-30`.
* **Search Input:**
  * Container: `w-64 bg-slate-100 rounded-xl h-9 pl-9 pr-3 text-xs`.
  * Placeholder: "Cari petani, lot, batch...".
* **Season Selector:**
  * Pill container: `bg-slate-100 px-3 py-1.5 rounded-xl text-xs text-slate-700 font-medium`.
  * Icon: `calendar_month` (`text-cacao-500`).
* **User Profile Pill:**
  * Avatar circle: `h-8 w-8 rounded-full bg-brand-100 text-brand-700 font-bold border border-brand-600/20`.
  * Text Info: "Admin Poktan" (Bold), Sub: "Luwu Utara".

### 4.3 AI Early Warning Alert Banner
* **Visual Styling:** `bg-amber-50/90 border border-amber-200 p-4 rounded-xl shadow-xs`.
* **Icon Warning Box:** `h-9 w-9 bg-amber-500 text-white rounded-lg flex items-center justify-center`.
* **Konten Informasi:**
  * Tag Top: `Peringatan Cuaca AI` (`text-xs font-bold text-amber-900 tracking-wider`) + `• BMKG Luwu`.
  * Description: "Curah hujan tinggi 5 hari ke depan. Potensi kenaikan kadar air biji **+2.5%**."
* **Action CTA:** Button "Rekomendasi Mitigasi" (`bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium h-9 px-3.5 rounded-lg`).

### 4.4 Metric KPI Cards (4 Items Grid)
Setiap kartu didesain melayang dengan bingkai `border-slate-200/80` dan latar belakang putih `bg-white`.

1. **Total Produksi:**
   * Nilai Utama: `12.4 Ton` (`font-display font-bold text-2xl`).
   * Metrik Pembanding: `+18.2% vs target` (`text-emerald-700 font-medium` + icon `arrow_upward`).
   * Icon Badge: `scale` dengan `bg-brand-50 text-brand-600`.
2. **Petani Aktif Setor:**
   * Nilai Utama: `48 / 50 Orang`.
   * Metrik Pembanding: `96% partisipasi poktan`.
   * Icon Badge: `groups` dengan `bg-slate-100 text-slate-700`.
3. **Rata-Rata Harga:**
   * Nilai Utama: `Rp 50.000 /Kg`.
   * Metrik Pembanding: `+Rp 2.000 vs pasar lokal` (`text-emerald-700`).
   * Icon Badge: `payments` dengan `bg-amber-50 text-cacao-500`.
4. **Skor Ketertelusuran:**
   * Nilai Utama: `98%` (`text-brand-700`).
   * Metrik Pembanding: `47/48 Batch Terverifikasi QR`.
   * Icon Badge: `qr_code_2` dengan `bg-brand-600 text-white`.

---

### 4.5 Data Visualization Engine

#### A. Dual Y-Axis Trend Chart (Volume & Harga)
* **Tipe:** Line Chart Dual Axis dengan fill area untuk Volume.
* **Lebar Grid:** 7-Column (`lg:col-span-7`).
* **Metrik Sumbu Y Left (Volume):** Scale 0T - 15T (`text-brand-600`).
* **Metrik Sumbu Y Right (Harga):** Scale 40k - 55k (`text-cacao-500`).
* **Visual Vector (SVG):**
  * Line Volume: `stroke="#2e6f40" stroke-width="2.5"` dengan gradient polygon `fill="#2e6f40" fill-opacity="0.1"`.
  * Line Harga: `stroke="#775652" stroke-width="2" stroke-dasharray="4 3"`.
  * Gridlines: `stroke="#f1f5f9" stroke-width="1"`.
* **Sumbu X:** Mei, Jun, Jul, Ags, Sep, **Okt (Highlighted Active Month)**.

#### B. Quality Distribution Donut Chart (Distribusi Mutu SNI)
* **Lebar Grid:** 5-Column (`lg:col-span-5`).
* **Visual Vector (SVG Donut):**
  * Base Ring: `stroke="#f1f5f9" stroke-width="12"`.
  * Grade A SNI (68%): `stroke="#2e6f40" stroke-width="12"` (`stroke-dasharray="162.3 76.4"`).
  * Grade B Fermentasi (24%): `stroke="#775652" stroke-width="12"` (`stroke-dasharray="57.3 181.4"`).
  * Non-Standard Asalan (8%): `stroke="#ef4444" stroke-width="12"` (`stroke-dasharray="19.1 219.6"`).
* **Center Highlight:** Displays `68%` (`font-display font-bold text-2xl`) + Label `Grade A SNI`.
* **Legend Table:** List horizontal terstruktur dengan persentase dan total berat (Kg).

---

### 4.6 Setoran Panen Transaction Table

* **Filter Bar:** Header tabel memuat search input nama petani dan filter button.
* **Kolom Tabel:**
  1. `ID Batch`: Monospace font, bold green (`font-mono font-semibold text-brand-700`).
  2. `Nama Petani`: Bold dark slate (`font-semibold text-slate-900`).
  3. `Waktu Setor`: Slate metadata (`text-slate-500`).
  4. `Berat & Mutu`: Berat utama + Grade badge (`Grade A` / `Grade B`).
  5. `Kadar Air`: Nilai persentase kadar air + catatan status (`Optimal` / `Perlu Jemur`).
  6. `Total Nilai`: Format Rupiah (`font-bold text-slate-900`).
  7. `Status QR`: Badge icon (`Terverifikasi` / `Curing`).
  8. `Aksi`: Secondary CTA buttons (`Cetak Label` / `Detail`).

#### Status Badge Variant System
```html
<!-- Badge Status: Terverifikasi -->
<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
  <span class="material-symbols-outlined text-[13px]">check_circle</span> Terverifikasi
</span>

<!-- Badge Status: Process/Curing -->
<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-900">
  <span class="material-symbols-outlined text-[13px]">hourglass_top</span> Curing
</span>

```

---

## 5. Offline-First & Data Flow Architecture

Aplikasi didesain untuk keandalan di area perkebunan dengan konektivitas terbatas.

```
+------------------+         +----------------------+         +--------------------+
|  Mobile Web UI   | ------> | IndexedDB / Local    | ------> | Background Sync    |
| (Offline Input)  |         | Storage (Service W.) |         | Engine (PWA)       |
+------------------+         +----------------------+         +--------------------+
                                                                        |
                                                                  Saat Online
                                                                        v
                                                              +--------------------+
                                                              | Cloud Supabase /   |
                                                              | Firebase Database  |
                                                              +--------------------+

```

1. **Local Data Persistence:** Seluruh entri setoran panen disimpan terlebih dahulu ke dalam local storage / IndexedDB browser.
2. **Offline-Ready Indicator:** Modul sync pada sidebar menampilkan status hijau (`animate-pulse`) jika koneksi tersedia, atau memicu status *Pending Sync* saat *offline*.
3. **Queue Sync Mechanism:** Ketika perangkat terhubung ke internet, queue setoran akan diunggah otomatis dan menghasilkan token QR terverifikasi.

---

## 6. Pemetaan Tech Stack Rekomendasi (Implementation Roadmap)

Untuk membangun rancangan ini menjadi aplikasi web performa tinggi yang scalable, berikut adalah rekomendasi arsitektur tech stack:

* **Framework Web:** Astro (SSG/SSR Hybrid) + React (Interactive Components)
* **Styling Engine:** Tailwind CSS (Konfigurasi custom theme brand & cacao)
* **UI Component Library:** Shadcn UI (Table, Dialog, Dropdown, Tooltip)
* **Animation & Motion:** Framer Motion (Transisi sidebar, drawer, modal, dan list entrance)
* **Icons:** Lucide Icons (sebagai alternatif performan untuk Material Symbols)
* **Backend & Database:** Supabase / Firebase (Authentication, Realtime DB, Row Level Security)
* **Charts Engine:** Recharts atau Chart.js / SVG murni untuk performa render cepat.

---

## 7. Checklist Aksesibilitas & Responsivitas (QA Guidelines)

* [x] **Touch Targets:** Semua tombol aksi (Setor Panen, Filter, Cetak Label) memiliki tinggi minimal 36px - 40px untuk akurasi sentuhan di perangkat tablet/smartphone.
* [x] **Color Contrast:** Teks slate-900, brand-700, dan amber-950 memenuhi standar kontras WCAG AA (rasio > 4.5:1) terhadap latar belakang masing-masing.
* [x] **State Interaktivitas:** Tombol utama menyertakan efek tekan `active:scale-[0.98]` dan hover transition smooth.
* [x] **Typography Hierarchy:** Membedakan dengan jelas antara visual angka KPI (`Plus Jakarta Sans`) dan tabel data fungsional (`Inter`).

### Ringkasan Isi Dokumen `design.md`:

#### 1. **Visi Produk & Target Pengguna:**
* Gambaran umum sistem platform agroteknologi & ketertelusuran kakao tingkat Kelompok Tani (Poktan).
* Profil pengguna (Admin Poktan, Pengurus Poktan, Auditor/Buyer).


#### 2. **Design System & Tokens:**
* **Color Palette:** Spesifikasi lengkap kode Hex untuk **Brand Palette** (Agri Green `#2e6f40`, `#11562a`), **Cacao Palette** (Earth Brown `#775652`), Neutral Slate (`#f8fafc`, `#0f172a`), dan warna status semantik (Emerald, Amber, Red).
* **Tipografi:** Integrasi dual-font *Plus Jakarta Sans* (Display/Headings & KPI) dan *Inter* (Body Text, Table, UI).
* **Spacing & Radius:** Standardisasi *border-radius* (`rounded-xl` 12px, `rounded-lg`, `rounded-full`) dan skema *elevation/shadow*.


#### 3. **Arsitektur Layout & Grid System:**
* Struktur *Shell* (Fixed Collapsible Sidebar 256px + Sticky Top Header 64px + Fluid Main Content Area).
* Strategi respon breakpoint (*Mobile*, *Tablet*, *Desktop*).


#### 4. **Spesifikasi Komponen UI Detail:**
* **Sidebar Navigation:** Brand identity, link menu aktif/inaktif, dan modul *Offline Sync Status Indicator* (`animate-pulse`).
* **Top Header:** Search bar, Season Selector, Notifikasi badge, dan Profile Avatar.
* **AI Early Warning Banner:** Sistem peringatan dini cuaca berbasis AI & integrasi BMKG.
* **KPI Summary Cards Grid:** Spesifikasi 4 kartu metrik utama (Total Produksi, Petani Aktif, Rata-Rata Harga, Skor Ketertelusuran).
* **Data Visualization Engine:** Spesifikasi teknis grafik *SVG Dual Y-Axis Line Chart* (Volume vs Harga) & *SVG Donut Chart* (Distribusi Mutu SNI Grade A, B, Non-Standard).
* **Data Table Transaction:** Struktur tabel setoran panen, filter/search bar, dan skema variasi *status badges* (Terverifikasi, Curing/Perlu Jemur).


#### 5. **Arsitektur Offline-First & Data Flow:**
* Alur *IndexedDB/Local Persistence* -> *Queue Sync* -> *Cloud Synchronization* (PWA-ready).


#### 6. **Roadmap Tech Stack Rekomendasi:**
* Pemetaan arsitektur modern: **Astro + React + Tailwind CSS + Shadcn UI + Framer Motion + Lucide Icons + Supabase/Firebase**.


#### 7. **Aksesibilitas & Quality Assurance:**
* Kontras WCAG AA, *touch target sizes* untuk perangkat seluler/tablet, serta visual mikro-interaksi (`active:scale-[0.98]`).