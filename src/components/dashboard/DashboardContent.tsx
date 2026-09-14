import PageHeader from "./PageHeader";
import AiAlertBanner from "./AiAlertBanner";
import KpiGrid from "./KpiGrid";
import TrendChart from "./TrendChart";
import QualityDonutChart from "./QualityDonutChart";
import HarvestTable from "./HarvestTable";
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
  return (
    <main className="p-4 lg:p-8 space-y-6 w-full mx-auto">
      {/* Page Header & Primary Action */}
      <PageHeader
        title="Ikhtisar Dashboard"
        subtitle="Pemantauan produksi, transparansi harga, dan ketertelusuran kakao."
        ctaLabel="Setoran Panen"
        ctaIcon="add"
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
      <HarvestTable batches={harvestBatches} />
    </main>
  );
}
