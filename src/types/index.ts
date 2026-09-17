// ── KPI Metric Card ──
export interface KpiMetric {
  label: string;
  value: string;
  unit?: string;
  subtitle?: string;
  trend?: {
    direction: "up" | "down";
    value: string;
    color: "emerald" | "red";
  };
  icon: string;
  iconBg: string;
  valueColor?: string;
}

// ── AI Weather Alert ──
export interface WeatherAlert {
  source: string;
  message: string;
  highlight: string;
  ctaLabel: string;
}

// ── Trend Chart Data Point ──
export interface TrendDataPoint {
  month: string;
  volume: number;
  price: number;
}

// ── Donut Chart Segment ──
export interface QualitySegment {
  label: string;
  percentage: number;
  weight: string;
  color: string;
}

// ── Harvest Batch Record ──
export type BatchStatus = "terverifikasi" | "curing" | "pending";
export type Grade = "A" | "B" | "Non-Standard";

export interface HarvestBatch {
  id: string;
  farmerName: string;
  timestamp: string;
  weight: string;
  grade: Grade;
  moisture: string;
  moisturePct?: number;
  moistureStatus: "optimal" | "perlu-jemur";
  totalValue: string;
  status: BatchStatus;
  actionLabel: string;
}

// ── Navigation Item ──
export interface NavItem {
  label: string;
  icon: string;
  href: string;
}

// ── Sidebar Props ──
export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
  syncStatus: SyncStatus;
  currentPath?: string;
}

// ── Sync Status ──
export type SyncStatusState = "online" | "offline" | "syncing";

export interface SyncStatus {
  state: SyncStatusState;
  label: string;
  sublabel: string;
}

// ── Dashboard Query Result Types ──

/** Aggregated KPI metrics fetched from harvest_batches */
export interface DashboardKPI {
  totalKg: number;
  activeFarmers: number;
  totalPetani: number;
  avgPrice: number;
  totalBatches: number;
  verifiedBatches: number;
}

/** Monthly trend data point for chart */
export interface MonthlyTrend {
  month: string;       // e.g. "Mei"
  monthDate: string;   // ISO date of month start
  volume: number;      // in tons
  price: number;       // avg price per kg
}

/** Grade distribution for donut chart */
export interface GradeDistribution {
  grade: string;
  totalWeight: number;
  batchCount: number;
}

/** Farmer profile with aggregated deposit */
export interface FarmerWithDeposit {
  id: string;
  fullName: string;
  phoneNumber: string | null;
  estateAreaHa: number | null;
  totalDepositKg: number;
}

/** Monthly rekap row */
export interface MonthlyRekapRow {
  monthLabel: string;
  totalKg: number;
  batches: number;
  gradeAPct: number;
  value: number;
}

/** Rekap summary cards */
export interface RekapSummary {
  totalKg: number;
  avgPerBatch: number;
  totalBatches: number;
  verifiedBatches: number;
  totalValue: number;
}

/** Harvest batch with joined farmer profile */
export interface BatchWithProfile {
  id: string;
  weightKg: number;
  grade: string;
  gradeLabel: string;
  moisturePct: number | null;
  fungalStatus: string;
  pricePerKg: number;
  totalValue: number;
  status: string;
  qrPayload: unknown;
  createdAt: string;
  farmerName: string;
  farmerId: string;
}

/** Ketertelusuran batch detail with supply chain info */
export interface BatchTraceDetail {
  id: string;
  weightKg: number;
  grade: string;
  gradeLabel: string;
  moisturePct: number | null;
  fungalStatus: string;
  pricePerKg: number;
  totalValue: number;
  status: string;
  qrPayload: unknown;
  createdAt: string;
  farmerName: string;
  poktanName: string;
  poktanLocation: string;
}

/** Moisture analytics computed from real data */
export interface MoistureStats {
  avgMoisture: number;
  highMoistureCount: number;
  totalSamples: number;
  riskPct: number;
  recentMoisture: number[];
}

/** Forecast data point */
export interface ForecastPoint {
  month: string;
  predicted: string;
  confidence: string;
  direction: "up" | "down";
}

// ── Catat Hasil Panen Types ──

/** Bean moisture/processing category */
export type BeanCategory = "basah" | "fermentasi" | "kering";

/** SNI-aligned cocoa grade */
export type CacaoGrade = "A" | "B";

/** Full state shape for the harvest entry form */
export interface HarvestInputState {
  /** Harvest weight in kilograms (stored as string for input control, parsed to number for calc) */
  weightKg: string;
  /** Selected bean category pill */
  category: BeanCategory;
  /** Captured photo as a base64 data-URL string, or null if not yet captured */
  photoDataUrl: string | null;
  /** Whether AI analysis is currently running */
  isAnalyzing: boolean;
  /** AI result object, null until analysis completes */
  aiResult: AiAnalysisResult | null;
}

/** Simulated AI computer-vision analysis output */
export interface AiAnalysisResult {
  /** Detected grade */
  grade: CacaoGrade;
  /** Grade display label, e.g. "Grade A (SNI)" */
  gradeLabel: string;
  /** Fungal detection status */
  fungalStatus: "Bebas Jamur" | "Terdeteksi Jamur";
  /** Whether fungal was detected (for styling) */
  hasFungalRisk: boolean;
  /** Model confidence 0–100 */
  confidence: number;
}

/** Price lookup entry for valuation */
export interface GradePriceEntry {
  grade: CacaoGrade;
  category: BeanCategory;
  pricePerKg: number;
}
