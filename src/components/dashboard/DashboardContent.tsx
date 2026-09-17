import { useState, useEffect } from "react";
import PageHeader from "./PageHeader";
import AiAlertBanner from "./AiAlertBanner";
import KpiGrid from "./KpiGrid";
import TrendChart from "./TrendChart";
import QualityDonutChart from "./QualityDonutChart";
import HarvestTable from "./HarvestTable";
import SetoranModal from "./SetoranModal";
import BatchDetailModal from "./BatchDetailModal";
import { getCurrentUser } from "../../lib/supabase";
import {
  fetchDashboardKPIs,
  fetchMonthlyTrend,
  fetchGradeDistribution,
  fetchRecentBatches,
  fetchMoistureStats,
} from "../../lib/dashboard-queries";
import type {
  KpiMetric,
  WeatherAlert,
  TrendDataPoint,
  QualitySegment,
  HarvestBatch,
} from "../../types";

export default function DashboardContent() {
  const [metrics, setMetrics] = useState<KpiMetric[]>([]);
  const [weatherAlert, setWeatherAlert] = useState<WeatherAlert | null>(null);
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [qualitySegments, setQualitySegments] = useState<QualitySegment[]>([]);
  const [harvestBatches, setHarvestBatches] = useState<HarvestBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSetoranOpen, setIsSetoranOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<HarvestBatch | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const user = await getCurrentUser();
      if (!user?.poktanId || cancelled) { setLoading(false); return; }
      try {
        const [kpi, trend, grades, batches, moisture] = await Promise.all([
          fetchDashboardKPIs(user.poktanId),
          fetchMonthlyTrend(user.poktanId),
          fetchGradeDistribution(user.poktanId),
          fetchRecentBatches(user.poktanId),
          fetchMoistureStats(user.poktanId),
        ]);
        if (cancelled) return;

        // Transform raw KPI into KpiMetric[]
        const kpiMetrics: KpiMetric[] = [
          { label: "Total Produksi", value: (kpi.totalKg / 1000).toFixed(1), unit: "Ton", icon: "scale", iconBg: "bg-brand-50 text-brand-600" },
          { label: "Petani Aktif", value: String(kpi.totalPetani), unit: "Petani", icon: "group", iconBg: "bg-emerald-50 text-emerald-600" },
          { label: "Harga Rata-rata", value: `Rp ${(kpi.avgPrice / 1000).toFixed(0)}rb`, unit: "/Kg", icon: "payments", iconBg: "bg-amber-50 text-amber-600" },
          { label: "Batch Terverifikasi", value: String(kpi.verifiedBatches), unit: `dari ${kpi.totalBatches}`, icon: "verified", iconBg: "bg-sky-50 text-sky-600" },
        ];

        // Build weather alert from moisture stats
        const alert: WeatherAlert | null = moisture && moisture.highMoistureCount > 5
          ? {
            source: "Analisis Kadar Air",
            message: `${moisture.highMoistureCount} batch memiliki kadar air > 8.5%. Risiko jamur ${moisture.riskPct}%.`,
            highlight: "Perpanjang waktu pengeringan +2 hari",
            ctaLabel: "Lihat Detail",
          }
          : null;

        // Transform monthly trend
        const trendPts: TrendDataPoint[] = trend.map((t) => ({
          month: t.month,
          volume: t.volume,
          price: t.price,
        }));

        // Transform grade distribution
        const totalGradeWeight = grades.reduce((s, g) => s + g.totalWeight, 0);
        const segColors = ["bg-brand-600", "bg-amber-500", "bg-slate-400"];
        const qualitySegs: QualitySegment[] = grades.map((g, i) => ({
          label: g.grade,
          percentage: totalGradeWeight > 0 ? Math.round((g.totalWeight / totalGradeWeight) * 100) : 0,
          weight: `${(g.totalWeight / 1000).toFixed(1)} Ton`,
          color: segColors[i] ?? "bg-slate-300",
        }));

        // Transform batches to HarvestBatch format
        const hb: HarvestBatch[] = batches.map((b) => ({
          id: b.id,
          farmerName: b.farmerName,
          timestamp: new Date(b.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
          weight: `${b.weightKg} Kg`,
          grade: (b.grade === "A" || b.grade === "B") ? b.grade as "A" | "B" : "Non-Standard",
          moisture: b.moisturePct != null ? `${b.moisturePct}%` : "-",
          moisturePct: b.moisturePct ?? undefined,
          moistureStatus: b.moisturePct != null && b.moisturePct > 8.5 ? "perlu-jemur" : "optimal",
          totalValue: `Rp ${b.totalValue.toLocaleString("id-ID")}`,
          status: b.status === "Terverifikasi" ? "terverifikasi" : b.status === "Proses Curing" ? "curing" : "pending",
          actionLabel: "Detail",
        }));

        setMetrics(kpiMetrics);
        setWeatherAlert(alert);
        setTrendData(trendPts);
        setQualitySegments(qualitySegs);
        setHarvestBatches(hb);
      } catch (e) {
        console.error("Failed to load dashboard:", e);
      }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const handleSetoranSave = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (loading) {
    return (
      <main className="p-4 lg:p-8 space-y-6 w-full mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-20 bg-slate-200 rounded-2xl" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((i) => <div key={i} className="h-28 bg-slate-200 rounded-2xl" />)}
          </div>
          <div className="h-64 bg-slate-200 rounded-2xl" />
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 lg:p-8 space-y-6 w-full mx-auto">
      {/* Page Header & Primary Action */}
      <PageHeader
        title="Ikhtisar Dashboard"
        subtitle="Pemantauan produksi, transparansi harga, dan ketertelusuran kakao."
        ctaLabel="Setoran Panen"
        ctaIcon="add"
        onCtaClick={() => setIsSetoranOpen(true)}
      />

      {/* AI Early Warning Alert */}
      {weatherAlert && <AiAlertBanner alert={weatherAlert} />}

      {/* KPI Metrics Grid (4 Cards) */}
      <KpiGrid metrics={metrics} />

      {/* Analytics Section (Line & Donut Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <TrendChart data={trendData} />
        <QualityDonutChart
          segments={qualitySegments}
          centerValue="68%"
          centerLabel="Grade A SNI"
        />
      </div>

      {/* Harvest Transactions Table */}
      <HarvestTable
        batches={harvestBatches}
        onDetailClick={setSelectedBatch}
        refreshKey={refreshKey}
      />

      {/* Setoran Panen Modal */}
      <SetoranModal
        isOpen={isSetoranOpen}
        onClose={() => setIsSetoranOpen(false)}
        onSave={handleSetoranSave}
      />

      {/* Batch Detail Modal */}
      <BatchDetailModal
        batch={selectedBatch}
        onClose={() => setSelectedBatch(null)}
      />
    </main>
  );
}
