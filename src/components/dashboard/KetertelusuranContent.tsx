import PageHeader from "./PageHeader";
import MaterialIcon from "../ui/MaterialIcon";
import { useState } from "react";
import { fetchBatchTrace } from "../../lib/dashboard-queries";
import type { BatchTraceDetail } from "../../types";

interface Step {
  label: string;
  icon: string;
  status: "completed" | "active" | "pending";
  timestamp?: string;
  location?: string;
}

const connectorColor: Record<string, string> = {
  completed: "bg-brand-500",
  active: "bg-amber-400",
  pending: "bg-slate-200",
};
const nodeColor: Record<string, string> = {
  completed: "bg-brand-600 text-white",
  active: "bg-amber-500 text-white animate-pulse",
  pending: "bg-slate-100 text-slate-400 border border-slate-200",
};

function buildSteps(batch: BatchTraceDetail): Step[] {
  const created = new Date(batch.createdAt);
  const dateStr = created.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr = created.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  const isVerified = batch.status === "Terverifikasi";
  const fermentEnd = new Date(created);
  fermentEnd.setDate(fermentEnd.getDate() + 3);
  const ferDateStr = fermentEnd.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });

  return [
    { label: "Kebun (Panen)", icon: "agriculture", status: "completed", timestamp: dateStr + ", " + timeStr, location: "Kebun " + batch.farmerName },
    { label: "Pos Poktan (Timbang)", icon: "warehouse", status: "completed", timestamp: dateStr + ", " + timeStr, location: batch.poktanName + " \u2014 " + batch.poktanLocation },
    { label: "Pengeringan (Fermentasi)", icon: "wb_sunny", status: isVerified ? "completed" : "active", timestamp: dateStr + "\u2013" + ferDateStr, location: batch.poktanName },
    { label: "Gudang Ekspor", icon: "local_shipping", status: isVerified ? "completed" : "pending", timestamp: isVerified ? ferDateStr : "\u2014", location: "Gudang Ekspor" },
  ];
}

export default function KetertelusuranContent() {
  const [batchId, setBatchId] = useState("");
  const [batch, setBatch] = useState<BatchTraceDetail | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!batchId.trim()) return;
    setSearching(true);
    setSearchError(null);
    setBatch(null);
    try {
      const result = await fetchBatchTrace(batchId.trim());
      setBatch(result);
      if (!result) setSearchError("Batch tidak ditemukan. Periksa ID batch.");
    } catch (e) {
      setSearchError(e instanceof Error ? e.message : "Gagal mencari batch");
    }
    setSearching(false);
  };

  const steps = batch ? buildSteps(batch) : [];

  return (
    <main className="p-4 lg:p-8 space-y-6 w-full mx-auto">
      <PageHeader
        title="Ketertelusuran"
        subtitle="Lacak perjalanan kakao dari kebun hingga gudang ekspor."
      />

      {/* QR Batch Lookup */}
      <div className="bg-white border border-slate-200/80 p-5 rounded-xl shadow-xs">
        <h2 className="font-display font-bold text-base text-slate-900 mb-1">Cari Batch (QR Lookup)</h2>
        <p className="text-xs text-slate-500 mb-4">
          Masukkan ID batch atau scan QR code untuk melihat detail perjalanan produk.
        </p>
        <div className="flex gap-3 flex-col sm:flex-row">
          <div className="relative flex-1">
            <MaterialIcon name="qr_code_scanner" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Masukkan Batch ID (UUID)"
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-100 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600/30 transition-all"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={searching}
            className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-all shadow-sm disabled:opacity-50"
          >
            <MaterialIcon name="search" size={18} />
            {searching ? "Mencari..." : "Lacak"}
          </button>
        </div>
        {searchError && <p className="text-sm text-red-600 mt-3">{searchError}</p>}
      </div>

      {/* Supply Chain Timeline */}
      {batch && (
        <div className="bg-white border border-slate-200/80 p-5 rounded-xl shadow-xs">
          <div className="flex items-center gap-2 mb-6">
            <span className="p-2 rounded-lg bg-brand-50 text-brand-600">
              <MaterialIcon name="route" size={18} />
            </span>
            <div>
              <h2 className="font-display font-bold text-base text-slate-900">Alur Rantai Pasok</h2>
              <p className="text-xs text-slate-500">
                Batch: <span className="font-mono font-bold text-brand-700">{batch.id.slice(0, 12)}</span>
                {" \u2014 "}<span className="font-semibold text-slate-700">{batch.farmerName}</span>
                {" \u2014 "}<span className="text-slate-600">{batch.weightKg} Kg \u2022 Grade {batch.grade}</span>
              </p>
            </div>
          </div>
          <div className="relative ml-4">
            {steps.map((step, i) => {
              const isLast = i === steps.length - 1;
              return (
                <div key={step.label} className="relative flex gap-4 pb-8 last:pb-0">
                  {!isLast && (
                    <div className={"absolute left-[15px] top-[34px] w-[2px] h-[calc(100%-20px)] " + connectorColor[step.status]} />
                  )}
                  <div className={"relative z-10 h-8 w-8 rounded-full flex items-center justify-center shrink-0 " + nodeColor[step.status]}>
                    <MaterialIcon name={step.icon} size={18} />
                  </div>
                  <div className="pt-0.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={"font-semibold text-sm " + (step.status === "pending" ? "text-slate-400" : "text-slate-900")}>{step.label}</span>
                      {step.status === "completed" && (
                        <span className="inline-flex items-center gap-0.5 text-[11px] font-bold bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded-full">
                          <MaterialIcon name="check" size={12} /> Selesai
                        </span>
                      )}
                      {step.status === "active" && (
                        <span className="inline-flex items-center gap-0.5 text-[11px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                          <MaterialIcon name="hourglass_top" size={12} /> Dalam Proses
                        </span>
                      )}
                      {step.status === "pending" && (
                        <span className="inline-flex text-[11px] font-semibold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">Menunggu</span>
                      )}
                    </div>
                    <p className={"text-xs mt-0.5 " + (step.status === "pending" ? "text-slate-300" : "text-slate-500")}>{step.location}</p>
                    <p className={"text-[11px] font-mono mt-0.5 " + (step.status === "pending" ? "text-slate-300" : "text-slate-400")}>{step.timestamp}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}
