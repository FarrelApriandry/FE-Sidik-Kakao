import type { NavItem } from "../types";

export const MOCK_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: "space_dashboard", href: "/dashboard" },
  { label: "Data Petani", icon: "group", href: "/dashboard/petani" },
  { label: "Rekap Panen", icon: "inventory", href: "/dashboard/rekap" },
  { label: "Ketertelusuran", icon: "qr_code_scanner", href: "/dashboard/ketertelusuran" },
  { label: "AI Insight", icon: "psychology", href: "/dashboard/ai-insight" },
];
