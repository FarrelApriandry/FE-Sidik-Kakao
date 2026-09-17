import { useState } from "react";
import MaterialIcon from "../ui/MaterialIcon";
import { getSupabase } from "../../lib/supabase";

type Role = "admin" | "petani";

export default function LoginForm() {
  const [role, setRole] = useState<Role>("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (selectedRole: Role) => {
    setError(null);
    setIsLoading(true);
    try {
      const supabase = getSupabase();
      const loginEmail = email.trim() || (selectedRole === "admin" ? "admin@poktan.id" : "budi@petani.id");
      const loginPassword = password.trim() || "password123";

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (authError) {
        setError(authError.message);
        setIsLoading(false);
        return;
      }

      const userRole = data.user?.user_metadata?.role ?? selectedRole;
      sessionStorage.setItem("role", userRole);
      window.location.href = userRole === "admin" ? "/dashboard" : "/petani";
    } catch (e) {
      setError("Gagal terhubung ke server. Menggunakan mode demo.");
      sessionStorage.setItem("role", selectedRole);
      window.location.href = selectedRole === "admin" ? "/dashboard" : "/petani";
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Brand Identity */}
      <div className="flex flex-col items-center mb-8">
        <div className="h-16 w-16 rounded-2xl bg-brand-600 flex items-center justify-center shadow-lg mb-4">
          <img src="/Ico.png" alt="SIDIK-KAKAO" className="h-12 w-12" />
        </div>
        <h1 className="font-display font-bold text-2xl text-slate-900 tracking-tight">
          SIDIK-KAKAO
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Sistem Digital Kakao
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/80 p-6 space-y-6">
        {/* Role Toggle Pill */}
        <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
          <button
            onClick={() => setRole("admin")}
            className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
              role === "admin"
                ? "bg-brand-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <MaterialIcon name="admin_panel_settings" size={18} />
              Admin Poktan
            </span>
          </button>
          <button
            onClick={() => setRole("petani")}
            className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
              role === "petani"
                ? "bg-cacao-500 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <MaterialIcon name="agriculture" size={18} />
              Petani Lapangan
            </span>
          </button>
        </div>

        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Email</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <MaterialIcon name="mail" size={20} />
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={role === "admin" ? "admin@poktan.id" : "budi@petani.id"}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600 transition-all"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Password</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <MaterialIcon name="lock" size={20} />
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600 transition-all"
            />
          </div>
        </div>

        {/* Login Button */}
        <button
          onClick={() => handleLogin(role)}
          disabled={isLoading}
          className="w-full h-11 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-400 text-white font-semibold rounded-xl shadow-sm hover:shadow transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Memproses...
            </>
          ) : "Masuk"}
        </button>

        {error && (
          <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400 font-medium">Quick Demo</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* 1-Click Demo Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => handleLogin("admin")}
            className="w-full h-11 flex items-center justify-center gap-2 bg-brand-50 border border-brand-600/20 text-brand-700 font-semibold rounded-xl hover:bg-brand-100 transition-all active:scale-[0.98]"
          >
            <MaterialIcon name="space_dashboard" size={20} />
            Masuk sebagai Admin Poktan
          </button>
          <button
            onClick={() => handleLogin("petani")}
            className="w-full h-11 flex items-center justify-center gap-2 bg-cacao-500/10 border border-cacao-500/20 text-cacao-700 font-semibold rounded-xl hover:bg-cacao-500/20 transition-all active:scale-[0.98]"
          >
            <MaterialIcon name="agriculture" size={20} />
            Masuk sebagai Petani
          </button>
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-slate-400 mt-6">
        © 2026 SIDIK-KAKAO • Ketertelusuran Kakao Indonesia
      </p>
    </div>
  );
}
