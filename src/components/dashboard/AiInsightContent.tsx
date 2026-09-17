import { useState, useEffect } from "react";
import PageHeader from "./PageHeader";
import MaterialIcon from "../ui/MaterialIcon";
import { getCurrentUser } from "../../lib/supabase";
import { fetchMoistureStats, fetchForecast } from "../../lib/dashboard-queries";
import type { MoistureStats, ForecastPoint } from "../../types";

export default function AiInsightContent() {
  const [moisture, setMoisture] = useState<MoistureStats | null>(null);
  const [forecast, setForecast] = useState<ForecastPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const user = await getCurrentUser();
      if (!user?.poktanId) { setLoading(false); return; }
      try {
        const [m, f] = await Promise.all([
          fetchMoistureStats(user.poktanId),
          fetchForecast(user.poktanId),
        ]);
        setMoisture(m);
        setForecast(f);
      } catch (e) {
        console.error("Failed to load AI insight data:", e);
      }
      setLoading(false);
    }
    load();
  }, []);
  if (loading) {
    return (
      <main className="p-4 lg:p-8 space-y-6 w-full mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-20 bg-slate-200 rounded-2xl" />
          <div className="h-48 bg-slate-200 rounded-2xl" />
          <div className="h-64 bg-slate-200 rounded-2xl" />
        </div>
      </main>
    );
  }

  const avgMoisture = moisture?.avgMoisture ?? 0;
  const riskPct = moisture?.riskPct ?? 0;
  const highCount = moisture?.highMoistureCount ?? 0;
  const totalSamples = moisture?.totalSamples ?? 0;
  const isHighRisk = highCount > 5;
  const predictedMoisture = Math.min(avgMoisture + (isHighRisk ? 2.5 : 0.5), 12).toFixed(1);

  return (
    <main className="p-4 lg:p-8 space-y-6 w-full mx-auto">
      <PageHeader
        title="AI Insight"
        subtitle="Prediksi dan rekomendasi berbasis data untuk optimasi panen."
      />

      {/* Weather Early Warning */}
      <div className={"bg-white border p-5 rounded-xl shadow-xs " + (isHighRisk ? "border-amber-200" : "border-emerald-200")}>
        <div className="flex items-start gap-4">
          <div className={"p-2.5 rounded-xl shrink-0 " + (isHighRisk ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600")}>
            <MaterialIcon name={isHighRisk ? "thunderstorm" : "check_circle"} size={22} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-display font-bold text-base text-slate-900">
                {isHighRisk ? "Peringatan Kelembaban Tinggi" : "Kondisi Kelembaban Normal"}
              </h3>
              <span className={"inline-flex text-[11px] font-bold px-2 py-0.5 rounded-full " + (isHighRisk ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700")}>
                {isHighRisk ? "Peringatan" : "Aman"}
              </span>
            </div>
            <p className="text-sm text-slate-600 mb-1">
              {isHighRisk
                ? <><span className="font-semibold">Analisis Data:</span> {highCount} dari {totalSamples} sampel memiliki kadar air di atas 8.5%. Risiko jamur <span className="font-bold text-amber-700">{riskPct}%</span>.</>
                : <><span className="font-semibold">Analisis Data:</span> Rata-rata kadar air {avgMoisture}% dari {totalSamples} sampel. Kondisi <span className="font-bold text-emerald-700">optimal</span>.</>
              }
            </p>
            <p className="text-xs text-slate-400">Data diperbarui berdasarkan batch terakhir</p>
          </div>
        </div>
      </div>

      {/* Moisture Risk Predictor */}
      <div className="bg-white border border-slate-200/80 p-5 rounded-xl shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <span className="p-2 rounded-lg bg-brand-50 text-brand-600">
            <MaterialIcon name="water_drop" size={18} />
          </span>
          <div>
            <h3 className="font-display font-bold text-base text-slate-900">Prediktor Risiko Kadar Air</h3>
            <p className="text-xs text-slate-500">Estimasi kadar air biji berdasarkan data batch historis</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className={"p-4 rounded-xl border " + (isHighRisk ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200")}>
            <div className="flex items-center gap-2 mb-2">
              <MaterialIcon name={isHighRisk ? "warning" : "check_circle"} size={18} className={isHighRisk ? "text-amber-600" : "text-emerald-600"} />
              <span className={"text-xs font-bold uppercase " + (isHighRisk ? "text-amber-700" : "text-emerald-700")}>
                {isHighRisk ? "Risiko Tinggi" : "Risiko Rendah"}
              </span>
            </div>
            <p className={"font-display font-bold text-2xl " + (isHighRisk ? "text-amber-800" : "text-emerald-800")}>{predictedMoisture}%</p>
            <p className={"text-xs mt-1 " + (isHighRisk ? "text-amber-600" : "text-emerald-600")}>Prediksi kadar air tertinggi</p>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <div className="flex items-center gap-2 mb-2">
              <MaterialIcon name="check_circle" size={18} className="text-emerald-600" />
              <span className="text-xs font-bold text-emerald-700 uppercase">Batas Aman</span>
            </div>
            <p className="font-display font-bold text-2xl text-emerald-800">{"\u2264"} 7.5%</p>
            <p className="text-xs text-emerald-600 mt-1">Kadar air optimal untuk fermentasi</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <MaterialIcon name="lightbulb" size={18} className="text-brand-600" />
              <span className="text-xs font-bold text-brand-700 uppercase">Rekomendasi</span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              {isHighRisk
                ? <><strong>Perpanjang waktu jemur +2 hari</strong> untuk batch dengan kadar air {" >"} 8.5%.</>
                : <>Kondisi saat ini <strong>optimal</strong>. Pertahankan proses pengeringan standar.</>
              }
            </p>
          </div>
        </div>
      </div>

      {/* Harvest Volume Forecast */}
      <div className="bg-white border border-slate-200/80 p-5 rounded-xl shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <span className="p-2 rounded-lg bg-slate-100 text-slate-700">
            <MaterialIcon name="trending_down" size={18} />
          </span>
          <div>
            <h3 className="font-display font-bold text-base text-slate-900">Prediksi Volume Panen</h3>
            <p className="text-xs text-slate-500">Proyeksi produksi 3 bulan ke depan berdasarkan tren musiman</p>
          </div>
        </div>
        <div className="space-y-3">
          {forecast.map((item) => (
            <div key={item.month} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <span className={"p-1.5 rounded-lg " + (item.direction === "down" ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600")}>
                  <MaterialIcon name={item.direction === "down" ? "arrow_downward" : "arrow_upward"} size={16} />
                </span>
                <div>
                  <span className="text-sm font-semibold text-slate-900">{item.month}</span>
                  <p className="text-[11px] text-slate-500">Keyakinan: {item.confidence}</p>
                </div>
              </div>
              <span className="font-display font-bold text-lg text-slate-900">{item.predicted}</span>
            </div>
          ))}
          {forecast.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">Belum cukup data untuk prediksi</p>
          )}
        </div>
      </div>
    </main>
  );
}
