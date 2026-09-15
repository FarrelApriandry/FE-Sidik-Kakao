import MaterialIcon from "../ui/MaterialIcon";
import SearchInput from "../ui/SearchInput";

interface Props {
  onMenuToggle: () => void;
  season?: string;
  userName?: string;
  userRegion?: string;
}

export default function Topbar({
  onMenuToggle,
  season = "Musim Utama 2026",
  userName = "Admin Poktan",
  userRegion = "Luwu Utara",
}: Props) {
  return (
    <header className="sticky top-0 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 z-30 px-4 lg:px-8 flex items-center justify-between">
      {/* Left: Hamburger + Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Toggle Menu"
        >
          <MaterialIcon name="menu" size={24} />
        </button>
        <SearchInput
          placeholder="Cari petani, lot, batch..."
          className="hidden sm:flex w-64"
        />
      </div>

      {/* Right: Season + Notification + Profile */}
      <div className="flex items-center gap-4">
        {/* Season Selector */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl text-slate-700 text-xs font-medium">
          <MaterialIcon
            name="calendar_month"
            size={16}
            className="text-cacao-500"
          />
          <span>{season}</span>
        </div>

        {/* Notification Bell */}
        <button
          className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Notifikasi"
        >
          <MaterialIcon name="notifications" size={20} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* Divider */}
        <div className="h-5 w-[1px] bg-slate-200" />

        {/* User Profile */}
        <div className="flex items-center gap-2.5">
          <div className="text-right hidden sm:flex flex-col">
            <span className="text-xs font-semibold text-slate-900 leading-tight">
              {userName}
            </span>
            <span className="text-[11px] text-slate-500">{userRegion}</span>
          </div>
          <div className="h-8 w-8 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center border border-brand-600/20">
            <MaterialIcon name="person" size={20} />
          </div>
        </div>
      </div>
    </header>
  );
}
