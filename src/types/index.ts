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
  isActive: boolean;
}

// ── Sidebar Props ──
export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
  syncStatus: SyncStatus;
}

// ── Sync Status ──
export type SyncStatusState = "online" | "offline" | "syncing";

export interface SyncStatus {
  state: SyncStatusState;
  label: string;
  sublabel: string;
}
