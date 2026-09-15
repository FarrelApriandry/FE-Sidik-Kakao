/* ── FAQ Types ── */

/** FAQ category filter key */
export type FaqCategory = "semua" | "catat" | "sinyal" | "mutu";

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
  { key: "semua", label: "Semua Pertanyaan" },
  { key: "catat", label: "Cara Catat" },
  { key: "sinyal", label: "Mati Sinyal & Stiker" },
  { key: "mutu", label: "Kualitas Biji" },
];

/* ── FAQ Items ── */

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "faq-1",
    question: "Bagaimana kalau di kebun tidak ada sinyal HP?",
    answer:
      "Jangan khawatir, Pak/Bu! Bapak/Ibu tetap bisa catat panen seperti biasa.\n\nSemua data panen akan tersimpan aman di dalam HP. Nanti setelah Bapak/Ibu dapat sinyal kembali (misal saat pulang ke rumah atau sampai pos Poktan), data tersebut akan otomatis terkirim ke pengurus Poktan.",
    category: "sinyal",
    icon: "wifi_off",
    iconBg: "bg-slate-100 text-slate-600",
  },
  {
    id: "faq-2",
    question: "Apa bedanya Biji Kakao Grade A dan Grade B?",
    answer:
      "Grade A adalah biji kakao kering sempurna, bebas jamur, dan ukurannya seragam (harga jual paling tinggi di Poktan).\n\nGrade B adalah biji kakao yang masih agak basah atau sedang dijemur/diperam. Hasil panen ini tetap laku dibeli Poktan, dan nilainya bisa naik ke Grade A kalau dijemur dengan benar.",
    category: "mutu",
    icon: "workspace_premium",
    iconBg: "bg-amber-50 text-cacao-500",
  },
  {
    id: "faq-3",
    question: "Bagaimana cara pakai Stiker Kode di karung kakao?",
    answer:
      "Setelah selesai catat panen di HP, stiker kode (QR Code) akan otomatis dibuat.\n\nTunjukkan stiker kode di layar HP ini ke pengurus Poktan saat menyetor karung kakao di pos. Pengurus akan scan kode tersebut agar timbangan dan harga panen langsung tercatat resmi atas nama Bapak/Ibu.",
    category: "sinyal",
    icon: "qr_code_2",
    iconBg: "bg-brand-50 text-brand-600",
  },
  {
    id: "faq-4",
    question: 'Apa arti status "Masih Penjemuran"?',
    answer:
      'Artinya setoran kakao Bapak/Ibu sudah berhasil dicatat di pos Poktan, namun biji kakao masih dalam proses pengeringan atau penimbangan akhir di gudang.\n\nBegitu proses penjemuran selesai dan kualitasnya cocok, statusnya akan otomatis berubah menjadi "Sudah Diterima Poktan" di menu Riwayat.',
    category: "catat",
    icon: "schedule",
    iconBg: "bg-sky-50 text-sky-600",
  },
  {
    id: "faq-5",
    question: "Bagaimana kalau saya salah ketik berat (Kg) panen?",
    answer:
      "Tenang saja, Pak/Bu! Saat serah terima karung kakao di pos, pengurus Poktan akan menimbang ulang setoran Bapak/Ibu.\n\nJika ada angka yang keliru saat Bapak/Ibu ketik di kebun, pengurus Poktan akan langsung memperbaiki catatannya di sistem.",
    category: "catat",
    icon: "edit_note",
    iconBg: "bg-rose-50 text-rose-600",
  },
];