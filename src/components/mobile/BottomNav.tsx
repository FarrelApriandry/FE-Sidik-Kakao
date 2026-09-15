import MaterialIcon from "../ui/MaterialIcon";

/* ── Navigation Items ── */
const NAV_ITEMS = [
  { label: "Beranda", icon: "home", href: "/petani" },
  { label: "Catat", icon: "add_circle", href: "/petani/catat" },
  { label: "Riwayat", icon: "history", href: "/petani/riwayat" },
  { label: "Akun", icon: "person", href: "/petani/akun" },
];

interface BottomNavProps {
  activeIndex: number;
}

export default function BottomNav({ activeIndex }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/95 backdrop-blur-md border-t border-slate-200/80 z-30">
      <div className="flex items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {NAV_ITEMS.map((item, i) => (
          <a
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors ${
              i === activeIndex
                ? "text-brand-600"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <MaterialIcon
              name={item.icon}
              size={22}
              className={i === activeIndex ? "text-brand-600" : "text-slate-400"}
            />
            <span
              className={`text-[10px] font-semibold ${
                i === activeIndex ? "text-brand-600" : "text-slate-400"
              }`}
            >
              {item.label}
            </span>
            {i === activeIndex && (
              <span className="h-1 w-4 rounded-full bg-brand-600 mt-0.5" />
            )}
          </a>
        ))}
      </div>
    </nav>
  );
}
