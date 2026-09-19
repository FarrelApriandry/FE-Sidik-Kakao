import { useState, useMemo, useCallback } from "react";
import MaterialIcon from "../ui/MaterialIcon";
import SearchInput from "../ui/SearchInput";
import {
  ADMIN_FAQ_ITEMS,
  ADMIN_FAQ_CATEGORIES,
  type AdminFaqCategory,
  type AdminFaqItem,
} from "../../data/faqData.admin";

export default function AdminBantuanContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<AdminFaqCategory>("semua");
  const [openFaqId, setOpenFaqId] = useState<string | null>("adm-1");

  /* Filter FAQ Items */
  const filteredFaqs = useMemo(() => {
    return ADMIN_FAQ_ITEMS.filter((item) => {
      const matchesCat = activeCategory === "semua" || item.category === activeCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const handleToggle = useCallback((id: string) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-brand-950 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-semibold">
            <MaterialIcon name="help_center" size={16} /> Pusat Panduan Admin Poktan
          </span>
          <h1 className="font-display font-bold text-2xl lg:text-3xl tracking-tight">
            Ada yang Bisa Kami Bantu, Pak Admin?
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Temukan panduan pengelolaan data petani, verifikasi mutu panen, konfigurasi harga acuan, dan pemecahan kendala penggunaan aplikasi SIDIK-KAKAO.
          </p>
        </div>
        <div className="absolute right-6 -bottom-10 opacity-10 pointer-events-none hidden lg:block">
          <MaterialIcon name="support" size={280} className="text-white" />
        </div>
      </div>

      {/* Main Grid Layout (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: FAQ & Search (2 Spans) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Controls Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-4">
            <SearchInput
              placeholder="Cari petunjuk (misal: 'tambah petani', 'sinkronisasi', 'harga')..."
              value={searchQuery}
              onChange={setSearchQuery}
            />

            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {ADMIN_FAQ_CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => {
                    setActiveCategory(cat.key);
                    setOpenFaqId(null);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all active:scale-[0.98] ${
                    activeCategory === cat.key
                      ? "bg-brand-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ Accordion List */}
          {filteredFaqs.length > 0 ? (
            <div className="space-y-3">
              {filteredFaqs.map((item) => (
                <FaqAccordionCard
                  key={item.id}
                  item={item}
                  isOpen={openFaqId === item.id}
                  onToggle={() => handleToggle(item.id)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <MaterialIcon name="search_off" size={26} />
              </div>
              <h3 className="font-display font-bold text-base text-slate-800">
                Petunjuk Tidak Ditemukan
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Tidak ada panduan yang cocok dengan kata kunci "{searchQuery}". Coba gunakan kata kunci umum lainnya.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Support & Quick Guides (1 Span) */}
        <div className="space-y-5">
          {/* Technical Helpdesk Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                <MaterialIcon name="headset_mic" size={22} />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-slate-900">
                  Layanan Bantuan Pengurus
                </h3>
                <p className="text-[11px] text-slate-500">
                  Kendala pendaftaran akun, lupa password, atau sistem error
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3.5 space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Pusat Layanan:</span>
                <span className="font-semibold text-slate-800">Tim Dukungan SIDIK-KAKAO</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Status Layanan:</span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Sistem Berjalan Normal
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Waktu Respon:</span>
                <span className="font-semibold text-slate-800">&lt; 15 Menit</span>
              </div>
            </div>

            <a
              href="https://wa.me/6281234567890?text=Halo%20Tim%20Dukungan%20SIDIK-KAKAO%2C%20saya%20Admin%20Poktan%20butuh%20bantuan%20aplikasi"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-11 bg-brand-600 hover:bg-brand-700 text-white font-display font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <MaterialIcon name="chat" size={18} />
              Hubungi Layanan Bantuan (WhatsApp)
            </a>
          </div>

          {/* Quick SOP Tips Card */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-2xl border border-amber-200/60 p-5 space-y-3">
            <div className="flex items-center gap-2 text-amber-900">
              <MaterialIcon name="lightbulb" size={20} className="text-amber-600" />
              <h4 className="font-display font-bold text-sm">SOP Penting Pengurus</h4>
            </div>
            <ul className="text-xs text-amber-900/80 space-y-2 list-disc list-inside leading-relaxed">
              <li>Selalu periksa kadar air biji kakao sebelum mengubah status setoran menjadi <b>Terverifikasi</b>.</li>
              <li>Pantau halaman <b>AI Insight</b> secara berkala untuk peringatan kualitas biji kakao.</li>
              <li>Jaga kerahasiaan kata sandi akun Admin Poktan Anda agar data transaksi kelompok tetap aman.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Accordion Item Sub-Component */
function FaqAccordionCard({
  item,
  isOpen,
  onToggle,
}: {
  item: AdminFaqItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3.5 px-5 py-4 text-left hover:bg-slate-50/60 transition-colors"
      >
        <div className={`h-9 w-9 shrink-0 rounded-xl ${item.iconBg} flex items-center justify-center`}>
          <MaterialIcon name={item.icon} size={20} />
        </div>
        <span className="flex-1 font-display font-bold text-sm text-slate-800 leading-snug">
          {item.question}
        </span>
        <MaterialIcon
          name="expand_more"
          size={22}
          className={`shrink-0 text-slate-400 transition-transform duration-300 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      {isOpen && (
        <div className="px-5 pb-5 pt-0">
          <div className="border-t border-slate-100 pt-3.5 ml-12">
            <p className="text-xs lg:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {item.answer}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}