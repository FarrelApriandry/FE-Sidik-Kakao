import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { getCurrentUser, type AppUser } from "../../lib/supabase";
import { fetchPoktanName } from "../../lib/dashboard-queries";
import type { NavItem, SyncStatus } from "../../types";

interface Props {
  navItems: NavItem[];
  currentPath?: string;
  children: React.ReactNode;
}

const ONLINE_STATUS: SyncStatus = {
  state: "online",
  label: "Sinkron Aktif",
  sublabel: "Offline-Ready",
};

export default function DashboardShell({
  navItems,
  currentPath,
  children,
}: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [poktanName, setPoktanName] = useState("Poktan");
  const [user, setUser] = useState<AppUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  useEffect(() => {
    getCurrentUser().then((u) => {
      if (u && u.role === "admin_poktan") {
        setUser(u);
        setIsAuthLoading(false);
        if (u.poktanId) {
          fetchPoktanName(u.poktanId).then(setPoktanName);
        }
      } else {
        // Redirect unauthorized or unauthenticated user
        window.location.href = "/";
      }
    });
  }, []);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Memverifikasi Sesi Admin...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        navItems={navItems}
        syncStatus={ONLINE_STATUS}
        currentPath={currentPath}
        poktanName={poktanName}
      />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Topbar
          onMenuToggle={toggleSidebar}
          userName={user?.fullName}
          poktanName={poktanName}
        />
        {children}
      </div>
    </>
  );
}
