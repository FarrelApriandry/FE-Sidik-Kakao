import { useState, useEffect } from "react";
import PageHeader from "./PageHeader";
import MaterialIcon from "../ui/MaterialIcon";
import Button from "../ui/Button";
import { getCurrentUser } from "../../lib/supabase";
import { fetchFarmersWithDeposits } from "../../lib/dashboard-queries";
import type { FarmerWithDeposit } from "../../types";

export default function PetaniContent() {
  const [farmers, setFarmers] = useState<FarmerWithDeposit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const user = await getCurrentUser();
      if (!user?.poktanId) { setLoading(false); return; }
      try {
        const data = await fetchFarmersWithDeposits(user.poktanId);
        setFarmers(data);
      } catch (e) {
        console.error("Failed to load farmers:", e);
      }
      setLoading(false);
    }
    load();
  }, []);
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
              {farmers.length} petani terdaftar
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
              {farmers.map((farmer) => (
                <tr
                  key={farmer.id}
                  className="hover:bg-slate-50/80 transition-colors border-t border-slate-100"
                >
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {farmer.fullName}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-sm text-slate-600">
                    {farmer.id.slice(0, 8)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {farmer.estateAreaHa != null ? `${farmer.estateAreaHa} Ha` : "-"}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {farmer.totalDepositKg.toLocaleString("id-ID")} Kg
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        farmer.totalDepositKg > 0
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <MaterialIcon
                        name={farmer.totalDepositKg > 0 ? "check_circle" : "cancel"}
                        size={13}
                      />
                      {farmer.totalDepositKg > 0 ? "Aktif" : "Non-Aktif"}
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
