import { useState } from "react";
import PageHeader from "./PageHeader";
import AiAlertBanner from "./AiAlertBanner";
import KpiGrid from "./KpiGrid";
import TrendChart from "./TrendChart";
import QualityDonutChart from "./QualityDonutChart";
import HarvestTable from "./HarvestTable";
import SetoranModal from "./SetoranModal";
import BatchDetailModal from "./BatchDetailModal";
import type {
  KpiMetric,
  WeatherAlert,
  TrendDataPoint,
  QualitySegment,
  HarvestBatch,
} from "../../types";

interface Props {
  metrics: KpiMetric[];
  weatherAlert: WeatherAlert;
  trendData: TrendDataPoint[];
  qualitySegments: QualitySegment[];
  harvestBatches: HarvestBatch[];
}

export default function DashboardContent({
  metrics,
  weatherAlert,
  trendData,
  qualitySegments,
  harvestBatches,
}: Props) {
  const [isSetoranOpen, setIsSetoranOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<HarvestBatch | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSetoranSave = () => {
    setRefreshKey((prev) => prev + 1);
  };

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
      <AiAlertBanner alert={weatherAlert} />

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
