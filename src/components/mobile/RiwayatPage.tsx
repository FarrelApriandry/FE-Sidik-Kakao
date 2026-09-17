import { useState, useEffect, useMemo } from "react";
import MaterialIcon from "../ui/MaterialIcon";
import SearchInput from "../ui/SearchInput";
import BottomNav from "./BottomNav";
import { QrCodeSvg } from "../../utils/qr";
import { fetchHarvests, type HarvestRecord } from "../../utils/storage";

/* ── Filter Types ── */
type FilterKey = "semua" | "terverifikasi" | "curing" | "gradeA" | "gradeB";

const FILTERS: { key: FilterKey; label: string; icon?: string }[] = [
  { key: "semua", label: "Semua" },
  { key: "terverifikasi", label: "Terverifikasi", icon: "check_circle" },
  { key: "curing", label: "Curing", icon: "hourglass_top" },
  { key: "gradeA", label: "Grade A" },
  { key: "gradeB", label: "Grade B" },
];

/* ── Status Badge ── */
function StatusBadge({ status }: { status: string }) {
  const isVerified = status === "Terverifikasi";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
        isVerified ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"
      }`}
    >
      <MaterialIcon
        name={isVerified ? "check_circle" : "hourglass_top"}
        size={13}
      />
      {isVerified ? "Terverifikasi" : "Proses Curing"}
    </span>
  );
}

/* ── Grade Badge ── */
function GradeBadge({ grade }: { grade: string }) {
  const styles: Record<string, string> = {
    A: "bg-emerald-100 text-emerald-800",
    B: "bg-amber-100 text-amber-900",
  };
  return (
    <span
      className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
        styles[grade] ?? "bg-slate-100 text-slate-700"
      }`}
    >
      Grade {grade}
    </span>
  );
}

/* ── Format Rupiah ── */
function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

/* ══════════════════════════════════════════════
   Main Component
   ══════════════════════════════════════════════ */
export default function RiwayatPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("semua");
  const [records, setRecords] = useState<HarvestRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<HarvestRecord | null>(null);
  const [showModal, setShowModal] = useState(false);

  /* Load data from Supabase + localStorage hybrid */
  useEffect(() => {
    fetchHarvests().then(setRecords);
  }, []);

  /* Filtered + searched records */
  const filteredRecords = useMemo(() => {
    let result = records;

    if (activeFilter !== "semua") {
      result = result.filter((r) => {
        switch (activeFilter) {
          case "terverifikasi": return r.status === "Terverifikasi";
          case "curing": return r.status === "Proses Curing";
          case "gradeA": return r.grade === "A";
          case "gradeB": return r.grade === "B";
          default: return true;
        }
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.dateFormatted.toLowerCase().includes(q) ||
          r.gradeLabel.toLowerCase().includes(q)
      );
    }

    return result;
  }, [records, activeFilter, searchQuery]);

  const openDetail = (record: HarvestRecord) => {
    setSelectedRecord(record);
    setShowModal(true);
  };

  const closeDetail = () => {
    setShowModal(false);
    setSelectedRecord(null);
  };

  return (
    <div className="w-full max-w-[430px] mx-auto min-h-screen bg-slate-50 flex flex-col relative">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 flex items-center gap-3">
        <a
          href="/petani"
          className="h-9 w-9 -ml-1 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <MaterialIcon name="arrow_back" size={22} />
        </a>
        <div className="flex-1">
          <h1 className="font-display font-bold text-base text-slate-900 tracking-tight">
            Riwayat Setoran Panen
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {records.length} record tersimpan
          </p>
        </div>
      </header>

      {/* Search & Filters */}
      <div className="px-4 pt-4 pb-2 space-y-3">
        <SearchInput
          placeholder="Cari ID Batch, tanggal, atau grade..."
          value={searchQuery}
          onChange={setSearchQuery}
        />
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all ${
                activeFilter === f.key
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f.icon && (
                <MaterialIcon
                  name={f.icon}
                  size={14}
                  className={activeFilter === f.key ? "text-white" : "text-slate-400"}
                />
              )}
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Record List */}
      <main className="flex-1 overflow-y-auto px-4 pb-24 space-y-2.5">
        {filteredRecords.length === 0 ? (
          <EmptyState />
        ) : (
          filteredRecords.map((record) => (
            <RecordCard
              key={record.id}
              record={record}
              onTap={() => openDetail(record)}
            />
          ))
        )}
      </main>

      {showModal && selectedRecord && (
        <DetailModal record={selectedRecord} onClose={closeDetail} />
      )}

      <BottomNav activeIndex={2} />
    </div>
  );
}

/* ══════════════════════════════════════════════
   Sub-Components
   ══════════════════════════════════════════════ */

/* ── Record Card ── */
function RecordCard({
  record,
  onTap,
}: {
  record: HarvestRecord;
  onTap: () => void;
}) {
  return (
    <button
      onClick={onTap}
      className="w-full text-left bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs active:scale-[0.99] transition-transform"
    >
      <div className="flex items-center justify-between mb-2.5">
        <span className="font-mono font-bold text-sm text-brand-700">
          {record.id}
        </span>
        <StatusBadge status={record.status} />
      </div>

      <div className="flex items-center gap-1.5 mb-3">
        <MaterialIcon name="schedule" size={14} className="text-slate-400" />
        <span className="text-xs text-slate-500">{record.dateFormatted}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <MaterialIcon name="scale" size={14} className="text-slate-400" />
            <span className="text-sm font-bold text-slate-900">
              {record.weightKg} Kg
            </span>
          </div>
          <GradeBadge grade={record.grade} />
        </div>
        <span className="text-sm font-bold text-slate-900">
          {formatRupiah(record.totalValue)}
        </span>
      </div>
    </button>
  );
}

/* ── Detail Modal ── */
function DetailModal({
  record,
  onClose,
}: {
  record: HarvestRecord;
  onClose: () => void;
}) {
  const gradeBadgeClass =
    record.grade === "A"
      ? "bg-emerald-100 text-emerald-800"
      : "bg-amber-100 text-amber-800";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[430px] sm:max-w-sm bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "modalSlideUp 0.3s ease-out" }}
      >
        {/* Header */}
        <div className="bg-brand-50 px-6 pt-6 pb-4 text-center">
          <div className="h-14 w-14 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-brand-600/30">
            <MaterialIcon name="qr_code_2" size={32} />
          </div>
          <h2 className="font-display font-bold text-lg text-brand-900 mt-3">
            Detail Batch Panen
          </h2>
          <p className="text-xs text-brand-700 mt-1 font-mono font-bold">
            {record.id}
          </p>
        </div>

        {/* QR Display */}
        <div className="px-6 py-5 flex flex-col items-center">
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 shadow-xs">
            <QrCodeSvg payload={record.qrPayload} />
          </div>
          <p className="font-mono font-bold text-sm text-slate-600 mt-3 tracking-wide">
            {record.id}
          </p>
        </div>

        {/* Batch Summary */}
        <div className="mx-6 mb-4 bg-slate-50 rounded-xl p-4 space-y-2.5">
          <SummaryRow label="ID Batch" value={record.id} mono />
          <SummaryRow
            label="Total Berat & Grade"
            value={
              <>
                {record.weightKg} Kg{" "}
                <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${gradeBadgeClass}`}>
                  {record.gradeLabel}
                </span>
              </>
            }
          />
          <SummaryRow label="Nilai Panen" value={formatRupiah(record.totalValue)} bold />
          <SummaryRow label="Waktu Input" value={record.dateFormatted} />
          <SummaryRow label="Status" value={<StatusBadge status={record.status} />} />
          <SummaryRow label="Kadar Air" value={record.fungalStatus} />
        </div>

        {/* Actions */}
        <div className="px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] space-y-2.5">
          <button
            onClick={handlePrint}
            className="w-full h-12 bg-brand-600 hover:bg-brand-700 text-white font-display font-bold text-sm rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <MaterialIcon name="print" size={20} className="text-white" />
            Cetak Ulang Label QR
          </button>
          <button
            onClick={onClose}
            className="w-full h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Summary Row ── */
function SummaryRow({
  label,
  value,
  mono,
  bold,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-500">{label}</span>
      <span
        className={`text-sm ${
          mono ? "font-mono font-bold" : bold ? "font-bold" : "font-medium"
        } text-slate-800`}
      >
        {value}
      </span>
    </div>
  );
}

/* ── Empty State ── */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <MaterialIcon name="inventory_2" size={32} className="text-slate-300" />
      </div>
      <h3 className="font-display font-bold text-sm text-slate-700 mb-1">
        Belum Ada Riwayat
      </h3>
      <p className="text-xs text-slate-400 max-w-[240px]">
        Record panen yang dicatat akan muncul di sini. Mulai catat panen pertama
        Anda!
      </p>
      <a
        href="/petani/catat"
        className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white text-xs font-semibold rounded-xl hover:bg-brand-700 transition-colors"
      >
        <MaterialIcon name="add_circle" size={16} className="text-white" />
        Catat Panen
      </a>
    </div>
  );
}
