import { useState, useEffect } from "react";
import MaterialIcon from "../ui/MaterialIcon";
import { fetchHarvests, type HarvestRecord } from "../../utils/storage";
import BottomNav from "./BottomNav";

/* ── Mock Data ── */
const FARMER = {
  name: "Pak Budi Santoso",
  shortName: "Pak Budi",
  location: "Sukamaju, Luwu",
  avatar: "BS",
};

const KPI = [
  { label: "Total Panen", value: "450", unit: "Kg", icon: "scale", iconBg: "bg-brand-50 text-brand-600" },
  { label: "Estimasi Pendapatan", value: "Rp 22,5", unit: "jt", icon: "payments", iconBg: "bg-amber-50 text-cacao-500" },
];

const AI_INSIGHT = {
  prediction: "~520 Kg",
  change: "+15%",
  period: "Prediksi bulan depan",
  source: "AI SIDIK",
};

const WEATHER = {
  temp: "29°C",
  condition: "Cerah Berawan",
  icon: "partly_cloudy_day",
};

type LogStatus = "terverifikasi" | "curing";

interface HarvestLog {
  id: string;
  date: string;
  weight: string;
  grade: string;
  status: LogStatus;
}

const RECENT_LOGS: HarvestLog[] = [
  { id: "BTH-KK-091", date: "12 Okt 2026", weight: "85 Kg", grade: "Grade A", status: "terverifikasi" },
  { id: "BTH-KK-090", date: "10 Okt 2026", weight: "72 Kg", grade: "Grade A", status: "terverifikasi" },
  { id: "BTH-KK-089", date: "08 Okt 2026", weight: "95 Kg", grade: "Grade B", status: "curing" },
];

const STATUS_CFG: Record<LogStatus, { bg: string; text: string; icon: string; label: string }> = {
  terverifikasi: { bg: "bg-emerald-100", text: "text-emerald-800", icon: "check_circle", label: "Terverifikasi" },
  curing: { bg: "bg-amber-100", text: "text-amber-900", icon: "hourglass_top", label: "Proses Curing" },
};

function LogStatusBadge({ status }: { status: LogStatus }) {
  const c = STATUS_CFG[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${c.bg} ${c.text}`}>
      <span className="material-symbols-outlined text-[13px]">{c.icon}</span>
      {c.label}
    </span>
  );
}

export default function PetaniApp() {
  const handleCatatPanen = () => {
    if (navigator.vibrate) navigator.vibrate(50);
    window.location.href = "/petani/catat";
  };

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="w-full max-w-[430px] mx-auto min-h-screen bg-slate-50 flex flex-col relative">
      <Header today={today} />
      <MainContent
        today={today}
        onCatatPanen={handleCatatPanen}
      />
      <BottomNav activeIndex={0} />
    </div>
  );
}

/* ── Header ── */
function Header({ today }: { today: string }) {
  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="h-9 w-9 rounded-xl bg-brand-600 flex items-center justify-center shadow-sm">
          <img src="/Ico.png" alt="SIDIK-KAKAO" className="h-7 w-7" />
        </div>
        <span className="font-display font-bold text-sm text-slate-900 tracking-tight">
          SIDIK-KAKAO
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Online
        </span>
        <div className="h-8 w-8 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center border border-brand-600/20">
          {FARMER.avatar}
        </div>
      </div>
    </header>
  );
}

/* ── Main Content ── */
function MainContent({ today, onCatatPanen }: { today: string; onCatatPanen: () => void }) {
  return (
    <main className="flex-1 overflow-y-auto pb-24 px-4 pt-4 space-y-4">
      {/* Greeting Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display font-bold text-lg text-slate-900">
              Halo, {FARMER.shortName} 👋
            </h2>
            <div className="flex items-center gap-1.5 mt-1.5">
              <MaterialIcon name="location_on" size={14} className="text-cacao-500" />
              <span className="text-xs font-medium text-slate-500">{FARMER.location}</span>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-medium text-right leading-tight">
            {today}
          </span>
        </div>
      </div>

      {/* Hero Primary Action */}
      <button
        onClick={onCatatPanen}
        className="w-full bg-brand-600 hover:bg-brand-700 text-white rounded-2xl p-5 flex items-center gap-3 shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
      >
        <div className="h-10 w-10 shrink-0 rounded-xl bg-white/20 flex items-center justify-center">
          <MaterialIcon name="add" size={28} className="text-white" />
        </div>
        <div className="text-left">
          <span className="font-display font-bold text-base block">CATAT HASIL PANEN BARU</span>
          <span className="text-xs text-white/80 block mt-0.5">Tekan untuk mulai input panen</span>
        </div>
      </button>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-3">
        {KPI.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{kpi.label}</span>
              <span className={`p-1.5 rounded-lg ${kpi.iconBg}`}><MaterialIcon name={kpi.icon} size={16} /></span>
            </div>
            <div>
              <span className="font-display font-bold text-xl text-slate-900">{kpi.value}</span>
              <span className="text-sm font-medium text-slate-500 ml-0.5">{kpi.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <AiInsightBanner />
      <WeatherBar />
      <RecentLogsSection />
    </main>
  );
}

/* ── AI Insight Banner ── */
function AiInsightBanner() {
  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 shadow-xs">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 shrink-0 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
          <MaterialIcon name="psychology" size={20} />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">{AI_INSIGHT.source}</span>
            <span className="text-[11px] text-emerald-700">• Prediksi Panen</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display font-bold text-xl text-emerald-900">{AI_INSIGHT.prediction}</span>
            <span className="text-sm font-semibold text-emerald-600">({AI_INSIGHT.change})</span>
          </div>
          <p className="text-xs text-emerald-700">{AI_INSIGHT.period}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Weather Bar ── */
function WeatherBar() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 px-4 py-3 shadow-xs flex items-center gap-3">
      <div className="h-9 w-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
        <MaterialIcon name={WEATHER.icon} size={22} />
      </div>
      <div className="flex-1">
        <span className="text-sm font-semibold text-slate-800">{WEATHER.temp} • {WEATHER.condition}</span>
        <span className="block text-[11px] text-slate-500 mt-0.5">Kondisi lahan hari ini</span>
      </div>
      <MaterialIcon name="chevron_right" size={20} className="text-slate-400" />
    </div>
  );
}

/* ── Recent Logs ── */
function RecentLogsSection() {
  const [logs, setLogs] = useState<HarvestLog[]>(RECENT_LOGS);

  useEffect(() => {
    fetchHarvests().then((stored) => {
      if (stored.length === 0) return;
      const localLogs: HarvestLog[] = stored.map((r: HarvestRecord) => ({
        id: r.id,
        date: r.dateFormatted.split(",")[0].trim(),
        weight: `${r.weightKg} Kg`,
        grade: r.gradeLabel,
        status: r.status === "Terverifikasi" ? "terverifikasi" : "curing",
      }));
      const mockIds = new Set(RECENT_LOGS.map((l) => l.id));
      const filtered = localLogs.filter((l) => !mockIds.has(l.id));
      setLogs([...filtered, ...RECENT_LOGS]);
    });
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-sm text-slate-900">Riwayat Panen Terakhir</h3>
        <button
          onClick={() => { window.location.href = "/petani/riwayat"; }}
          className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
        >
          Lihat Semua
        </button>
      </div>
      <div className="space-y-2">
        {logs.map((log) => (
          <div key={log.id} className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <MaterialIcon name="inventory_2" size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-800">{log.id}</span>
                <LogStatusBadge status={log.status} />
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-500">{log.date}</span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-medium text-slate-700">{log.weight}</span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-medium text-cacao-500">{log.grade}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

