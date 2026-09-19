export type AdminFaqCategory = "semua" | "petani" | "panen" | "harga" | "sistem";

export interface AdminFaqItem {
  id: string;
  category: AdminFaqCategory;
  question: string;
  answer: string;
  icon: string;
  iconBg: string;
}

export const ADMIN_FAQ_CATEGORIES: { key: AdminFaqCategory; label: string }[] = [
  { key: "semua", label: "Semua Topik" },
  { key: "petani", label: "Manajemen Petani" },
  { key: "panen", label: "Setoran & Verifikasi" },
  { key: "harga", label: "Acuan Harga Grade" },
  { key: "sistem", label: "Hak Akses & Sinkronisasi" },
];

export const ADMIN_FAQ_ITEMS: AdminFaqItem[] = [
  {
    id: "adm-1",
    category: "petani",
    question: "Bagaimana cara menambah anggota petani baru ke dalam Poktan?",
    answer: "Buka menu 'Data Petani' dari sidebar, lalu klik tombol '+ Tambah Petani' di pojok kanan atas.\n\nIsi Nama Lengkap, Email, Password login mobile, No. HP/WA, dan Luas Lahan (Ha). Sistem akan otomatis mendaftarkan akun login petani dan mengaitkannya ke kelompok tani Anda secara langsung.",
    icon: "person_add",
    iconBg: "bg-emerald-50 text-emerald-600",
  },
  {
    id: "adm-2",
    category: "petani",
    question: "Mengapa petani tidak bisa login ke aplikasi mobile?",
    answer: "Pastikan alamat email dan password yang dimasukkan petani sudah sesuai dengan yang dibuatkan oleh Admin.\n\nSelain itu, pastikan petani memilih tab 'Petani Lapangan' di halaman awal aplikasi. Jika memilih tab 'Admin Poktan', aplikasi akan menolak akses secara otomatis demi keamanan akun kelompok.",
    icon: "no_accounts",
    iconBg: "bg-amber-50 text-amber-600",
  },
  {
    id: "adm-3",
    category: "panen",
    question: "Bagaimana cara melakukan verifikasi setoran panen dari petani?",
    answer: "Masuk ke menu 'Rekap Panen' atau klik tombol '+ Setoran Panen' di Dashboard.\n\nPilih nama petani, masukkan berat panen, kadar air (%), serta kategori biji (Basah/Fermentasi/Kering). Aplikasi akan otomatis menghitung total nilai setoran berdasarkan harga pasar dan mengubah statusnya menjadi 'Terverifikasi'.",
    icon: "verified_user",
    iconBg: "bg-blue-50 text-blue-600",
  },
  {
    id: "adm-4",
    category: "panen",
    question: "Bagaimana cara mencetak ulang Label QR Batch yang hilang?",
    answer: "Buka menu 'Rekap Panen' atau 'Ketertelusuran', cari nomor ID Batch yang dimaksud (misal: BTH-KK-404), lalu klik tombol 'Detail' atau 'Cetak Label'.\n\nLabel dapat dicetak secara langsung melalui printer terhubung atau disimpan dalam bentuk berkas digital.",
    icon: "qr_code_scanner",
    iconBg: "bg-purple-50 text-purple-600",
  },
  {
    id: "adm-5",
    category: "harga",
    question: "Bagaimana cara mengubah acuan harga pasar per kilogram?",
    answer: "Pengaturan harga diatur berdasarkan Grade (A/B) dan Kategori Biji (Basah/Fermentasi/Kering).\n\nPerubahan harga yang disimpan oleh pengurus akan secara otomatis memperbarui estimasi nilai panen di aplikasi HP petani maupun laporan di dashboard admin.",
    icon: "payments",
    iconBg: "bg-brand-50 text-brand-600",
  },
  {
    id: "adm-6",
    category: "sistem",
    question: "Bagaimana jika ada catatan panen petani yang dibuat saat tidak ada sinyal?",
    answer: "Aplikasi mobile petani sudah mendukung fitur pencatatan offline.\n\nSaat HP tidak ada sinyal, data panen disimpan aman di dalam memori aplikasi. Begitu HP mendapatkan koneksi internet kembali, catatan panen tersebut akan otomatis terkirim ke sistem pusat tanpa perlu diinput ulang.",
    icon: "sync",
    iconBg: "bg-sky-50 text-sky-600",
  },
];