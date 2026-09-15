import PageHeader from "./PageHeader";
import MaterialIcon from "../ui/MaterialIcon";
import Button from "../ui/Button";

const FARMERS = [
  { name: "Ahmad Fauzi", memberId: "P-001", landArea: "2.5 Ha", totalDeposit: "185 Kg", status: "Aktif" },
  { name: "Joko Warsito", memberId: "P-002", landArea: "1.8 Ha", totalDeposit: "210 Kg", status: "Aktif" },
  { name: "Siti Rohmah", memberId: "P-003", landArea: "3.1 Ha", totalDeposit: "95 Kg", status: "Aktif" },
  { name: "Budi Santoso", memberId: "P-004", landArea: "1.2 Ha", totalDeposit: "150 Kg", status: "Non-Aktif" },
  { name: "Dewi Lestari", memberId: "P-005", landArea: "2.0 Ha", totalDeposit: "120 Kg", status: "Aktif" },
  { name: "Rahmat Hidayat", memberId: "P-006", landArea: "1.5 Ha", totalDeposit: "165 Kg", status: "Aktif" },
];

export default function PetaniContent() {
  return (
    <main className="p-4 lg:p-8 space-y-6 w-full mx-auto">
      <PageHeader
        title="Data Petani"
        subtitle="Daftar anggota poktan dan informasi kepemilikan lahan."
        ctaLabel="Tambah Petani"
        ctaIcon="person_add"
      />

      <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs">
        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display font-bold text-base text-slate-900">
              Daftar Anggota Poktan
            </h2>
            <p className="text-xs text-slate-500">
              {FARMERS.length} petani terdaftar
            </p>
          </div>
          <Button variant="secondary" size="sm" icon="filter_list">
            Filter
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/50">
                {["Nama Petani", "No. Anggota", "Luas Lahan", "Total Setoran", "Status"].map(
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
              {FARMERS.map((farmer) => (
                <tr
                  key={farmer.memberId}
                  className="hover:bg-slate-50/80 transition-colors border-t border-slate-100"
                >
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {farmer.name}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-sm text-slate-600">
                    {farmer.memberId}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{farmer.landArea}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {farmer.totalDeposit}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        farmer.status === "Aktif"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <MaterialIcon
                        name={farmer.status === "Aktif" ? "check_circle" : "cancel"}
                        size={13}
                      />
                      {farmer.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
