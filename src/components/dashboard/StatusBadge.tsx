import type { BatchStatus } from "../../types";

interface Props {
  status: BatchStatus;
}

const config: Record<
  BatchStatus,
  { bg: string; text: string; icon: string; label: string }
> = {
  terverifikasi: {
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    icon: "check_circle",
    label: "Terverifikasi",
  },
  curing: {
    bg: "bg-amber-100",
    text: "text-amber-900",
    icon: "hourglass_top",
    label: "Curing",
  },
  pending: {
    bg: "bg-slate-100",
    text: "text-slate-700",
    icon: "schedule",
    label: "Pending",
  },
};

export default function StatusBadge({ status }: Props) {
  const c = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${c.bg} ${c.text}`}
    >
      <span className="material-symbols-outlined text-[13px]">{c.icon}</span>{" "}
      {c.label}
    </span>
  );
}
