import { useState, useEffect } from "react";
import type { HarvestBatch, Grade } from "../../types";
import { getHarvests, type HarvestRecord } from "../../utils/storage";
import SearchInput from "../ui/SearchInput";
import Button from "../ui/Button";
import StatusBadge from "./StatusBadge";

interface Props {
  batches: HarvestBatch[];
}

function GradeBadge({ grade }: { grade: Grade }) {
  const styles: Record<Grade, string> = {
    A: "bg-emerald-100 text-emerald-800",
    B: "bg-amber-100 text-amber-900",
    "Non-Standard": "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${styles[grade]}`}
    >
      Grade {grade}
    </span>
  );
}

export default function HarvestTable({ batches }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [allBatches, setAllBatches] = useState<HarvestBatch[]>(batches);

  useEffect(() => {
    const stored = getHarvests();
    if (stored.length === 0) return;

    const localBatches: HarvestBatch[] = stored.map((r: HarvestRecord) => ({
      id: r.id,
      farmerName: r.farmerName,
      timestamp: r.dateFormatted,
      weight: `${r.weightKg} Kg`,
      grade: r.grade as Grade,
      moisture: "—",
      moistureStatus: "optimal" as const,
      totalValue: `Rp ${r.totalValue.toLocaleString("id-ID")}`,
      status: r.status === "Terverifikasi" ? "terverifikasi" as const : "curing" as const,
      actionLabel: "Cetak Label",
    }));

    // Prepend local entries, filtering out any mock duplicates
    const mockIds = new Set(batches.map((b) => b.id));
    const filtered = localBatches.filter((b) => !mockIds.has(b.id));
    setAllBatches([...filtered, ...batches]);
  }, [batches]);

  const filteredBatches = allBatches.filter((b) =>
    b.farmerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs">
      {/* Filter Bar */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-bold text-base text-slate-900">
            Setoran Panen Terakhir
          </h2>
          <p className="text-xs text-slate-500">
            Data transaksi setoran harian poktan
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SearchInput
            placeholder="Cari nama petani..."
            value={searchQuery}
            onChange={setSearchQuery}
            className="w-48"
          />
          <Button variant="secondary" size="sm" icon="filter_list">
            Filter
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="bg-slate-50/50">
              {[
                "ID Batch",
                "Nama Petani",
                "Waktu Setor",
                "Berat & Mutu",
                "Kadar Air",
                "Total Nilai",
                "Status QR",
                "Aksi",
              ].map((header) => (
                <th
                  key={header}
                  className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredBatches.map((batch) => (
              <tr
                key={batch.id}
                className="hover:bg-slate-50/80 transition-colors border-t border-slate-100"
              >
                {/* ID Batch */}
                <td className="py-3.5 px-4 font-mono font-semibold text-brand-700">
                  {batch.id}
                </td>

                {/* Nama Petani */}
                <td className="py-3.5 px-4 font-semibold text-slate-900">
                  {batch.farmerName}
                </td>

                {/* Waktu Setor */}
                <td className="py-3.5 px-4 text-slate-500">
                  {batch.timestamp}
                </td>

                {/* Berat & Mutu */}
                <td className="py-3.5 px-4">
                  <span className="font-bold text-slate-900">
                    {batch.weight}
                  </span>
                  <GradeBadge grade={batch.grade} />
                </td>

                {/* Kadar Air */}
                <td
                  className={`py-3.5 px-4 font-medium ${
                    batch.moistureStatus === "optimal"
                      ? "text-emerald-700"
                      : "text-amber-800"
                  }`}
                >
                  {batch.moisture}
                </td>

                {/* Total Nilai */}
                <td className="py-3.5 px-4 font-bold text-slate-900">
                  {batch.totalValue}
                </td>

                {/* Status QR */}
                <td className="py-3.5 px-4">
                  <StatusBadge status={batch.status} />
                </td>

                {/* Aksi */}
                <td className="py-3.5 px-4 text-right">
                  {batch.actionLabel === "Cetak Label" ? (
                    <Button variant="primary" size="sm">
                      Cetak Label
                    </Button>
                  ) : (
                    <Button variant="secondary" size="sm">
                      Detail
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
