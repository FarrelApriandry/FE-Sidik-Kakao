import type {
  NavItem,
  KpiMetric,
  WeatherAlert,
  TrendDataPoint,
  QualitySegment,
  HarvestBatch,
  SyncStatus,
  GradePriceEntry,
} from "../types";

export const MOCK_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: "space_dashboard", href: "#", isActive: true },
  { label: "Data Petani", icon: "group", href: "#", isActive: false },
  { label: "Rekap Panen", icon: "inventory", href: "#", isActive: false },
  { label: "Ketertelusuran", icon: "qr_code_scanner", href: "#", isActive: false },
  { label: "AI Insight", icon: "psychology", href: "#", isActive: false },
];

export const MOCK_SYNC_STATUS: SyncStatus = {
  state: "online",
  label: "Sinkron Aktif",
  sublabel: "Offline-Ready",
};

export const MOCK_WEATHER_ALERT: WeatherAlert = {
  source: "BMKG Luwu",
  message:
    "Curah hujan tinggi 5 hari ke depan. Potensi kenaikan kadar air biji",
  highlight: "+2.5%",
  ctaLabel: "Rekomendasi Mitigasi",
};

export const MOCK_KPI_METRICS: KpiMetric[] = [
  {
    label: "Total Produksi",
    value: "12.4",
    unit: "Ton",
    icon: "scale",
    iconBg: "bg-brand-50 text-brand-600",
    trend: { direction: "up", value: "82.7% dari target", color: "emerald" },
  },
  {
    label: "Petani Aktif Setor",
    value: "48",
    unit: "/ 50 Orang",
    subtitle: "96% partisipasi poktan",
    icon: "groups",
    iconBg: "bg-slate-100 text-slate-700",
  },
  {
    label: "Rata-Rata Harga",
    value: "Rp 50.000",
    unit: "/Kg",
    icon: "payments",
    iconBg: "bg-amber-50 text-cacao-500",
    trend: {
      direction: "up",
      value: "+Rp 2.000 vs pasar lokal",
      color: "emerald",
    },
  },
  {
    label: "Skor Ketertelusuran",
    value: "98%",
    subtitle: "47/48 Batch Terverifikasi QR",
    icon: "qr_code_2",
    iconBg: "bg-brand-600 text-white",
    valueColor: "text-brand-700",
  },
];

export const MOCK_TREND_DATA: TrendDataPoint[] = [
  { month: "Mei", volume: 1.0, price: 38000 },
  { month: "Jun", volume: 4.0, price: 40000 },
  { month: "Jul", volume: 6.0, price: 44000 },
  { month: "Ags", volume: 7.5, price: 47000 },
  { month: "Sep", volume: 9.5, price: 49000 },
  { month: "Okt", volume: 12.0, price: 50000 },
];

export const MOCK_QUALITY_SEGMENTS: QualitySegment[] = [
  { label: "Grade A SNI", percentage: 68, weight: "8,4 Ton", color: "#2e6f40" },
  {
    label: "Grade B Fermentasi",
    percentage: 24,
    weight: "3,0 Ton",
    color: "#775652",
  },
  {
    label: "Non-Standard Asalan",
    percentage: 8,
    weight: "1,0 Ton",
    color: "#ef4444",
  },
];

export const MOCK_HARVEST_BATCHES: HarvestBatch[] = [
  {
    id: "BTH-KK-089",
    farmerName: "Ahmad Fauzi",
    timestamp: "24 Okt, 15:30",
    weight: "185 Kg",
    grade: "A",
    moisture: "8.5% (Perlu Jemur)",
    moistureStatus: "perlu-jemur",
    totalValue: "Rp 9.250.000",
    status: "terverifikasi",
    actionLabel: "Cetak Label",
  },
  {
    id: "BTH-KK-088",
    farmerName: "Joko Warsito",
    timestamp: "24 Okt, 14:15",
    weight: "210 Kg",
    grade: "A",
    moisture: "7.1% (Optimal)",
    moistureStatus: "optimal",
    totalValue: "Rp 10.500.000",
    status: "terverifikasi",
    actionLabel: "Detail",
  },
  {
    id: "BTH-KK-087",
    farmerName: "Siti Rohmah",
    timestamp: "24 Okt, 11:00",
    weight: "95 Kg",
    grade: "B",
    moisture: "10.2% (Perlu Jemur)",
    moistureStatus: "perlu-jemur",
    totalValue: "Rp 4.560.000",
    status: "curing",
    actionLabel: "Detail",
  },
];

export const MOCK_GRADE_PRICES: GradePriceEntry[] = [
  { grade: "A", category: "basah", pricePerKg: 28_000 },
  { grade: "A", category: "fermentasi", pricePerKg: 42_000 },
  { grade: "A", category: "kering", pricePerKg: 55_000 },
  { grade: "B", category: "basah", pricePerKg: 20_000 },
  { grade: "B", category: "fermentasi", pricePerKg: 32_000 },
  { grade: "B", category: "kering", pricePerKg: 40_000 },
];
