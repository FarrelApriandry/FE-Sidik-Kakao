import { useState, useRef, useCallback } from "react";
import MaterialIcon from "../ui/MaterialIcon";
import { MOCK_GRADE_PRICES } from "../../data/mock";
import type { BeanCategory, CacaoGrade, AiAnalysisResult } from "../../types";
import {
  generateBatchId,
  formatDateId,
  saveHarvest,
  type HarvestRecord,
} from "../../utils/storage";
import { QrCodeSvg } from "../../utils/qr";

/* ── Category Config ── */
const CATEGORIES: { key: BeanCategory; label: string; icon: string }[] = [
  { key: "basah", label: "Basah", icon: "water_drop" },
  { key: "fermentasi", label: "Fermentasi", icon: "science" },
  { key: "kering", label: "Kering", icon: "dry" },
];

/* ── AI Simulation ── */
function simulateAiAnalysis(weightKg: string): AiAnalysisResult {
  const weight = parseFloat(weightKg) || 0;
  const isGradeA = weight > 50 || Math.random() > 0.3;
  return {
    grade: isGradeA ? "A" : "B",
    gradeLabel: isGradeA ? "Grade A (SNI)" : "Grade B",
    fungalStatus: "Bebas Jamur",
    hasFungalRisk: false,
    confidence: isGradeA ? 94 : 87,
  };
}

/* ── Format Rupiah ── */
function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

/* ── Main Component ── */
export default function CatatForm() {
  const [weightKg, setWeightKg] = useState("");
  const [category, setCategory] = useState<BeanCategory>("basah");
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AiAnalysisResult | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [savedRecord, setSavedRecord] = useState<HarvestRecord | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Valuation (reactive) */
  const parsedWeight = parseFloat(weightKg) || 0;
  const priceEntry = MOCK_GRADE_PRICES.find(
    (p) => p.grade === aiResult?.grade && p.category === category
  );
  const pricePerKg = priceEntry?.pricePerKg ?? 0;
  const estimatedTotal = parsedWeight * pricePerKg;

  /* Camera capture handler */
  const handlePhotoCapture = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoDataUrl(reader.result as string);
        setIsAnalyzing(true);
        setAiResult(null);
        setTimeout(() => {
          setAiResult(simulateAiAnalysis(weightKg));
          setIsAnalyzing(false);
        }, 2000);
      };
      reader.readAsDataURL(file);
    },
    [weightKg]
  );

  /* Submit handler */
  const handleSubmit = () => {
    if (navigator.vibrate) navigator.vibrate(50);

    const now = new Date();
    const grade = aiResult?.grade ?? "A";
    const batchId = generateBatchId();

    const record: HarvestRecord = {
      id: batchId,
      farmerName: "Budi Santoso",
      date: now.toISOString(),
      dateFormatted: formatDateId(now),
      weightKg: parsedWeight,
      category,
      grade,
      gradeLabel: grade === "A" ? "Grade A (SNI)" : "Grade B",
      fungalStatus: aiResult?.fungalStatus ?? "Bebas Jamur",
      totalValue: estimatedTotal,
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
    setShowQrModal(true);
  };

  return (
    <div className="w-full max-w-[430px] mx-auto min-h-screen bg-slate-50 flex flex-col">
      <CatatHeader />

      <main className="flex-1 overflow-y-auto pb-8 px-4 pt-4 space-y-6">
        <StepIndicator
          currentStep={aiResult ? 3 : photoDataUrl ? 2 : parsedWeight > 0 ? 1 : 1}
        />

        {/* Step 1: Input Data */}
        <section className="space-y-4">
          <SectionHeader step={1} title="Data Panen" icon="edit_note" />
          <WeightInput value={weightKg} onChange={setWeightKg} />
          <CategorySelector selected={category} onSelect={setCategory} />
        </section>

        {/* Step 2: Foto & AI */}
        <section className="space-y-4">
          <SectionHeader step={2} title="Foto & Analisis AI" icon="photo_camera" />
          <PhotoCapture
            photoDataUrl={photoDataUrl}
            onCaptureClick={() => fileInputRef.current?.click()}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoCapture}
            className="hidden"
          />
          {isAnalyzing && <AiAnalysisSkeleton />}
          {aiResult && !isAnalyzing && <AiAnalysisCard result={aiResult} />}
        </section>

        {/* Step 3: Valuation & Submit */}
        <section className="space-y-4">
          <SectionHeader step={3} title="Valuasi & Simpan" icon="payments" />
          <ValuationCard
            weight={parsedWeight}
            pricePerKg={pricePerKg}
            grade={aiResult?.grade ?? null}
            category={category}
            total={estimatedTotal}
          />
          <button
            onClick={handleSubmit}
            disabled={!aiResult || parsedWeight <= 0}
            className="w-full h-14 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-display font-bold text-base rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2.5"
          >
            <MaterialIcon name="save" size={22} className="text-white" />
            Simpan & Generate QR Label
          </button>
          {(!aiResult || parsedWeight <= 0) && (
            <p className="text-center text-xs text-slate-400">
              Isi berat panen & lakukan analisis AI terlebih dahulu
            </p>
          )}
        </section>
      </main>

      {showQrModal && savedRecord && (
        <QrModal
          record={savedRecord}
          onClose={() => setShowQrModal(false)}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   Sub-Components
   ══════════════════════════════════════════════ */

/* ── Catat Header ── */
function CatatHeader() {
  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 flex items-center gap-3">
      <a
        href="/petani"
        className="h-9 w-9 -ml-1 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
      >
        <MaterialIcon name="arrow_back" size={22} />
      </a>
      <div className="flex-1">
        <h1 className="font-display font-bold text-base text-slate-900 tracking-tight">
          Catat Hasil Panen Baru
        </h1>
        <p className="text-[11px] text-slate-500 mt-0.5">Input data panen & analisis kualitas</p>
      </div>
      <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        Online
      </span>
    </header>
  );
}

/* ── Step Indicator ── */
function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = [
    { num: 1, label: "Data" },
    { num: 2, label: "Foto" },
    { num: 3, label: "Valuasi" },
  ];

  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((step, i) => {
        const isActive = step.num <= currentStep;
        return (
          <div key={step.num} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isActive
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              <span className="h-4 w-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                {step.num}
              </span>
              {step.label}
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-px w-4 ${
                  step.num < currentStep ? "bg-brand-600" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Section Header ── */
function SectionHeader({
  step,
  title,
  icon,
}: {
  step: number;
  title: string;
  icon: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-8 w-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
        <MaterialIcon name={icon} size={18} />
      </div>
      <div>
        <span className="text-[11px] font-semibold text-brand-600 uppercase tracking-wider">
          Step {step}
        </span>
        <h2 className="font-display font-bold text-sm text-slate-900">{title}</h2>
      </div>
    </div>
  );
}

/* ── Weight Input ── */
function WeightInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-3">
        Berat Panen
      </label>
      <div className="flex items-baseline gap-2">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          min="0"
          step="0.1"
          className="flex-1 text-5xl font-display font-bold text-slate-900 bg-transparent border-none outline-none placeholder:text-slate-200 w-full"
          style={{ MozAppearance: "textfield" }}
        />
        <span className="text-2xl font-display font-bold text-slate-400">Kg</span>
      </div>
      <div className="mt-3 h-px bg-slate-100" />
      <p className="text-[11px] text-slate-400 mt-2">
        Masukkan berat hasil panen dalam kilogram
      </p>
    </div>
  );
}

/* ── Category Selector ── */
function CategorySelector({
  selected,
  onSelect,
}: {
  selected: BeanCategory;
  onSelect: (c: BeanCategory) => void;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2.5">
        Kategori Biji
      </label>
      <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => onSelect(cat.key)}
            className={`flex-1 py-2.5 px-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
              selected === cat.key
                ? "bg-cacao-500 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <MaterialIcon
              name={cat.icon}
              size={16}
              className={selected === cat.key ? "text-white" : "text-slate-400"}
            />
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Photo Capture ── */
function PhotoCapture({
  photoDataUrl,
  onCaptureClick,
}: {
  photoDataUrl: string | null;
  onCaptureClick: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="relative bg-white rounded-2xl border-2 border-dashed border-slate-200 overflow-hidden aspect-[4/3] flex items-center justify-center">
        {photoDataUrl ? (
          <img
            src={photoDataUrl}
            alt="Foto sampel kakao"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center">
              <MaterialIcon name="photo_camera" size={28} className="text-slate-300" />
            </div>
            <span className="text-xs font-medium">Belum ada foto</span>
          </div>
        )}
      </div>

      <button
        onClick={onCaptureClick}
        className="w-full h-12 bg-white border-2 border-brand-600 text-brand-700 font-semibold text-sm rounded-2xl hover:bg-brand-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-xs"
      >
        <MaterialIcon name="photo_camera" size={20} className="text-brand-600" />
        {photoDataUrl ? "Ambil Ulang Foto" : "Ambil Foto Sampel Kakao"}
      </button>
    </div>
  );
}

/* ── AI Analysis Skeleton (loading) ── */
function AiAnalysisSkeleton() {
  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 shadow-xs animate-pulse">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-8 w-8 rounded-xl bg-emerald-200" />
        <div className="h-3 w-32 rounded bg-emerald-200" />
      </div>
      <div className="space-y-2.5">
        <div className="h-4 w-48 rounded bg-emerald-200" />
        <div className="h-4 w-36 rounded bg-emerald-200" />
        <div className="h-2 w-full rounded-full bg-emerald-200 mt-2" />
      </div>
    </div>
  );
}

/* ── AI Analysis Card ── */
function AiAnalysisCard({ result }: { result: AiAnalysisResult }) {
  const gradeColor =
    result.grade === "A"
      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
      : "bg-amber-100 text-amber-800 border-amber-300";
  const fungalColor = result.hasFungalRisk
    ? "bg-red-100 text-red-800 border-red-300"
    : "bg-emerald-100 text-emerald-800 border-emerald-300";

  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 shadow-xs space-y-3">
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
          <MaterialIcon name="psychology" size={18} />
        </div>
        <div>
          <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
            AI SIDIK
          </span>
          <span className="block text-[11px] text-emerald-700">Hasil Analisis Komputer</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-emerald-800">Grade Terdeteksi</span>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${gradeColor}`}
          >
            <MaterialIcon
              name={result.grade === "A" ? "verified" : "info"}
              size={14}
            />
            {result.gradeLabel}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-emerald-800">Status Jamur</span>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${fungalColor}`}
          >
            <MaterialIcon
              name={result.hasFungalRisk ? "warning" : "check_circle"}
              size={14}
            />
            {result.fungalStatus}
          </span>
        </div>

        <div className="pt-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-emerald-800">Confidence</span>
            <span className="text-xs font-bold text-emerald-900">{result.confidence}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-emerald-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all duration-700 ease-out"
              style={{ width: `${result.confidence}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Valuation Card ── */
function ValuationCard({
  weight,
  pricePerKg,
  grade,
  category,
  total,
}: {
  weight: number;
  pricePerKg: number;
  grade: CacaoGrade | null;
  category: BeanCategory;
  total: number;
}) {
  const categoryLabels: Record<BeanCategory, string> = {
    basah: "Basah",
    fermentasi: "Fermentasi",
    kering: "Kering",
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-lg bg-amber-50 text-cacao-500 flex items-center justify-center">
          <MaterialIcon name="calculate" size={16} />
        </div>
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Estimasi Nilai Panen
        </span>
      </div>

      <div className="bg-slate-50 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Berat</span>
          <span className="font-semibold text-slate-800">
            {weight > 0 ? `${weight} Kg` : "—"}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Kategori</span>
          <span className="font-semibold text-slate-800">{categoryLabels[category]}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Harga/Kg {grade ? `(${grade})` : ""}</span>
          <span className="font-semibold text-slate-800">
            {pricePerKg > 0 ? `Rp ${pricePerKg.toLocaleString("id-ID")}` : "—"}
          </span>
        </div>
      </div>

      <div className="text-center pt-2 border-t border-slate-100">
        <p className="text-[11px] text-slate-500 mb-1">Total Estimasi</p>
        <p className="font-display font-bold text-3xl text-slate-900 tracking-tight">
          {total > 0 ? `Rp ${total.toLocaleString("id-ID")}` : "Rp 0"}
        </p>
        {total > 0 && (
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            ✓ Harga pasar lokal Sulawesi
          </p>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   QR Code Label Modal
   ══════════════════════════════════════════════ */

function QrModal({
  record,
  onClose,
}: {
  record: HarvestRecord;
  onClose: () => void;
}) {
  const gradeBadgeClass =
    record.grade === "A"
      ? "bg-emerald-100 text-emerald-800"
      : "bg-amber-100 text-amber-800";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "modalSlideUp 0.3s ease-out" }}
      >
        {/* Header */}
        <div className="bg-emerald-50 px-6 pt-6 pb-4 text-center">
          <div className="h-14 w-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
            <MaterialIcon name="check_circle" size={32} />
          </div>
          <h2 className="font-display font-bold text-lg text-emerald-900 mt-3">
            Panen Berhasil Dicatat!
          </h2>
          <p className="text-xs text-emerald-700 mt-1">
            Label QR Batch telah digenerate
          </p>
        </div>

        {/* QR Display */}
        <div className="px-6 py-5 flex flex-col items-center">
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 shadow-xs">
            <QrCodeSvg payload={record.qrPayload} />
          </div>
          <p className="font-mono font-bold text-sm text-slate-600 mt-3 tracking-wide">
            {record.id}
          </p>
        </div>

        {/* Batch Summary Sheet */}
        <div className="mx-6 mb-4 bg-slate-50 rounded-xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">ID Batch</span>
            <span className="text-sm font-mono font-bold text-slate-800">
              {record.id}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Total Berat &amp; Grade</span>
            <span className="text-sm font-semibold text-slate-800">
              {record.weightKg} Kg{" "}
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${gradeBadgeClass}`}
              >
                {record.gradeLabel}
              </span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Nilai Panen</span>
            <span className="text-sm font-bold text-slate-900">
              Rp {record.totalValue.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Waktu Input</span>
            <span className="text-sm font-medium text-slate-700">
              {record.dateFormatted}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-6 space-y-2.5">
          <button
            onClick={handlePrint}
            className="w-full h-12 bg-brand-600 hover:bg-brand-700 text-white font-display font-bold text-sm rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <MaterialIcon name="print" size={20} className="text-white" />
            Cetak Label QR
          </button>
          <button
            onClick={() => { window.location.href = "/petani"; }}
            className="w-full h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            Selesai &amp; Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>
  );
}