import { useState } from "react";
import MaterialIcon from "../ui/MaterialIcon";
import Button from "../ui/Button";
import { MOCK_GRADE_PRICES } from "../../data/mock";
import type { CacaoGrade } from "../../types";
import {
  generateBatchId,
  formatDateId,
  saveHarvest,
  type HarvestRecord,
} from "../../utils/storage";
import { QrCodeSvg } from "../../utils/qr";

const FARMER_OPTIONS = [
  "Ahmad Fauzi",
  "Joko Warsito",
  "Siti Rohmah",
  "Budi Santoso",
  "Dewi Lestari",
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function SetoranModal({ isOpen, onClose, onSave }: Props) {
  const [farmerName, setFarmerName] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [moisturePct, setMoisturePct] = useState("");
  const [grade, setGrade] = useState<CacaoGrade>("A");
  const [savedRecord, setSavedRecord] = useState<HarvestRecord | null>(null);

  if (!isOpen) return null;

  const parsedWeight = parseFloat(weightKg) || 0;
  const parsedMoisture = parseFloat(moisturePct) || 0;
  const isMoistureHigh = parsedMoisture > 8.5;

  const priceEntry = MOCK_GRADE_PRICES.find(
    (p) => p.grade === grade && p.category === "kering"
  );
  const pricePerKg = priceEntry?.pricePerKg ?? 0;
  const totalValue = parsedWeight * pricePerKg;

  const canSubmit =
    farmerName.trim() !== "" && parsedWeight > 0 && parsedMoisture > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const now = new Date();
    const batchId = generateBatchId();
    const record: HarvestRecord = {
      id: batchId,
      farmerName: farmerName.trim(),
      date: now.toISOString(),
      dateFormatted: formatDateId(now),
      weightKg: parsedWeight,
      moisturePct: parsedMoisture,
      category: "kering",
      grade,
      gradeLabel: grade === "A" ? "Grade A (SNI)" : "Grade B Fermentasi",
      fungalStatus: "Bebas Jamur",
      totalValue,
      pricePerKg,
      status: grade === "A" ? "Terverifikasi" : "Proses Curing",
      qrPayload: JSON.stringify({
        id: batchId,
        weightKg: parsedWeight,
        grade,
        timestamp: now.toISOString(),
      }),
    };
    saveHarvest(record);
    setSavedRecord(record);
    onSave();
  };

  const handleReset = () => {
    setFarmerName("");
    setWeightKg("");
    setMoisturePct("");
    setGrade("A");
    setSavedRecord(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        style={{ animation: "modalSlideUp 0.3s ease-out" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-50 rounded-xl">
              <MaterialIcon name="add_circle" size={22} className="text-brand-600" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-slate-900">
                {savedRecord ? "Setoran Berhasil!" : "Tambah Setoran Panen"}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {savedRecord
                  ? "Label QR telah di-generate"
                  : "Catat setoran panen baru di tingkat poktan"}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <MaterialIcon name="close" size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {!savedRecord ? (
            <div className="space-y-5">
              {/* Farmer Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">
                  Nama Petani
                </label>
                <select
                  value={farmerName}
                  onChange={(e) => setFarmerName(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600 transition-all appearance-none"
                >
                  <option value="">Pilih nama petani...</option>
                  {FARMER_OPTIONS.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              {/* Weight & Moisture */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">
                    Berat (Kg)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="0.0"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">
                    Kadar Air (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    step="0.1"
                    placeholder="0.0"
                    value={moisturePct}
                    onChange={(e) => setMoisturePct(e.target.value)}
                    className={`w-full h-11 px-4 rounded-xl border text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all ${
                      isMoistureHigh
                        ? "border-amber-300 bg-amber-50/50 focus:ring-2 focus:ring-amber-400/30"
                        : "border-slate-200 bg-slate-50 focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600"
                    }`}
                  />
                </div>
              </div>

              {/* Moisture Warning */}
              {isMoistureHigh && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200">
                  <MaterialIcon name="warning" size={18} className="text-amber-600" />
                  <p className="text-xs text-amber-800 font-medium">
                    Kadar air {parsedMoisture}% melebihi ambang 8.5% — perlu jemuran lanjutan.
                  </p>
                </div>
              )}

              {/* Grade Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">
                  Grade Mutu
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(["A", "B"] as CacaoGrade[]).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGrade(g)}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                        grade === g
                          ? "border-brand-600 bg-brand-50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <span
                        className={`inline-block w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          grade === g ? "border-brand-600 bg-brand-600" : "border-slate-300"
                        }`}
                      >
                        {grade === g && <span className="block w-2 h-2 rounded-full bg-white" />}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {g === "A" ? "Grade A (SNI)" : "Grade B Fermentasi"}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {g === "A" ? "Rp 55.000/Kg" : "Rp 40.000/Kg"}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Valuation Preview */}
              {parsedWeight > 0 && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Estimasi Total</span>
                    <span className="font-display font-bold text-lg text-brand-700">
                      Rp {totalValue.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              )}

              {/* Submit */}
              <Button
                variant="primary"
                size="md"
                icon="save"
                onClick={handleSubmit}
                className="w-full h-12 rounded-xl"
              >
                Simpan Setoran & Generate QR
              </Button>

              {!canSubmit && (
                <p className="text-center text-xs text-slate-400 -mt-2">
                  Lengkapi semua field untuk menyimpan
                </p>
              )}
            </div>
          ) : (
            /* ── Success Screen ── */
            <div className="space-y-5 text-center">
              <div className="flex justify-center">
                <div className="p-4 bg-emerald-100 rounded-2xl">
                  <MaterialIcon name="check_circle" size={48} className="text-emerald-600" />
                </div>
              </div>
              <div>
                <p className="font-mono font-bold text-brand-700 text-lg">{savedRecord.id}</p>
                <p className="text-sm text-slate-500 mt-1">
                  {savedRecord.farmerName} &middot; {savedRecord.weightKg} Kg &middot;{" "}
                  {savedRecord.gradeLabel}
                </p>
              </div>
              <div className="inline-block p-4 bg-slate-50 rounded-xl border border-slate-200">
                <QrCodeSvg payload={savedRecord.qrPayload} />
                <p className="text-[10px] font-mono text-slate-400 mt-2 break-all">
                  {savedRecord.qrPayload}
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                icon="print"
                onClick={() => window.print()}
                className="w-full h-12 rounded-xl"
              >
                Cetak Label QR
              </Button>
              <button
                onClick={handleReset}
                className="text-sm text-slate-500 hover:text-brand-700 underline transition-colors"
              >
                + Tambah Setoran Lagi
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

