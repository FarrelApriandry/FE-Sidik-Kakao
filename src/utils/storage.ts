import type { BeanCategory, CacaoGrade, GradePriceEntry } from "../types";
import { getSupabase, SEED_POKTAN_ID, SEED_PETANI_ID } from "../lib/supabase";

/* ─────────────────────────────────────────────
   Constants
   ───────────────────────────────────────────── */
const STORAGE_KEY = "sidik_kakao_harvests";
const PRICES_CACHE_KEY = "sidik_kakao_grade_prices";

/* ─────────────────────────────────────────────
   Harvest Record Shape (extended for sync)
   ───────────────────────────────────────────── */
export interface HarvestRecord {
  id: string;
  supabaseId?: string;
  farmerId?: string;
  farmerName: string;
  poktanId?: string;
  date: string;
  dateFormatted: string;
  weightKg: number;
  moisturePct?: number;
  category: BeanCategory;
  grade: CacaoGrade;
  gradeLabel: string;
  fungalStatus: string;
  totalValue: number;
  pricePerKg: number;
  status: "Terverifikasi" | "Proses Curing";
  qrPayload: string;
  syncStatus: "pending" | "synced" | "error";
  syncError?: string;
  lastSyncedAt?: string;
  createdAt: string;
}

/* ─────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────── */
export function generateBatchId(): string {
  const num = Math.floor(Math.random() * 900) + 100;
  return `BTH-KK-${num}`;
}

export function formatDateId(date: Date): string {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Ags", "Sep", "Okt", "Nov", "Des",
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day} ${month} ${year}, ${hours}:${minutes}`;
}

/* ─────────────────────────────────────────────
   localStorage CRUD
   ───────────────────────────────────────────── */
export function getHarvests(): HarvestRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HarvestRecord[];
  } catch {
    return [];
  }
}

export function setHarvests(records: HarvestRecord[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function updateLocalRecord(record: HarvestRecord): void {
  const all = getHarvests();
  const idx = all.findIndex((r) => r.id === record.id);
  if (idx !== -1) all[idx] = record;
  else all.unshift(record);
  setHarvests(all);
}

/* ─────────────────────────────────────────────
   Transformers
   ───────────────────────────────────────────── */
export function dbRowToHarvestRecord(
  row: Record<string, unknown>
): HarvestRecord {
  const profiles = row.profiles as Record<string, unknown> | null;
  const farmerName =
    (profiles?.full_name as string) ?? (row.farmer_name as string) ?? "Unknown";
  const createdAt = row.created_at as string;
  return {
    id: row.id as string,
    supabaseId: row.id as string,
    farmerId: row.farmer_id as string | undefined,
    farmerName,
    poktanId: row.poktan_id as string | undefined,
    date: createdAt,
    dateFormatted: formatDateId(new Date(createdAt)),
    weightKg: Number(row.weight_kg),
    moisturePct: row.moisture_pct != null ? Number(row.moisture_pct) : undefined,
    category: row.category as BeanCategory,
    grade: row.grade as CacaoGrade,
    gradeLabel: row.grade_label as string,
    fungalStatus: row.fungal_status as string,
    totalValue: Number(row.total_value),
    pricePerKg: Number(row.price_per_kg),
    status: row.status as "Terverifikasi" | "Proses Curing",
    qrPayload:
      typeof row.qr_payload === "string"
        ? row.qr_payload
        : JSON.stringify(row.qr_payload ?? {}),
    syncStatus: "synced",
    lastSyncedAt: createdAt,
    createdAt,
  };
}

export function harvestRecordToDbRow(
  record: HarvestRecord,
  farmerId?: string,
  poktanId?: string
): Record<string, unknown> {
  let qrPayload: unknown;
  try { qrPayload = JSON.parse(record.qrPayload); }
  catch { qrPayload = {}; }
  return {
    id: record.id,
    farmer_id: farmerId ?? record.farmerId ?? SEED_PETANI_ID,
    poktan_id: poktanId ?? record.poktanId ?? SEED_POKTAN_ID,
    weight_kg: record.weightKg,
    category: record.category,
    grade: record.grade,
    grade_label: record.gradeLabel,
    moisture_pct: record.moisturePct ?? 0,
    fungal_status: record.fungalStatus,
    price_per_kg: record.pricePerKg,
    total_value: record.totalValue,
    status: record.status,
    qr_payload: qrPayload,
  };
}

/* ─────────────────────────────────────────────
   Grade Prices (cloud-first, cached)
   ───────────────────────────────────────────── */
const FALLBACK_GRADE_PRICES: GradePriceEntry[] = [
  { grade: "A", category: "basah", pricePerKg: 28_000 },
  { grade: "A", category: "fermentasi", pricePerKg: 42_000 },
  { grade: "A", category: "kering", pricePerKg: 55_000 },
  { grade: "B", category: "basah", pricePerKg: 20_000 },
  { grade: "B", category: "fermentasi", pricePerKg: 32_000 },
  { grade: "B", category: "kering", pricePerKg: 40_000 },
];

export async function fetchGradePrices(): Promise<GradePriceEntry[]> {
  if (typeof window === "undefined") return FALLBACK_GRADE_PRICES;
  const cached = localStorage.getItem(PRICES_CACHE_KEY);
  const cache: GradePriceEntry[] = cached ? JSON.parse(cached) : [];
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("grade_prices")
      .select("grade, category, price_per_kg")
      .order("grade");
    if (error) throw error;
    if (!data || data.length === 0) throw new Error("Empty");
    const prices: GradePriceEntry[] = data.map((r) => ({
      grade: r.grade as CacaoGrade,
      category: r.category as BeanCategory,
      pricePerKg: Number(r.price_per_kg),
    }));
    localStorage.setItem(PRICES_CACHE_KEY, JSON.stringify(prices));
    return prices;
  } catch {
    return cache.length > 0 ? cache : FALLBACK_GRADE_PRICES;
  }
}

/* ─────────────────────────────────────────────
   Auth / Profile
   ───────────────────────────────────────────── */
export interface UserProfile {
  id: string;
  role: "admin_poktan" | "petani";
  fullName: string;
  poktanId?: string;
}

export async function fetchProfile(): Promise<UserProfile | null> {
  try {
    const supabase = getSupabase();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, role, poktan_id")
      .eq("id", user.id)
      .single();

    return {
      id: user.id,
      role: (profile?.role as "admin_poktan" | "petani") ?? "petani",
      fullName: profile?.full_name ?? (user.user_metadata?.full_name as string) ?? "Unknown",
      poktanId: profile?.poktan_id ?? (user.user_metadata?.poktan_id as string | undefined),
    };
  } catch {
    return null;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    const supabase = getSupabase();
    await supabase.auth.signOut();
  } catch {
    // silent
  }
}

/* ─────────────────────────────────────────────
   READ PATH — fetchHarvests (hybrid)
   ───────────────────────────────────────────── */
export async function fetchHarvests(
  userId?: string | null
): Promise<HarvestRecord[]> {
  if (typeof window === "undefined") return [];
  const local = getHarvests();
  try {
    const supabase = getSupabase();
    let query = supabase
      .from("harvest_batches")
      .select(
        `id, farmer_id, poktan_id, weight_kg, category, grade,
         grade_label, moisture_pct, fungal_status, price_per_kg,
         total_value, status, qr_payload, created_at,
         profiles!farmer_id ( full_name )`
      )
      .order("created_at", { ascending: false })
      .limit(200);
    if (userId) query = query.eq("farmer_id", userId);
    const { data, error } = await query;
    if (error) throw error;
    const cloudRecords = (data ?? []).map(dbRowToHarvestRecord);
    const pendingLocal = local.filter((r) => r.syncStatus === "pending");
    const merged = [...pendingLocal, ...cloudRecords];
    const seen = new Set<string>();
    const deduped = merged.filter((r) => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });
    setHarvests(deduped);
    return deduped;
  } catch {
    return local;
  }
}

/* ─────────────────────────────────────────────
   WRITE PATH — saveHarvest (optimistic + sync)
   ───────────────────────────────────────────── */
export async function saveHarvest(
  record: HarvestRecord,
  farmerId?: string,
  poktanId?: string
): Promise<HarvestRecord> {
  if (typeof window === "undefined") return record;
  record.syncStatus = "pending";
  record.createdAt = record.createdAt || new Date().toISOString();
  const existing = getHarvests();
  existing.unshift(record);
  setHarvests(existing);
  syncSingleRecord(record, farmerId, poktanId).catch(() => {});
  return record;
}

/* ─────────────────────────────────────────────
   SYNC ENGINE
   ───────────────────────────────────────────── */
async function syncSingleRecord(
  record: HarvestRecord,
  farmerId?: string,
  poktanId?: string
): Promise<void> {
  if (typeof window === "undefined") return;
  const supabase = getSupabase();
  const dbRow = harvestRecordToDbRow(record, farmerId, poktanId);
  const { error } = await supabase
    .from("harvest_batches")
    .upsert(dbRow, { onConflict: "id", ignoreDuplicates: false });
  if (error) {
    record.syncStatus = "error";
    record.syncError = error.message;
    updateLocalRecord(record);
    return;
  }
  record.syncStatus = "synced";
  record.lastSyncedAt = new Date().toISOString();
  record.syncError = undefined;
  updateLocalRecord(record);
}

export async function syncPendingRecords(): Promise<{
  synced: number;
  failed: number;
}> {
  if (typeof window === "undefined") return { synced: 0, failed: 0 };
  const all = getHarvests();
  const pending = all.filter(
    (r) => r.syncStatus === "pending" || r.syncStatus === "error"
  );
  if (pending.length === 0) return { synced: 0, failed: 0 };
  let synced = 0;
  let failed = 0;
  for (const record of pending) {
    try {
      await syncSingleRecord(record);
      synced++;
    } catch {
      failed++;
    }
  }
  return { synced, failed };
}

/* ─────────────────────────────────────────────
   NETWORK LISTENERS
   ───────────────────────────────────────────── */
let _listenersAttached = false;

export function attachNetworkListeners(): void {
  if (typeof window === "undefined" || _listenersAttached) return;
  _listenersAttached = true;
  window.addEventListener("online", () => {
    console.info("[SIDIK-KAKAO] Back online — flushing pending sync…");
    syncPendingRecords().then(({ synced, failed }) => {
      console.info(`[SIDIK-KAKAO] Sync: ${synced} ok, ${failed} failed`);
    });
  });
  window.addEventListener("offline", () => {
    console.info("[SIDIK-KAKAO] Offline — local-only mode.");
  });
}

if (typeof window !== "undefined") {
  attachNetworkListeners();
}
