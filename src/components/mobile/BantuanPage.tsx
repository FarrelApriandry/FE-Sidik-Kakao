import { useState, useMemo, useCallback } from "react";
import MaterialIcon from "../ui/MaterialIcon";
import SearchInput from "../ui/SearchInput";
import {
  FAQ_ITEMS,
  FAQ_CATEGORIES,
  type FaqCategory,
  type FaqItem,
} from "../../data/faqData";

/* ══════════════════════════════════════════════
   Main Component
   ══════════════════════════════════════════════ */
export default function BantuanPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<FaqCategory>("semua");
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  /* Filtered FAQ items */
  const filteredFaqs = useMemo(() => {
    return FAQ_ITEMS.filter((item) => {
      const matchesCategory =
        activeCategory === "semua" || item.category === activeCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  /* Toggle accordion (single-open) */
  const handleToggle = useCallback((id: string) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  }, []);

  return (
    <div className="w-full max-w-[430px] mx-auto min-h-screen bg-slate-50 flex flex-col relative">
      {/* Accordion transition styles */}
      <style>{`
        .faq-accordion-grid {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 300ms ease, opacity 300ms ease;
          opacity: 0;
        }
        .faq-accordion-grid[data-open="true"] {
          grid-template-rows: 1fr;
          opacity: 1;
        }
        .faq-accordion-grid > div {
          overflow: hidden;
        }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 flex items-center gap-3">
        <a
          href="/petani/akun"
          className="h-9 w-9 -ml-1 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <MaterialIcon name="arrow_back" size={22} />
        </a>
        <div className="flex-1">
          <h1 className="font-display font-bold text-base text-slate-900 tracking-tight">
            Bantuan &amp; FAQ
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Panduan penggunaan aplikasi SIDIK-KAKAO
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-6 space-y-4">
        {/* Search */}
        <SearchInput
          placeholder="Cari pertanyaan..."
          value={searchQuery}
          onChange={setSearchQuery}
        />

        {/* Category Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
          {FAQ_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => {
                setActiveCategory(cat.key);
                setOpenFaqId(null);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-[0.97] ${
                activeCategory === cat.key
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        {filteredFaqs.length > 0 ? (
          <div className="space-y-2.5">
            {filteredFaqs.map((item) => (
              <FaqAccordionItem
                key={item.id}
                item={item}
                isOpen={openFaqId === item.id}
                onToggle={() => handleToggle(item.id)}
              />
            ))}
          </div>
        ) : (
          <EmptySearchState />
        )}

        {/* Support CTA Card */}
        <SupportCtaCard />
      </main>
    </div>
  );
}

/* ── FAQ Accordion Item ── */
interface FaqAccordionItemProps {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
}

function FaqAccordionItem({ item, isOpen, onToggle }: FaqAccordionItemProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Header (clickable) */}
      <button
        onClick={onToggle}
        className="w-full flex items-start gap-3 px-4 py-3.5 text-left hover:bg-slate-50/50 transition-colors active:bg-slate-50"
      >
        <div
          className={`h-9 w-9 shrink-0 rounded-xl ${item.iconBg} flex items-center justify-center`}
        >
          <MaterialIcon name={item.icon} size={20} />
        </div>
        <span className="flex-1 text-sm font-semibold text-slate-800 leading-snug pt-1.5 line-clamp-2">
          {item.question}
        </span>
        <MaterialIcon
          name="expand_more"
          size={22}
          className={`shrink-0 text-slate-400 transition-transform duration-300 mt-1.5 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      {/* Body (collapsible via CSS grid transition) */}
      <div
        className="faq-accordion-grid"
        data-open={isOpen ? "true" : "false"}
      >
        <div>
          <div className="px-4 pb-4 pt-0">
            <div className="border-t border-slate-100 pt-3 ml-12">
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {item.answer}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Empty Search State ── */
function EmptySearchState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <MaterialIcon name="search_off" size={28} className="text-slate-300" />
      </div>
      <h3 className="font-display font-bold text-sm text-slate-700 mb-1">
        Tidak Ditemukan
      </h3>
      <p className="text-xs text-slate-400 max-w-[220px]">
        Coba kata kunci lain atau ubah filter kategori untuk menemukan jawaban
        yang Anda cari.
      </p>
    </div>
  );
}

/* ── Support CTA Card ── */
function SupportCtaCard() {
  const handleWhatsApp = useCallback(() => {
    if (navigator.vibrate) navigator.vibrate(50);
    /* Demo: In production, replace with real WhatsApp deep link */
    window.open(
      "https://wa.me/6281234567890?text=Halo%20Admin%2C%20saya%20butuh%20bantuan%20aplikasi%20SIDIK-KAKAO",
      "_blank"
    );
  }, []);

  return (
    <div className="bg-gradient-to-br from-brand-50 to-emerald-50 rounded-2xl border border-brand-100 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-sm">
          <MaterialIcon name="support_agent" size={22} className="text-white" />
        </div>
        <div>
          <h3 className="font-display font-bold text-sm text-slate-900">
            Butuh Bantuan Lebih?
          </h3>
          <p className="text-[11px] text-slate-600 mt-0.5">
            Hubungi Admin Poktan untuk bantuan langsung
          </p>
        </div>
      </div>

      {/* Info Rows */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2.5">
          <MaterialIcon
            name="schedule"
            size={18}
            className="text-brand-600 shrink-0"
          />
          <div className="flex-1">
            <span className="text-[11px] text-slate-500 block">
              Jam Operasional
            </span>
            <span className="text-xs font-semibold text-slate-800">
              Senin–Sabtu, 08:00–16:00 WITA
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <MaterialIcon
            name="person"
            size={18}
            className="text-brand-600 shrink-0"
          />
          <div className="flex-1">
            <span className="text-[11px] text-slate-500 block">
              Admin Poktan
            </span>
            <span className="text-xs font-semibold text-slate-800">
              Pak Ahmad (Poktan Harapan Jaya)
            </span>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={handleWhatsApp}
        className="w-full h-12 bg-brand-600 hover:bg-brand-700 text-white font-display font-bold text-sm rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
      >
        <MaterialIcon name="chat" size={20} className="text-white" />
        Hubungi Admin via WhatsApp
      </button>
    </div>
  );
}
