import type { SyncStatus } from "../../types";
import MaterialIcon from "../ui/MaterialIcon";

interface Props {
  status: SyncStatus;
}

export default function SyncStatusCard({ status }: Props) {
  const isOnline = status.state === "online";

  return (
    <div className="px-4 flex flex-col gap-3">
      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60">
        <div className="flex items-center gap-2.5">
          <MaterialIcon
            name={isOnline ? "cloud_done" : "cloud_off"}
            size={18}
            className={isOnline ? "text-brand-600" : "text-slate-400"}
          />
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-800">
              {status.label}
            </span>
            <span className="text-[11px] text-slate-500">
              {status.sublabel}
            </span>
          </div>
        </div>
        <span
          className={`h-2 w-2 rounded-full ${
            isOnline
              ? "bg-emerald-500 animate-pulse"
              : "bg-slate-400"
          }`}
        />
      </div>
    </div>
  );
}
