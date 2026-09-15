import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import type { NavItem, SyncStatus } from "../../types";

interface Props {
  navItems: NavItem[];
  syncStatus: SyncStatus;
  currentPath?: string;
  children: React.ReactNode;
}

export default function DashboardShell({
  navItems,
  syncStatus,
  currentPath,
  children,
}: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  // Lock body scroll when sidebar is open on mobile
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

  return (
    <>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        navItems={navItems}
        syncStatus={syncStatus}
        currentPath={currentPath}
      />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Topbar onMenuToggle={toggleSidebar} />
        {children}
      </div>
    </>
  );
}
