import PageHeader from "./PageHeader";
import MaterialIcon from "../ui/MaterialIcon";

const FORECAST_DATA = [
  { month: "Nov 2026", predicted: "10.2 Ton", confidence: "88%", direction: "down" as const },
  { month: "Des 2026", predicted: "7.8 Ton", confidence: "82%", direction: "down" as const },
  { month: "Jan 2027", predicted: "5.5 Ton", confidence: "74%", direction: "down" as const },
];

export default function AiInsightContent() {
  return (
    <main className="p-4 lg:p-8 space-y-6 w-full mx-auto">
      <PageHeader
        title="AI Insight"
        subtitle="Prediksi dan rekomendasi berbasis data untuk optimasi panen."
      />

      {/* Weather Early Warning */}
      <div className="bg-white border border-amber-200 p-5 rounded-xl shadow-xs">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 shrink-0">
            <MaterialIcon name="thunderstorm" size={22} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-display font-bold text-base text-slate-900">
                Peringatan Dini BMKG
              </h3>
              <span className="inline-flex text-[11px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                Aktif
              </span>
            </div>
            <p className="text-sm text-slate-600 mb-1">
              <span className="font-semibold">BMKG Luwu:</span> Curah hujan tinggi 5 hari ke depan.
              Potensi kenaikan kadar air biji <span className="font-bold text-amber-700">+2.5%</span>.
            </p>
            <p className="text-xs text-slate-400">
              Diperbarui: 24 Oktober 2026, 06:00 WITA
            </p>
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
            <h3 className="font-display font-bold text-base text-slate-900">
              Prediktor Risiko Kadar Air
            </h3>
            <p className="text-xs text-slate-500">
              Estimasi kadar air biji berdasarkan cuaca dan data historis
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <MaterialIcon name="warning" size={18} className="text-amber-600" />
              <span className="text-xs font-bold text-amber-700 uppercase">Risiko Tinggi</span>
            </div>
            <p className="font-display font-bold text-2xl text-amber-800">8.8%</p>
            <p className="text-xs text-amber-600 mt-1">Prediksi kadar air 5 hari ke depan</p>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <div className="flex items-center gap-2 mb-2">
              <MaterialIcon name="check_circle" size={18} className="text-emerald-600" />
              <span className="text-xs font-bold text-emerald-700 uppercase">Batas Aman</span>
            </div>
            <p className="font-display font-bold text-2xl text-emerald-800">≤ 7.5%</p>
            <p className="text-xs text-emerald-600 mt-1">Kadar air optimal untuk fermentasi</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <MaterialIcon name="lightbulb" size={18} className="text-brand-600" />
              <span className="text-xs font-bold text-brand-700 uppercase">Rekomendasi</span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              Perpanjang waktu jemur <strong>+2 hari</strong> untuk batch yang dipanen minggu ini.
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
            <h3 className="font-display font-bold text-base text-slate-900">
              Prediksi Volume Panen
            </h3>
            <p className="text-xs text-slate-500">
              Proyeksi produksi 3 bulan ke depan berdasarkan tren musiman
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {FORECAST_DATA.map((item) => (
            <div
              key={item.month}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
            >
              <div className="flex items-center gap-3">
                <span className="p-1.5 rounded-lg bg-red-100 text-red-600">
                  <MaterialIcon name="arrow_downward" size={16} />
                </span>
                <div>
                  <span className="text-sm font-semibold text-slate-900">{item.month}</span>
                  <p className="text-[11px] text-slate-500">Keyakinan: {item.confidence}</p>
                </div>
              </div>
              <span className="font-display font-bold text-lg text-slate-900">
                {item.predicted}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
