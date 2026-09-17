import { useState, useEffect } from "react";
import PageHeader from "./PageHeader";
import MaterialIcon from "../ui/MaterialIcon";
import Button from "../ui/Button";
import { getCurrentUser } from "../../lib/supabase";
import { fetchRekapSummary, fetchMonthlyRekap } from "../../lib/dashboard-queries";
import type { RekapSummary, MonthlyRekapRow } from "../../types";

export default function RekapContent() {
  const [summary, setSummary] = useState<RekapSummary | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyRekapRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const user = await getCurrentUser();
      if (!user?.poktanId) { setLoading(false); return; }
      try {
        const [sum, monthly] = await Promise.all([
          fetchRekapSummary(user.poktanId),
          fetchMonthlyRekap(user.poktanId),
        ]);
        setSummary(sum);
        setMonthlyData(monthly);
      } catch (e) {
        console.error("Failed to load rekap:", e);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading || !summary) {
    return (
      <main className="p-4 lg:p-8 space-y-6 w-full mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-16 bg-slate-200 rounded-2xl" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 bg-slate-200 rounded-2xl" />)}
          </div>
          <div className="h-64 bg-slate-200 rounded-2xl" />
        </div>
      </main>
    );
  }

  const summaryCards = [
    { label: "Total Panen", value: (summary.totalKg / 1000).toFixed(1), unit: "Ton", icon: "scale", iconBg: "bg-brand-50 text-brand-600" },
    { label: "Rata-rata/Batch", value: summary.avgPerBatch.toLocaleString("id-ID"), unit: "Kg", icon: "monitoring", iconBg: "bg-slate-100 text-slate-700" },
    { label: "Batch Terverifikasi", value: String(summary.verifiedBatches), unit: "/ " + summary.totalBatches, icon: "verified", iconBg: "bg-emerald-50 text-emerald-600" },
    { label: "Nilai Total", value: "Rp " + (summary.totalValue / 1_000_000).toFixed(0), unit: "Juta", icon: "payments", iconBg: "bg-amber-50 text-cacao-500" },
  ];
  return (
    <main className="p-4 lg:p-8 space-y-6 w-full mx-auto">
      <PageHeader
        title="Rekap Panen"
        subtitle="Rekapitulasi produksi panen kakao per bulan."
        ctaLabel="Export CSV"
        ctaIcon="download"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">{card.label}</span>
              <span className={"p-2 rounded-lg " + card.iconBg}>
                <MaterialIcon name={card.icon} size={18} />
              </span>
            </div>
            <div>
              <span className="font-display font-bold text-2xl text-slate-900">{card.value}</span>
              <span className="text-sm font-medium text-slate-500 ml-1">{card.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Date Range Filter */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-white border border-slate-200/80 px-3 py-2 rounded-xl text-sm">
          <MaterialIcon name="calendar_month" size={18} className="text-slate-400" />
          <span className="text-slate-600 font-medium">Semua Bulan</span>
        </div>
        <Button variant="secondary" size="sm" icon="tune">Atur Rentang</Button>
      </div>

      {/* Monthly Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs">
        <div className="p-4 border-b border-slate-100">
          <h2 className="font-display font-bold text-base text-slate-900">Rekap Bulanan</h2>
          <p className="text-xs text-slate-500 mt-0.5">Data produksi panen per bulan</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/50">
                {["Bulan", "Total Kg", "Jumlah Batch", "Grade A %", "Nilai Total"].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((row) => (
                <tr key={row.monthLabel} className="hover:bg-slate-50/80 transition-colors border-t border-slate-100">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{row.monthLabel}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{row.totalKg.toLocaleString("id-ID")}</td>
                  <td className="py-3.5 px-4 text-slate-600">{row.batches}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">{row.gradeAPct}%</span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{"Rp " + row.value.toLocaleString("id-ID")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
