import { useState, useEffect, useRef } from "react";
import MaterialIcon from "../ui/MaterialIcon";
import Button from "../ui/Button";
import StatusBadge from "./StatusBadge";
import { QrCodeSvg } from "../../utils/qr";
import { fetchGradePrices } from "../../utils/storage";
import { verifyHarvestBatch } from "../../lib/dashboard-queries";
import type { HarvestBatch, GradePriceEntry, CacaoGrade } from "../../types";

interface Props {
  batch: HarvestBatch | null;
  onClose: () => void;
  onUpdated?: () => void;
}

export default function BatchDetailModal({ batch, onClose, onUpdated }: Props) {
  const [gradePrices, setGradePrices] = useState<GradePriceEntry[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [moistureInput, setMoistureInput] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<CacaoGrade>("A");
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchGradePrices().then(setGradePrices);
  }, []);

  useEffect(() => {
    if (batch) {
      const initMoisture = batch.moisturePct ?? (parseFloat(batch.moisture) || 7.5);
      setMoistureInput(String(initMoisture));
      setSelectedGrade(batch.grade === "B" ? "B" : "A");
      setVerifiedSuccess(false);
    }
  }, [batch]);

  if (!batch) return null;

  const weightNum = parseFloat(batch.weight) || 0;
  const priceEntry = gradePrices.find((p) => p.grade === batch.grade && p.category === "kering");
  const pricePerKg = priceEntry?.pricePerKg ?? (batch.grade === "A" ? 55000 : 40000);
  const valuationTotal = weightNum * pricePerKg;

  const moistureNum = parseFloat(moistureInput) || (batch.moisturePct ?? (parseFloat(batch.moisture) || 0));
  const isMoistureHigh = moistureNum > 8.5;

  const qrPayload = JSON.stringify({
    id: batch.id,
    farmer: batch.farmerName,
    weight: batch.weight,
    grade: selectedGrade,
    ts: batch.timestamp,
  });

  const handlePrint = () => {
    if (printRef.current) {
      printRef.current.innerHTML = `
        <div class="print-label-card">
          <div class="print-qr-container">
            ${printRef.current.querySelector('[data-qr]')?.innerHTML || ''}
          </div>
          <div class="print-batch-id">${batch.id}</div>
          <div class="print-grade">Grade ${selectedGrade}</div>
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
              <div class="print-info-value">${selectedGrade}</div>
            </div>
          </div>
        </div>
      `;
    }
    window.print();
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      await verifyHarvestBatch(batch.id, {
        moisturePct: moistureNum,
        grade: selectedGrade,
        status: "Terverifikasi",
      });
      setVerifiedSuccess(true);
      if (onUpdated) onUpdated();
    } catch (e) {
      console.error("Gagal memverifikasi batch:", e);
    } finally {
      setIsVerifying(false);
    }
  };

  const isAlreadyVerified = batch.status === "terverifikasi" || verifiedSuccess;

  return (
    <>
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
                  <StatusBadge status={isAlreadyVerified ? "terverifikasi" : batch.status} />
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Detail & Verifikasi Setoran Panen</p>
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

            {/* Admin Verification Section */}
            <div className="bg-slate-50 rounded-xl border border-slate-200/80 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MaterialIcon name="verified" size={18} className="text-brand-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Panel Verifikasi Poktan
                  </h3>
                </div>
                {verifiedSuccess && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <MaterialIcon name="check_circle" size={14} /> Terverifikasi
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Penyesuaian Kadar Air (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="30"
                    value={moistureInput}
                    onChange={(e) => setMoistureInput(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-600/30"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Konfirmasi Grade
                  </label>
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value as CacaoGrade)}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-600/30"
                  >
                    <option value="A">Grade A (SNI)</option>
                    <option value="B">Grade B Fermentasi</option>
                  </select>
                </div>
              </div>

              {!isAlreadyVerified && (
                <button
                  onClick={handleVerify}
                  disabled={isVerifying}
                  className="w-full h-10 mt-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98]"
                >
                  {isVerifying ? (
                    <>
                      <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Memverifikasi...
                    </>
                  ) : (
                    <>
                      <MaterialIcon name="check_circle" size={16} />
                      Konfirmasi Verifikasi Setoran
                    </>
                  )}
                </button>
              )}
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
                    <p className="text-2xl font-bold text-brand-700">Grade {selectedGrade}</p>
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
