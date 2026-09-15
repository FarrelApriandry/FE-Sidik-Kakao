import PageHeader from "./PageHeader";
import MaterialIcon from "../ui/MaterialIcon";
import Button from "../ui/Button";

const SUMMARY_CARDS = [
  { label: "Total Panen", value: "12.4", unit: "Ton", icon: "scale", iconBg: "bg-brand-50 text-brand-600" },
  { label: "Rata-rata/Batch", value: "165", unit: "Kg", icon: "monitoring", iconBg: "bg-slate-100 text-slate-700" },
  { label: "Batch Terverifikasi", value: "47", unit: "/ 48", icon: "verified", iconBg: "bg-emerald-50 text-emerald-600" },
  { label: "Nilai Total", value: "Rp 620", unit: "Juta", icon: "payments", iconBg: "bg-amber-50 text-cacao-500" },
];

const MONTHLY_DATA = [
  { month: "Mei 2026", totalKg: "1.000", batches: 8, gradeAPct: "62%", value: "Rp 50.000.000" },
  { month: "Jun 2026", totalKg: "4.000", batches: 24, gradeAPct: "65%", value: "Rp 180.000.000" },
  { month: "Jul 2026", totalKg: "6.000", batches: 36, gradeAPct: "67%", value: "Rp 270.000.000" },
  { month: "Ags 2026", totalKg: "7.500", batches: 42, gradeAPct: "64%", value: "Rp 337.500.000" },
  { month: "Sep 2026", totalKg: "9.500", batches: 48, gradeAPct: "68%", value: "Rp 475.000.000" },
  { month: "Okt 2026", totalKg: "12.400", batches: 48, gradeAPct: "68%", value: "Rp 620.000.000" },
];

export default function RekapContent() {
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
        {SUMMARY_CARDS.map((card) => (
          <div
            key={card.label}
            className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">{card.label}</span>
              <span className={`p-2 rounded-lg ${card.iconBg}`}>
                <MaterialIcon name={card.icon} size={18} />
              </span>
            </div>
            <div>
              <span className="font-display font-bold text-2xl text-slate-900">
                {card.value}
              </span>
              <span className="text-sm font-medium text-slate-500 ml-1">{card.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Date Range Filter */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-white border border-slate-200/80 px-3 py-2 rounded-xl text-sm">
          <MaterialIcon name="calendar_month" size={18} className="text-slate-400" />
          <span className="text-slate-600 font-medium">Mei – Okt 2026</span>
        </div>
        <Button variant="secondary" size="sm" icon="tune">
          Atur Rentang
        </Button>
      </div>

      {/* Monthly Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs">
        <div className="p-4 border-b border-slate-100">
          <h2 className="font-display font-bold text-base text-slate-900">
            Rekap Bulanan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Data produksi panen per bulan musim utama
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/50">
                {["Bulan", "Total Kg", "Jumlah Batch", "Grade A %", "Nilai Total"].map(
                  (header) => (
                    <th
                      key={header}
                      className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {MONTHLY_DATA.map((row) => (
                <tr
                  key={row.month}
                  className="hover:bg-slate-50/80 transition-colors border-t border-slate-100"
                >
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {row.month}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {row.totalKg}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{row.batches}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                      {row.gradeAPct}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
