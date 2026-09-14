import type { SidebarProps } from "../../types";
import MaterialIcon from "../ui/MaterialIcon";
import SyncStatusCard from "./SyncStatusCard";

export default function Sidebar({
  isOpen,
  onClose,
  navItems,
  syncStatus,
}: SidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200/80 z-50 flex flex-col justify-between py-5 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex flex-col gap-6 px-4">
          {/* Brand & Poktan Info */}
          <div className="flex items-center gap-3 pt-1">
            <div className="h-9 w-9 rounded-xl bg-brand-600 flex items-center justify-center text-white font-display font-bold text-lg shadow-sm">
              <img src="../../../public/Ico.png" alt="Logo" className="h-8 w-8" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-base text-slate-900 tracking-tight leading-none">
                SIDIK-KAKAO
              </span>
              <span className="text-xs text-slate-500 font-medium mt-1">
                Poktan Kakao Utama
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 mt-2">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-colors ${
                  item.isActive
                    ? "bg-brand-50 text-brand-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium"
                }`}
              >
                <MaterialIcon name={item.icon} size={20} />
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
        </div>

        {/* Bottom: Sync Status + Support Link */}
        <div className="flex flex-col gap-3">
          <SyncStatusCard status={syncStatus} />
          <a
            href="#"
            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <MaterialIcon name="help" size={18} />
            <span>Bantuan & Support</span>
          </a>
        </div>
      </aside>
    </>
  );
}
