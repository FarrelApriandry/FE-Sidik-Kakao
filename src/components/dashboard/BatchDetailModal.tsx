import { useState, useEffect, useRef } from "react";
import MaterialIcon from "../ui/MaterialIcon";
import Button from "../ui/Button";
import StatusBadge from "./StatusBadge";
import { QrCodeSvg } from "../../utils/qr";
import { fetchGradePrices } from "../../utils/storage";
import type { HarvestBatch, GradePriceEntry } from "../../types";

interface Props {
  batch: HarvestBatch | null;
  onClose: () => void;
}

export default function BatchDetailModal({ batch, onClose }: Props) {
  const [gradePrices, setGradePrices] = useState<GradePriceEntry[]>([]);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchGradePrices().then(setGradePrices);
  }, []);

  if (!batch) return null;

  const weightNum = parseFloat(batch.weight) || 0;
  const priceEntry = gradePrices.find((p) => p.grade === batch.grade && p.category === "kering");
  const pricePerKg = priceEntry?.pricePerKg ?? (batch.grade === "A" ? 55000 : 40000);
  const valuationTotal = weightNum * pricePerKg;

  const moistureNum = batch.moisturePct ?? (parseFloat(batch.moisture) || 0);
  const isMoistureHigh = moistureNum > 8.5;

  const qrPayload = JSON.stringify({
    id: batch.id,
    farmer: batch.farmerName,
    weight: batch.weight,
    grade: batch.grade,
    ts: batch.timestamp,
  });

  const handlePrint = () => {
    // Populate the print-only container with label content
    if (printRef.current) {
      printRef.current.innerHTML = `
        <div class="print-label-card">
          <div class="print-qr-container">
            ${printRef.current.querySelector('[data-qr]')?.innerHTML || ''}
          </div>
          <div class="print-batch-id">${batch.id}</div>
          <div class="print-grade">Grade ${batch.grade}</div>
          <div class="print-info-grid">
            <div class="print-info-item">
              <div class="print-info-label">Petani</div>
              <div class="print-info-value">${batch.farmerName}</div>
            </div>
            <div class="print-info-item">
              <div class="print-info-label">Berat</div>
              <div class="print-info-value">${batch.weight}</div>
            </div>
            <div class="print-info-item">
              <div class="print-info-label">Tanggal</div>
              <div class="print-info-value">${batch.timestamp}</div>
            </div>
            <div class="print-info-item">
              <div class="print-info-label">Grade</div>
              <div class="print-info-value">${batch.grade}</div>
            </div>
          </div>
        </div>
      `;
    }
    window.print();
  };

  return (
    <>
      {/* Hidden print-only container */}
      <div className="print-only" ref={printRef}></div>

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        style={{ animation: "modalSlideUp 0.3s ease-out" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-50 rounded-xl">
              <MaterialIcon name="inventory_2" size={22} className="text-brand-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-mono font-bold text-lg text-brand-700">{batch.id}</h2>
                <StatusBadge status={batch.status} />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Detail batch setoran panen</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <MaterialIcon name="close" size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <DetailItem label="Nama Petani" value={batch.farmerName} icon="person" />
            <DetailItem label="Tanggal Setor" value={batch.timestamp} icon="calendar_today" />
            <DetailItem label="Total Berat" value={batch.weight} icon="scale" />
            <DetailItem
              label="Kadar Air"
              value={`${moistureNum}%`}
              icon="water_drop"
              valueClass={isMoistureHigh ? "text-amber-800" : "text-emerald-700"}
              extra={isMoistureHigh ? "Perlu Jemur" : "Optimal"}
              extraClass={isMoistureHigh ? "text-amber-600" : "text-emerald-600"}
            />
            <DetailItem
              label="Total Valuasi"
              value={`Rp ${valuationTotal.toLocaleString("id-ID")}`}
              icon="payments"
              valueClass="text-brand-700"
            />
            <DetailItem label="Lokasi" value="Sukamaju, Luwu" icon="location_on" />
          </div>

          {/* QR Code Preview */}
          <div className="bg-slate-50 rounded-xl border border-slate-100 p-5">
            <div className="flex items-center gap-3 mb-4">
              <MaterialIcon name="qr_code_2" size={18} className="text-brand-600" />
              <h3 className="text-sm font-bold text-slate-900">Label QR Code</h3>
            </div>
            <div className="flex items-center gap-5">
              <div className="shrink-0 p-3 bg-white rounded-lg border border-slate-200" data-qr>
                <QrCodeSvg payload={qrPayload} />
              </div>
              <div className="flex-1 min-w-0 space-y-3">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 mb-1">Grade</p>
                  <p className="text-2xl font-bold text-brand-700">Grade {batch.grade}</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  icon="print"
                  onClick={handlePrint}
                >
                  Cetak Ulang Label
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

/* ── Detail Item Sub-component ── */
function DetailItem({
  label,
  value,
  icon,
  valueClass = "text-slate-900",
  extra,
  extraClass,
}: {
  label: string;
  value: string;
  icon: string;
  valueClass?: string;
  extra?: string;
  extraClass?: string;
}) {
  return (
    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
      <div className="flex items-center gap-1.5 mb-1">
        <MaterialIcon name={icon} size={14} className="text-slate-400" />
        <span className="text-[11px] font-semibold text-slate-500">{label}</span>
      </div>
      <p className={`text-sm font-bold ${valueClass}`}>{value}</p>
      {extra && <p className={`text-[11px] font-medium mt-0.5 ${extraClass}`}>{extra}</p>}
    </div>
  );
}

