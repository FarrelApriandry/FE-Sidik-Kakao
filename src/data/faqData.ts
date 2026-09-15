/* ── FAQ Types ── */

/** FAQ category filter key */
export type FaqCategory = "semua" | "input-panen" | "offline-qr" | "mutu-kakao";

/** Single FAQ item */
export interface FaqItem {
  /** Unique identifier for React keys and accordion toggle */
  id: string;
  /** The farmer's question */
  question: string;
  /** Detailed answer text (supports multi-paragraph via \n\n) */
  answer: string;
  /** Category this FAQ belongs to */
  category: FaqCategory;
  /** Material Symbols icon name */
  icon: string;
  /** Tailwind color classes for icon background */
  iconBg: string;
}

/** Category chip metadata for the filter bar */
export interface CategoryChip {
  key: FaqCategory;
  label: string;
}

/* ── FAQ Categories ── */

export const FAQ_CATEGORIES: CategoryChip[] = [
  { key: "semua", label: "Semua" },
  { key: "input-panen", label: "Input Panen" },
  { key: "offline-qr", label: "Offline & QR" },
  { key: "mutu-kakao", label: "Mutu Kakao" },
];

/* ── FAQ Items ── */

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "faq-1",
    question:
      "Bagaimana cara mencatat panen jika kebun tidak ada sinyal (offline)?",
    answer:
      'Aplikasi SIDIK-KAKAO dirancang untuk bekerja tanpa koneksi internet. Saat Anda mengisi formulir catat panen di menu "Catat", semua data (berat, kategori biji, foto) akan tersimpan langsung di memori lokal HP Anda.\n\nSetelah Anda kembali ke area yang memiliki sinyal, buka menu "Akun" lalu tekan tombol "Sinkronisasi Data Manual" untuk mengirim semua data tersimpan ke server cloud Poktan. Pastikan ikon status di bagian atas layar menunjukkan "Online" sebelum melakukan sinkronisasi.',
    category: "offline-qr",
    icon: "wifi_off",
    iconBg: "bg-slate-100 text-slate-600",
  },
  {
    id: "faq-2",
    question: "Apa bedanya Grade A (SNI) dan Grade B pada biji kakao?",
    answer:
      "Grade A (SNI) adalah biji kakao yang sudah difermentasi dengan sempurna minimal 5–6 hari, memiliki warna cokelat tua merata, dan kadar air optimal di bawah 8%. Biji Grade A diharga lebih tinggi karena menghasilkan cita rasa cokelat yang kaya dan kompleks.\n\nGrade B adalah biji yang fermentasinya belum merata atau kadar airnya masih agak tinggi (di atas 8%). Masih layak jual dengan harga lebih rendah, dan bisa ditingkatkan ke Grade A dengan proses penjemuran dan fermentasi ulang yang benar.",
    category: "mutu-kakao",
    icon: "workspace_premium",
    iconBg: "bg-amber-50 text-cacao-500",
  },
  {
    id: "faq-3",
    question:
      "Bagaimana cara mencetak atau membagikan Label QR Code setoran?",
    answer:
      'Setelah Anda berhasil mencatat panen, sistem akan otomatis membuat Label QR Code unik untuk setiap batch. Label ini berisi ID Batch, berat, grade, dan data ketertelusuran lainnya.\n\nUntuk mencetak atau membagikan: buka menu "Riwayat", pilih batch panen yang ingin Anda cetak, lalu tekan tombol "Cetak Label QR" di bagian bawah detail. Anda bisa menyimpan sebagai gambar atau langsung mencetaknya. Label ini wajib ditempelkan pada karung setoran untuk proses verifikasi di gudang.',
    category: "offline-qr",
    icon: "qr_code_2",
    iconBg: "bg-brand-50 text-brand-600",
  },
  {
    id: "faq-4",
    question:
      'Berapa lama status setoran "Proses Curing" berubah jadi Terverifikasi?',
    answer:
      'Proses curing standar berlangsung 5–7 hari kerja tergantung kondisi cuaca dan kelembaban. Selama periode ini, Admin Poktan akan memeriksa kadar air dan kualitas fermentasi biji kakao Anda di gudang.\n\nSetelah pemeriksaan selesai dan biji memenuhi standar, status akan berubah otomatis menjadi "Terverifikasi" di sistem. Anda bisa melihat perubahan status ini secara real-time di menu "Riwayat". Jika lebih dari 7 hari belum berubah, silakan hubungi Admin Poktan.',
    category: "input-panen",
    icon: "schedule",
    iconBg: "bg-sky-50 text-sky-600",
  },
  {
    id: "faq-5",
    question:
      "Apa yang harus dilakukan jika salah menginput berat atau kategori panen?",
    answer:
      'Jika data panen belum terkirim ke server (masih dalam status offline/menunggu sinkronisasi), Anda bisa menghapus catatan tersebut dari menu "Riwayat" dengan menekan ikon hapus, kemudian menginput ulang data yang benar melalui menu "Catat".\n\nJika data sudah terkirim dan tersinkronisasi ke server, Anda tidak bisa mengubahnya sendiri. Silakan hubungi Admin Poktan melalui WhatsApp (lihat bagian "Butuh Bantuan?" di bawah) dengan menyertakan ID Batch dan data koreksi yang diinginkan. Admin akan memperbaiki data di sistem dalam 1×24 jam.',
    category: "input-panen",
    icon: "edit_note",
    iconBg: "bg-rose-50 text-rose-600",
  },
];
