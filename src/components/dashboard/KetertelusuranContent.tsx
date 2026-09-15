import PageHeader from "./PageHeader";
import MaterialIcon from "../ui/MaterialIcon";
import { useState } from "react";

interface Step {
  label: string;
  icon: string;
  status: "completed" | "active" | "pending";
  timestamp?: string;
  location?: string;
}

const STEPS: Step[] = [
  { label: "Kebun (Panen)", icon: "agriculture", status: "completed", timestamp: "24 Okt, 08:00", location: "Ladang Pak Ahmad – Desa Rante Alang" },
  { label: "Pos Poktan (Timbang)", icon: "warehouse", status: "completed", timestamp: "24 Okt, 10:30", location: "Gudang Poktan Kakao Utama" },
  { label: "Pengeringan (Fermentasi)", icon: "wb_sunny", status: "active", timestamp: "24–27 Okt", location: "Rak Fermentasi Poktan" },
  { label: "Gudang Ekspor", icon: "local_shipping", status: "pending", timestamp: "—", location: "Gudang Makassar" },
];

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

export default function KetertelusuranContent() {
  const [batchId, setBatchId] = useState("");

  return (
    <main className="p-4 lg:p-8 space-y-6 w-full mx-auto">
      <PageHeader
        title="Ketertelusuran"
        subtitle="Lacak perjalanan kakao dari kebun hingga gudang ekspor."
      />

      {/* QR Batch Lookup */}
      <div className="bg-white border border-slate-200/80 p-5 rounded-xl shadow-xs">
        <h2 className="font-display font-bold text-base text-slate-900 mb-1">
          Cari Batch (QR Lookup)
        </h2>
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
              placeholder="Contoh: BTH-KK-089"
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-100 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600/30 transition-all"
            />
          </div>
          <button className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-all shadow-sm">
            <MaterialIcon name="search" size={18} />
            Lacak
          </button>
        </div>
      </div>

      {/* Supply Chain Timeline */}
      <div className="bg-white border border-slate-200/80 p-5 rounded-xl shadow-xs">
        <div className="flex items-center gap-2 mb-6">
          <span className="p-2 rounded-lg bg-brand-50 text-brand-600">
            <MaterialIcon name="route" size={18} />
          </span>
          <div>
            <h2 className="font-display font-bold text-base text-slate-900">
              Alur Rantai Pasok
            </h2>
            <p className="text-xs text-slate-500">
              Batch: <span className="font-mono font-bold text-brand-700">BTH-KK-089</span>
            </p>
          </div>
        </div>

        <div className="relative ml-4">
          {STEPS.map((step, i) => {
            const isLast = i === STEPS.length - 1;
            return (
              <div key={step.label} className="relative flex gap-4 pb-8 last:pb-0">
                {!isLast && (
                  <div className={`absolute left-[15px] top-[34px] w-[2px] h-[calc(100%-20px)] ${connectorColor[step.status]}`} />
                )}
                <div className={`relative z-10 h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${nodeColor[step.status]}`}>
                  <MaterialIcon name={step.icon} size={18} />
                </div>
                <div className="pt-0.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold text-sm ${step.status === "pending" ? "text-slate-400" : "text-slate-900"}`}>
                      {step.label}
                    </span>
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
                      <span className="inline-flex text-[11px] font-semibold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
                        Menunggu
                      </span>
                    )}
                  </div>
                  <p className={`text-xs mt-0.5 ${step.status === "pending" ? "text-slate-300" : "text-slate-500"}`}>
                    {step.location}
                  </p>
                  <p className={`text-[11px] font-mono mt-0.5 ${step.status === "pending" ? "text-slate-300" : "text-slate-400"}`}>
                    {step.timestamp}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
