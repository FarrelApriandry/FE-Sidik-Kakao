import { useState, useEffect } from "react";
import MaterialIcon from "../ui/MaterialIcon";
import Button from "../ui/Button";
import { getSupabase } from "../../lib/supabase";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TambahPetaniModal({ isOpen, onClose, onSuccess }: Props) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [estateAreaHa, setEstateAreaHa] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFullName("");
      setEmail("");
      setPassword("");
      setPhoneNumber("");
      setEstateAreaHa("");
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const canSubmit =
    fullName.trim() !== "" &&
    email.trim() !== "" &&
    password.length >= 6 &&
    !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = getSupabase();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setError("Sesi tidak ditemukan. Silakan login ulang.");
        setIsSubmitting(false);
        return;
      }

      const res = await fetch("/api/petani", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
          fullName: fullName.trim(),
          phoneNumber: phoneNumber.trim() || undefined,
          estateAreaHa: estateAreaHa ? parseFloat(estateAreaHa) : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Surface the actual server error; fall back to a clear default
        const serverMsg =
          (data.error as string) ??
          (data.msg as string) ??
          "Gagal menambahkan petani.";
        setError(serverMsg);
        setIsSubmitting(false);
        return;
      }

      onSuccess();
    } catch (err) {
      console.error("TambahPetani error:", err);
      setError("Terjadi kesalahan jaringan. Coba lagi.");
      setIsSubmitting(false);
    }
  };

  return (
    <>
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
                <MaterialIcon name="person_add" size={22} className="text-brand-600" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg text-slate-900">
                  Tambah Petani
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Buat akun dan profil petani baru
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <MaterialIcon name="close" size={20} className="text-slate-400" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                <MaterialIcon name="error" size={18} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Nama Lengkap */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Nama Lengkap <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Contoh: Ahmad Fauzi"
                className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-colors"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ahmad@example.com"
                className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Password <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-colors"
              />
              {password.length > 0 && password.length < 6 && (
                <p className="text-[11px] text-amber-600 mt-1">
                  Password kurang dari 6 karakter
                </p>
              )}
            </div>

            {/* No. HP / WA */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                No. HP / WA
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="08xxxxxxxxxx"
                className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-colors"
              />
            </div>

            {/* Luas Lahan */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Luas Lahan (Ha)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={estateAreaHa}
                onChange={(e) => setEstateAreaHa(e.target.value)}
                placeholder="Contoh: 1.5"
                className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-colors"
              />
            </div>

            {/* Submit */}
            <Button
              variant="primary"
              size="md"
              icon={isSubmitting ? "hourglass_top" : "person_add"}
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`w-full h-12 rounded-xl ${!canSubmit ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isSubmitting ? "Menambahkan..." : "Tambah Petani"}
            </Button>

            {!canSubmit && !isSubmitting && (
              <p className="text-center text-xs text-slate-400 -mt-2">
                Lengkapi field bertanda (*) dengan password minimal 6 karakter
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

