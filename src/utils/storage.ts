import type { BeanCategory, CacaoGrade } from "../types";

/* ── Constants ── */
const STORAGE_KEY = "sidik_kakao_harvests";

/* ── Harvest Record Shape ── */
export interface HarvestRecord {
  id: string;
  farmerName: string;
  date: string;
  dateFormatted: string;
  weightKg: number;
  category: BeanCategory;
  grade: CacaoGrade;
  gradeLabel: string;
  fungalStatus: string;
  totalValue: number;
  pricePerKg: number;
  status: "Terverifikasi" | "Proses Curing";
  qrPayload: string;
}

/* ── Generate Unique Batch ID ── */
export function generateBatchId(): string {
  const num = Math.floor(Math.random() * 900) + 100; // 100-999
  return `BTH-KK-${num}`;
}

/* ── Format Date (Indonesian locale) ── */
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

/* ── Read harvests from localStorage ── */
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

/* ── Save a harvest record to localStorage ── */
export function saveHarvest(record: HarvestRecord): void {
  if (typeof window === "undefined") return;
  const existing = getHarvests();
  existing.unshift(record); // newest first
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}
