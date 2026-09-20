import { useState, useEffect } from "react";
import MaterialIcon from "../ui/MaterialIcon";
import Button from "../ui/Button";
import { getSupabase } from "../../lib/supabase";
import { fetchGradePrices } from "../../utils/storage";
import type { GradePriceEntry, CacaoGrade, BeanCategory } from "../../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function HargaModal({ isOpen, onClose, onSuccess }: Props) {
  const [prices, setPrices] = useState<GradePriceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setError(null);
    fetchGradePrices().then((p) => {
      setPrices(p);
      setLoading(false);
    });
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePriceChange = (
    grade: CacaoGrade,
    category: BeanCategory,
    newPriceStr: string
  ) => {
    const val = parseFloat(newPriceStr) || 0;
    setPrices((prev) =>
      prev.map((item) =>
        item.grade === grade && item.category === category
          ? { ...item, pricePerKg: val }
          : item
      )
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setError("Sesi tidak ditemukan. Silakan login ulang.");
        setIsSubmitting(false);
        return;
      }

      const res = await fetch("/api/harga", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ prices }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal memperbarui harga acuan.");
        setIsSubmitting(false);
        return;
      }

      // Update local cache
      localStorage.setItem("sidik_kakao_grade_prices", JSON.stringify(prices));
      onSuccess();
    } catch {
      setError("Terjadi kesalahan koneksi saat menyimpan harga.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        style={{ animation: "modalSlideUp 0.3s ease-out" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-50 rounded-xl">
              <MaterialIcon name="payments" size={22} className="text-brand-600" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-slate-900">
                Atur Harga Acuan Kakao
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Atur harga beli per Kg berdasarkan Grade & Kategori
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <MaterialIcon name="close" size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-8 text-center text-xs font-semibold text-slate-500">
              Memuat matriks harga...
            </div>
          ) : (
            <div className="space-y-4">
              {(["A", "B"] as CacaoGrade[]).map((g) => (
                <div key={g} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                  <h3 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-brand-600 text-white text-xs">
                      Grade {g}
                    </span>
                    {g === "A" ? "Standar SNI / Mutu Utama" : "Standar Reguler"}
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {(["basah", "fermentasi", "kering"] as BeanCategory[]).map((cat) => {
                      const entry = prices.find((p) => p.grade === g && p.category === cat);
                      return (
                        <div key={cat}>
                          <label className="block text-[11px] font-semibold text-slate-600 capitalize mb-1">
                            {cat}
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              step="500"
                              min="0"
                              value={entry?.pricePerKg ?? 0}
                              onChange={(e) => handlePriceChange(g, cat, e.target.value)}
                              className="w-full h-9 pl-2 pr-2 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600/30"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action */}
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" size="md" className="flex-1" onClick={onClose}>
              Batal
            </Button>
            <Button
              variant="primary"
              size="md"
              className="flex-1"
              disabled={isSubmitting || loading}
              onClick={handleSubmit}
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Harga Acuan"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
