import { useState, useEffect, useCallback } from "react";
import MaterialIcon from "../ui/MaterialIcon";
import BottomNav from "./BottomNav";
import { fetchHarvests, syncPendingRecords, logoutUser, getHarvests } from "../../utils/storage";
import { getCurrentUser } from "../../lib/supabase";
import { fetchPoktanName } from "../../lib/dashboard-queries";

/* ══════════════════════════════════════════════
   Main Component
   ══════════════════════════════════════════════ */
export default function AkunPage() {
  const [localCount, setLocalCount] = useState(0);
  const [pendingQueue, setPendingQueue] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [profileName, setProfileName] = useState("Memuat...");
  const [profileAvatar, setProfileAvatar] = useState("...");
  const [profilePoktan, setProfilePoktan] = useState("Memuat...");
  const [profileRole, setProfileRole] = useState("petani");

  /* Load user profile from Supabase */
  useEffect(() => {
    getCurrentUser().then((u) => {
      if (!u) return;
      const initials = u.fullName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
      setProfileName(u.fullName);
      setProfileAvatar(initials);
      setProfileRole(u.role ?? "petani");
      if (u.poktanId) {
        fetchPoktanName(u.poktanId).then(setProfilePoktan);
      }
    });
  }, []);

  /* Load local record count */
  useEffect(() => {
    fetchHarvests().then((records) => {
      setLocalCount(records.length);
      const pending = records.filter((r) => r.syncStatus === "pending" || r.syncStatus === "error").length;
      setPendingQueue(pending);
    });
  }, []);

  /* Connectivity listeners */
  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  /* Real sync handler */
  const handleSync = useCallback(async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncSuccess(false);
    try {
      const result = await syncPendingRecords();
      setPendingQueue(result.failed);
      setSyncSuccess(result.synced > 0);
      if (result.synced > 0) setTimeout(() => setSyncSuccess(false), 3000);
    } catch {
      // silent
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  /* Logout */
  const handleLogout = useCallback(async () => {
    await logoutUser();
    sessionStorage.removeItem("role");
    window.location.href = "/";
  }, []);

  return (
    <div className="w-full max-w-[430px] mx-auto min-h-screen bg-slate-50 flex flex-col relative">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 flex items-center gap-3">
        <a
          href="/petani"
          className="h-9 w-9 -ml-1 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <MaterialIcon name="arrow_back" size={22} />
        </a>
        <div className="flex-1">
          <h1 className="font-display font-bold text-base text-slate-900 tracking-tight">
            Akun Saya
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Profil & pengaturan aplikasi
          </p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-24 space-y-4">
        {/* Profile Card */}
        <ProfileCard avatar={profileAvatar} name={profileName} poktan={profilePoktan} />

        {/* Sync Status Card */}
        <SyncStatusCard
          localCount={localCount}
          pendingQueue={pendingQueue}
          isOnline={isOnline}
          isSyncing={isSyncing}
          syncSuccess={syncSuccess}
        />

        {/* System Actions */}
        <SystemActions
          onSync={handleSync}
          onLogout={handleLogout}
          isSyncing={isSyncing}
        />
      </main>

      <BottomNav activeIndex={3} />
    </div>
  );
}

/* ══════════════════════════════════════════════
   Sub-Components
   ══════════════════════════════════════════════ */

/* ── Profile Card ── */
function ProfileCard({ avatar, name, poktan }: { avatar: string; name: string; poktan: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="h-16 w-16 shrink-0 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-600/20">
          <span className="font-display font-bold text-xl">{avatar}</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h2 className="font-display font-bold text-base text-slate-900 truncate">
            {name}
          </h2>
          <div className="flex items-center gap-1.5 mt-1">
            <MaterialIcon name="groups" size={14} className="text-slate-400" />
            <span className="text-xs text-slate-500">{poktan}</span>
          </div>
        </div>
      </div>

      {/* Estate Info */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
            <MaterialIcon name="landscape" size={18} />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block">Luas Lahan</span>
            <span className="text-sm font-bold text-slate-900">-</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-amber-50 text-cacao-500 flex items-center justify-center">
            <MaterialIcon name="agriculture" size={18} />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block">Komoditas</span>
            <span className="text-sm font-bold text-slate-900">Kakao</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Sync Status Card ── */
interface SyncStatusProps {
  localCount: number;
  pendingQueue: number;
  isOnline: boolean;
  isSyncing: boolean;
  syncSuccess: boolean;
}

function SyncStatusCard({
  localCount,
  pendingQueue,
  isOnline,
  isSyncing,
  syncSuccess,
}: SyncStatusProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-sm text-slate-900">
          Status Penyimpanan
        </h3>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
            isOnline
              ? "bg-emerald-100 text-emerald-800"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
            }`}
          />
          {isOnline ? "Online" : "Offline"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <MaterialIcon name="storage" size={16} className="text-brand-600" />
            <span className="text-[11px] text-slate-500">Local Storage</span>
          </div>
          <span className="font-display font-bold text-lg text-slate-900">
            {localCount}
          </span>
          <span className="text-xs text-slate-500 ml-1">record</span>
        </div>

        <div className="bg-slate-50 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <MaterialIcon
              name="cloud_upload"
              size={16}
              className={pendingQueue > 0 ? "text-amber-600" : "text-emerald-600"}
            />
            <span className="text-[11px] text-slate-500">Antrian Cloud</span>
          </div>
          <span
            className={`font-display font-bold text-lg ${
              pendingQueue > 0 ? "text-amber-700" : "text-emerald-700"
            }`}
          >
            {pendingQueue}
          </span>
          <span className="text-xs text-slate-500 ml-1">pending</span>
        </div>
      </div>

      {isSyncing && (
        <div className="flex items-center gap-2.5 px-3 py-2.5 bg-brand-50 rounded-xl">
          <div className="h-4 w-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-brand-700">
            Menyinkronkan data ke server...
          </span>
        </div>
      )}

      {syncSuccess && !isSyncing && (
        <div className="flex items-center gap-2.5 px-3 py-2.5 bg-emerald-50 rounded-xl">
          <MaterialIcon name="check_circle" size={18} className="text-emerald-600" />
          <span className="text-xs font-semibold text-emerald-700">
            Sinkronisasi berhasil! Semua data terkirim.
          </span>
        </div>
      )}
    </div>
  );
}

/* ── System Actions ── */
interface SystemActionsProps {
  onSync: () => void;
  onLogout: () => void;
  isSyncing: boolean;
}

function SystemActions({ onSync, onLogout, isSyncing }: SystemActionsProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <h3 className="font-display font-bold text-sm text-slate-900 px-5 pt-5 pb-3">
        Pengaturan
      </h3>

      {/* Sync Button */}
      <button
        onClick={onSync}
        disabled={isSyncing}
        className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors disabled:opacity-50 border-t border-slate-100"
      >
        <div className="h-9 w-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
          <MaterialIcon name="sync" size={20} />
        </div>
        <div className="flex-1 text-left">
          <span className="text-sm font-semibold text-slate-800 block">
            Sinkronisasi Data Manual
          </span>
          <span className="text-[11px] text-slate-500">
            Kirim data lokal ke server cloud
          </span>
        </div>
        <MaterialIcon name="chevron_right" size={20} className="text-slate-300" />
      </button>

      {/* FAQ */}
      <a
        href="/petani/bantuan"
        className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors border-t border-slate-100"
      >
        <div className="h-9 w-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
          <MaterialIcon name="help" size={20} />
        </div>
        <div className="flex-1">
          <span className="text-sm font-semibold text-slate-800 block">
            Bantuan &amp; FAQ
          </span>
          <span className="text-[11px] text-slate-500">
            Panduan penggunaan aplikasi SIDIK-KAKAO
          </span>
        </div>
        <MaterialIcon name="chevron_right" size={20} className="text-slate-300" />
      </a>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-red-50 transition-colors border-t border-slate-100"
      >
        <div className="h-9 w-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
          <MaterialIcon name="logout" size={20} />
        </div>
        <div className="flex-1 text-left">
          <span className="text-sm font-semibold text-red-700 block">
            Keluar / Ganti Peran
          </span>
          <span className="text-[11px] text-slate-500">
            Kembali ke halaman pemilihan peran
          </span>
        </div>
        <MaterialIcon name="chevron_right" size={20} className="text-slate-300" />
      </button>
    </div>
  );
}
