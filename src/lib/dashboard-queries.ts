import { getSupabase } from "./supabase";
import type {
  DashboardKPI,
  MonthlyTrend,
  GradeDistribution,
  FarmerWithDeposit,
  MonthlyRekapRow,
  RekapSummary,
  BatchWithProfile,
  BatchTraceDetail,
  MoistureStats,
  ForecastPoint,
} from "../types";

/* ─────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────── */

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Ags", "Sep", "Okt", "Nov", "Des",
];

function formatMonthLabel(isoDate: string): string {
  const d = new Date(isoDate);
  return `${MONTH_LABELS[d.getMonth()]} ${d.getFullYear()}`;
}

function shortMonthLabel(isoDate: string): string {
  const d = new Date(isoDate);
  return MONTH_LABELS[d.getMonth()];
}

/* ─────────────────────────────────────────────
   Q1: Dashboard KPI Metrics
   ───────────────────────────────────────────── */
export async function fetchDashboardKPIs(
  poktanId: string
): Promise<DashboardKPI> {
  const supabase = getSupabase();

  const { data: batches, error } = await supabase
    .from("harvest_batches")
    .select("weight_kg, price_per_kg, farmer_id, qr_payload, status")
    .eq("poktan_id", poktanId);

  if (error) throw error;

  const rows = batches ?? [];
  const totalKg = rows.reduce((s, r) => s + Number(r.weight_kg), 0);
  const farmerIds = new Set(rows.map((r) => r.farmer_id).filter(Boolean));
  const avgPrice =
    rows.length > 0
      ? rows.reduce((s, r) => s + Number(r.price_per_kg), 0) / rows.length
      : 0;
  const verifiedBatches = rows.filter((r) => r.qr_payload != null).length;

  let totalPetani: number | null = null;
  try {
    const { count } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("poktan_id", poktanId)
      .eq("role", "petani");
    totalPetani = count;
  } catch {
    // RLS or fetch error — fall back gracefully
    totalPetani = null;
  }

  return {
    totalKg,
    activeFarmers: farmerIds.size,
    totalPetani: totalPetani ?? farmerIds.size,
    avgPrice: Math.round(avgPrice),
    totalBatches: rows.length,
    verifiedBatches,
  };
}

/* ─────────────────────────────────────────────
   Q2: Monthly Trend (Volume & Price)
   ───────────────────────────────────────────── */
export async function fetchMonthlyTrend(
  poktanId: string,
  months = 6
): Promise<MonthlyTrend[]> {
  const supabase = getSupabase();
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - months);

  const { data, error } = await supabase
    .from("harvest_batches")
    .select("weight_kg, price_per_kg, created_at")
    .eq("poktan_id", poktanId)
    .gte("created_at", cutoff.toISOString())
    .order("created_at", { ascending: true });

  if (error) throw error;

  // Aggregate actual rows by month key ("YYYY-MM")
  const monthMap = new Map<string, { volumeKg: number; prices: number[] }>();
  for (const row of data ?? []) {
    const key = row.created_at.slice(0, 7);
    const entry = monthMap.get(key) ?? { volumeKg: 0, prices: [] };
    entry.volumeKg += Number(row.weight_kg);
    entry.prices.push(Number(row.price_per_kg));
    monthMap.set(key, entry);
  }

  // Generate the continuous N-month window ending at the current month
  const window: MonthlyTrend[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const agg = monthMap.get(key);

    window.push({
      month: shortMonthLabel(`${key}-01`),
      monthDate: `${key}-01`,
      volume: agg
        ? Math.round((agg.volumeKg / 1000) * 10) / 10
        : 0,
      price:
        agg && agg.prices.length > 0
          ? Math.round(agg.prices.reduce((s, p) => s + p, 0) / agg.prices.length)
          : 0,
    });
  }

  return window;
}

/* ─────────────────────────────────────────────
   Q3: Grade Distribution
   ───────────────────────────────────────────── */
export async function fetchGradeDistribution(
  poktanId: string
): Promise<GradeDistribution[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("harvest_batches")
    .select("grade, weight_kg")
    .eq("poktan_id", poktanId);

  if (error) throw error;

  const gradeMap = new Map<string, { totalWeight: number; count: number }>();
  for (const row of data ?? []) {
    const g = row.grade as string;
    const entry = gradeMap.get(g) ?? { totalWeight: 0, count: 0 };
    entry.totalWeight += Number(row.weight_kg);
    entry.count += 1;
    gradeMap.set(g, entry);
  }

  return Array.from(gradeMap.entries()).map(([grade, val]) => ({
    grade,
    totalWeight: val.totalWeight,
    batchCount: val.count,
  }));
}

/* ─────────────────────────────────────────────
   Q4: Recent Harvest Batches (with farmer name)
   ───────────────────────────────────────────── */
export async function fetchRecentBatches(
  poktanId: string,
  limit = 20
): Promise<BatchWithProfile[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("harvest_batches")
    .select(
      `id, weight_kg, grade, grade_label, moisture_pct, fungal_status,
       price_per_kg, total_value, status, qr_payload, created_at, farmer_id,
       profiles!farmer_id ( full_name )`
    )
    .eq("poktan_id", poktanId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((row) => {
    const profile = row.profiles as unknown as { full_name: string } | null;
    return {
      id: row.id as string,
      weightKg: Number(row.weight_kg),
      grade: row.grade as string,
      gradeLabel: row.grade_label as string,
      moisturePct: row.moisture_pct != null ? Number(row.moisture_pct) : null,
      fungalStatus: row.fungal_status as string,
      pricePerKg: Number(row.price_per_kg),
      totalValue: Number(row.total_value),
      status: row.status as string,
      qrPayload: row.qr_payload,
      createdAt: row.created_at as string,
      farmerName: profile?.full_name ?? "Unknown",
      farmerId: row.farmer_id as string,
    };
  });
}

/* ─────────────────────────────────────────────
   Q5: Data Petani (with deposit aggregation)
   ───────────────────────────────────────────── */
export async function fetchFarmersWithDeposits(
  poktanId: string
): Promise<FarmerWithDeposit[]> {
  const supabase = getSupabase();

  const { data: farmers, error: fErr } = await supabase
    .from("profiles")
    .select("id, full_name, phone_number, estate_area_ha")
    .eq("poktan_id", poktanId)
    .eq("role", "petani")
    .order("full_name");

  if (fErr) throw fErr;
  if (!farmers || farmers.length === 0) return [];

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const { data: batches, error: bErr } = await supabase
    .from("harvest_batches")
    .select("farmer_id, weight_kg")
    .eq("poktan_id", poktanId)
    .gte("created_at", monthStart.toISOString());

  if (bErr) throw bErr;

  const depositMap = new Map<string, number>();
  for (const b of batches ?? []) {
    const fid = b.farmer_id as string;
    depositMap.set(fid, (depositMap.get(fid) ?? 0) + Number(b.weight_kg));
  }

  return farmers.map((f) => ({
    id: f.id,
    fullName: f.full_name,
    phoneNumber: f.phone_number,
    estateAreaHa: f.estate_area_ha != null ? Number(f.estate_area_ha) : null,
    totalDepositKg: Math.round(depositMap.get(f.id) ?? 0),
  }));
}

/* ─────────────────────────────────────────────
   Q6: Rekap Panen (summary + monthly breakdown)
   ───────────────────────────────────────────── */
export async function fetchRekapSummary(
  poktanId: string
): Promise<RekapSummary> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("harvest_batches")
    .select("weight_kg, total_value, status")
    .eq("poktan_id", poktanId);

  if (error) throw error;

  const rows = data ?? [];
  const totalKg = rows.reduce((s, r) => s + Number(r.weight_kg), 0);
  const totalValue = rows.reduce((s, r) => s + Number(r.total_value), 0);
  const verifiedBatches = rows.filter((r) => r.status === "Terverifikasi").length;

  return {
    totalKg,
    avgPerBatch: rows.length > 0 ? Math.round(totalKg / rows.length) : 0,
    totalBatches: rows.length,
    verifiedBatches,
    totalValue,
  };
}

export async function fetchMonthlyRekap(
  poktanId: string
): Promise<MonthlyRekapRow[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("harvest_batches")
    .select("weight_kg, grade, total_value, created_at")
    .eq("poktan_id", poktanId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  const monthMap = new Map<string, { kg: number; count: number; gradeA: number; value: number }>();
  for (const row of data ?? []) {
    const key = row.created_at.slice(0, 7);
    const entry = monthMap.get(key) ?? { kg: 0, count: 0, gradeA: 0, value: 0 };
    entry.kg += Number(row.weight_kg);
    entry.count += 1;
    if (row.grade === "A") entry.gradeA += 1;
    entry.value += Number(row.total_value);
    monthMap.set(key, entry);
  }

  return Array.from(monthMap.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, val]) => ({
      monthLabel: formatMonthLabel(`${key}-01`),
      totalKg: Math.round(val.kg),
      batches: val.count,
      gradeAPct: val.count > 0 ? Math.round((val.gradeA / val.count) * 100) : 0,
      value: Math.round(val.value),
    }));
}

/* ─────────────────────────────────────────────
   Q7: Ketertelusuran (Batch Lookup by ID)
   ───────────────────────────────────────────── */
export async function fetchBatchTrace(
  searchTerm: string
): Promise<BatchTraceDetail | null> {
  const supabase = getSupabase();

  const { data: row } = await supabase
    .from("harvest_batches")
    .select(
      `id, weight_kg, grade, grade_label, moisture_pct, fungal_status,
       price_per_kg, total_value, status, qr_payload, created_at, farmer_id,
       poktan_id,
       profiles!farmer_id ( full_name ),
       poktans!poktan_id ( name, location )`
    )
    .eq("id", searchTerm)
    .maybeSingle();

  if (!row) return null;

  const profile = row.profiles as unknown as { full_name: string } | null;
  const poktan = row.poktans as unknown as { name: string; location: string } | null;

  return {
    id: row.id as string,
    weightKg: Number(row.weight_kg),
    grade: row.grade as string,
    gradeLabel: row.grade_label as string,
    moisturePct: row.moisture_pct != null ? Number(row.moisture_pct) : null,
    fungalStatus: row.fungal_status as string,
    pricePerKg: Number(row.price_per_kg),
    totalValue: Number(row.total_value),
    status: row.status as string,
    qrPayload: row.qr_payload,
    createdAt: row.created_at as string,
    farmerName: profile?.full_name ?? "Unknown",
    poktanName: poktan?.name ?? "Unknown",
    poktanLocation: poktan?.location ?? "Unknown",
  };
}

/* ─────────────────────────────────────────────
   Q8: Moisture Analytics
   ───────────────────────────────────────────── */
export async function fetchMoistureStats(
  poktanId: string
): Promise<MoistureStats> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("harvest_batches")
    .select("moisture_pct, created_at")
    .eq("poktan_id", poktanId)
    .not("moisture_pct", "is", null)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;

  const rows = (data ?? []).filter((r) => r.moisture_pct != null);
  if (rows.length === 0) {
    return { avgMoisture: 0, highMoistureCount: 0, totalSamples: 0, riskPct: 0, recentMoisture: [] };
  }

  const moistureValues = rows.map((r) => Number(r.moisture_pct));
  const avg = moistureValues.reduce((s, v) => s + v, 0) / moistureValues.length;
  const highCount = moistureValues.filter((v) => v > 8.5).length;

  return {
    avgMoisture: Math.round(avg * 10) / 10,
    highMoistureCount: highCount,
    totalSamples: rows.length,
    riskPct: Math.round((highCount / rows.length) * 1000) / 10,
    recentMoisture: moistureValues.slice(0, 10),
  };
}

/* ─────────────────────────────────────────────
   Q9: Forecast (moving-average projection)
   ───────────────────────────────────────────── */
const DQ_MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];

export async function fetchForecast(poktanId: string): Promise<ForecastPoint[]> {
  const supabase = getSupabase();
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - 6);

  const { data } = await supabase
    .from("harvest_batches")
    .select("weight_kg, created_at")
    .eq("poktan_id", poktanId)
    .gte("created_at", cutoff.toISOString())
    .order("created_at", { ascending: true });

  const monthMap = new Map<string, number>();
  for (const row of data ?? []) {
    const key = row.created_at.slice(0, 7);
    monthMap.set(key, (monthMap.get(key) ?? 0) + Number(row.weight_kg));
  }

  const monthVolumes = Array.from(monthMap.values()).map((v) => v / 1000);
  const recent = monthVolumes.length >= 3 ? monthVolumes.slice(-3) : monthVolumes.length > 0 ? monthVolumes : [5];
  const avg = recent.reduce((s, v) => s + v, 0) / recent.length;

  const forecasts: ForecastPoint[] = [];
  const now = new Date();
  for (let i = 1; i <= 3; i++) {
    const futureDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const predicted = Math.max(avg * (1 - i * 0.12), 0.5);
    const confidence = Math.max(88 - i * 8, 60);
    forecasts.push({
      month: `${DQ_MONTH_LABELS[futureDate.getMonth()]} ${futureDate.getFullYear()}`,
      predicted: `${predicted.toFixed(1)} Ton`,
      confidence: `${confidence}%`,
      direction: "down",
    });
  }
  return forecasts;
}

/* ─────────────────────────────────────────────
   Q10: Poktan & Profile Helpers
   ───────────────────────────────────────────── */
export async function fetchPoktanName(poktanId: string): Promise<string> {
  const supabase = getSupabase();
  const { data } = await supabase.from("poktans").select("name").eq("id", poktanId).maybeSingle();
  return data?.name ?? "Poktan";
}

export async function fetchFarmerOptions(poktanId: string): Promise<{ id: string; fullName: string }[]> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("poktan_id", poktanId)
    .eq("role", "petani")
    .order("full_name");
  return (data ?? []).map((r) => ({ id: r.id, fullName: r.full_name }));
}

export { fetchGradePrices } from "../utils/storage";


