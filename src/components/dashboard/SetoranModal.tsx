import { useState, useEffect, useRef } from "react";
import MaterialIcon from "../ui/MaterialIcon";
import Button from "../ui/Button";
import type { CacaoGrade, BeanCategory, GradePriceEntry } from "../../types";
import {
  generateBatchId,
  formatDateId,
  saveHarvest,
  fetchGradePrices,
  type HarvestRecord,
} from "../../utils/storage";
import { getCurrentUser } from "../../lib/supabase";
import { fetchFarmerOptions } from "../../lib/dashboard-queries";
import { QrCodeSvg } from "../../utils/qr";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function SetoranModal({ isOpen, onClose, onSave }: Props) {
  const [selectedFarmerId, setSelectedFarmerId] = useState("");
  const [selectedFarmerName, setSelectedFarmerName] = useState("");
  const [farmerOptions, setFarmerOptions] = useState<{ id: string; fullName: string }[]>([]);
  const [weightKg, setWeightKg] = useState("");
  const [moisturePct, setMoisturePct] = useState("");
  const [category, setCategory] = useState<BeanCategory>("kering");
  const [grade, setGrade] = useState<CacaoGrade>("A");
  const [savedRecord, setSavedRecord] = useState<HarvestRecord | null>(null);
  const [gradePrices, setGradePrices] = useState<GradePriceEntry[]>([]);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    fetchGradePrices().then(setGradePrices);
    getCurrentUser().then((user) => {
      if (user?.poktanId) fetchFarmerOptions(user.poktanId).then(setFarmerOptions);
    });
  }, [isOpen]);

  if (!isOpen) return null;

  const parsedWeight = parseFloat(weightKg) || 0;
  const parsedMoisture = parseFloat(moisturePct) || 0;
  const isMoistureHigh = parsedMoisture > 8.5;

  const priceEntry = gradePrices.find(
    (p) => p.grade === grade && p.category === category
  );
  const pricePerKg = priceEntry?.pricePerKg ?? (grade === "A" ? 55000 : 40000);
  const totalValue = parsedWeight * pricePerKg;

  const canSubmit =
    selectedFarmerId !== "" && parsedWeight > 0 && parsedMoisture > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const now = new Date();
    const batchId = generateBatchId();
    const currentUser = await getCurrentUser();

    const record: HarvestRecord = {
      id: batchId,
      farmerId: selectedFarmerId,
      farmerName: selectedFarmerName,
      poktanId: currentUser?.poktanId,
      date: now.toISOString(),
      dateFormatted: formatDateId(now),
      weightKg: parsedWeight,
      moisturePct: parsedMoisture,
      category,
      grade,
      gradeLabel: grade === "A" ? "Grade A (SNI)" : "Grade B Fermentasi",
      fungalStatus: "Bebas Jamur",
      totalValue,
      pricePerKg,
      status: isMoistureHigh ? "Proses Curing" : (grade === "A" ? "Terverifikasi" : "Proses Curing"),
      qrPayload: JSON.stringify({
        id: batchId,
        farmer: selectedFarmerName,
        farmerId: selectedFarmerId,
        weightKg: parsedWeight,
        grade,
        timestamp: now.toISOString(),
      }),
      syncStatus: "pending",
      createdAt: now.toISOString(),
    };

    await saveHarvest(record, selectedFarmerId, currentUser?.poktanId);
    setSavedRecord(record);
    onSave();
  };

  const handleReset = () => {
    setSelectedFarmerId("");
    setSelectedFarmerName("");
    setWeightKg("");
    setMoisturePct("");
    setCategory("kering");
    setGrade("A");
    setSavedRecord(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handlePrint = () => {
    if (printRef.current && savedRecord) {
      printRef.current.innerHTML = `
        <div class="print-label-card">
          <div class="print-qr-container">
            ${printRef.current.querySelector('[data-qr]')?.innerHTML || ''}
          </div>
          <div class="print-batch-id">${savedRecord.id}</div>
          <div class="print-grade">${savedRecord.gradeLabel}</div>
          <div class="print-info-grid">
            <div class="print-info-item">
              <div class="print-info-label">Petani</div>
              <div class="print-info-value">${savedRecord.farmerName}</div>
            </div>
            <div class="print-info-item">
              <div class="print-info-label">Berat</div>
              <div class="print-info-value">${savedRecord.weightKg} Kg</div>
            </div>
            <div class="print-info-item">
              <div class="print-info-label">Tanggal</div>
              <div class="print-info-value">${savedRecord.dateFormatted}</div>
            </div>
            <div class="print-info-item">
              <div class="print-info-label">Grade</div>
              <div class="print-info-value">${savedRecord.grade}</div>
            </div>
          </div>
        </div>
      `;
    }
    window.print();
  };

  return (
    <>
      <div className="print-only" ref={printRef}></div>

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
                    value={selectedFarmerId}
                    onChange={(e) => {
                      const f = farmerOptions.find((o) => o.id === e.target.value);
                      setSelectedFarmerId(e.target.value);
                      setSelectedFarmerName(f?.fullName || "");
                    }}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600 transition-all appearance-none"
                  >
                    <option value="">Pilih nama petani...</option>
                    {farmerOptions.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">
                    Kategori Biji Kakao
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { key: "kering", label: "Kering" },
                        { key: "fermentasi", label: "Fermentasi" },
                        { key: "basah", label: "Basah" },
                      ] as { key: BeanCategory; label: string }[]
                    ).map((c) => (
                      <button
                        key={c.key}
                        type="button"
                        onClick={() => setCategory(c.key)}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                          category === c.key
                            ? "border-brand-600 bg-brand-50 text-brand-700"
                            : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
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
                      Kadar air {parsedMoisture}% melebihi ambang 8.5% — status otomatis menjadi 'Proses Curing'.
                    </p>
                  </div>
                )}

                {/* Grade Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">
                    Grade Mutu
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {(["A", "B"] as CacaoGrade[]).map((g) => {
                      const gEntry = gradePrices.find(
                        (p) => p.grade === g && p.category === category
                      );
                      const gPrice = gEntry?.pricePerKg ?? (g === "A" ? 55000 : 40000);
                      return (
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
                              Rp {gPrice.toLocaleString("id-ID")}/Kg
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Valuation Summary */}
                {parsedWeight > 0 && (
                  <div className="p-4 rounded-xl bg-brand-50/60 border border-brand-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-brand-800 font-semibold">Estimasi Total Valuasi</p>
                      <p className="text-xs text-brand-600">
                        {parsedWeight} Kg × Rp {pricePerKg.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <p className="font-display font-bold text-lg text-brand-800">
                      Rp {totalValue.toLocaleString("id-ID")}
                    </p>
                  </div>
                )}

                {/* Submit Action */}
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="secondary"
                    size="md"
                    className="flex-1"
                    onClick={handleClose}
                  >
                    Batal
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    className="flex-1"
                    disabled={!canSubmit}
                    onClick={handleSubmit}
                  >
                    Simpan Setoran
                  </Button>
                </div>
              </div>
            ) : (
              /* Success / Label State */
              <div className="space-y-5 text-center py-2">
                <div className="inline-flex p-3 bg-white rounded-2xl border border-slate-200 shadow-sm" data-qr>
                  <QrCodeSvg payload={savedRecord.qrPayload} />
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-left space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">ID Batch</span>
                    <span className="font-mono font-bold text-brand-700">{savedRecord.id}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Petani</span>
                    <span className="font-semibold text-slate-800">{savedRecord.farmerName}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Kategori & Berat</span>
                    <span className="font-semibold text-slate-800">
                      {savedRecord.category} • {savedRecord.weightKg} Kg
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Grade Mutu</span>
                    <span className="font-semibold text-slate-800">{savedRecord.gradeLabel}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200">
                    <span className="text-slate-500 font-semibold">Total Nilai</span>
                    <span className="font-bold text-brand-700 text-sm">
                      Rp {savedRecord.totalValue.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    size="md"
                    className="flex-1"
                    onClick={handleClose}
                  >
                    Selesai
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    className="flex-1"
                    icon="print"
                    onClick={handlePrint}
                  >
                    Cetak Label QR
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
