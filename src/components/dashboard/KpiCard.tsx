import type { KpiMetric } from "../../types";

interface Props {
  metric: KpiMetric;
}

export default function KpiCard({ metric }: Props) {
  return (
    <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs flex flex-col justify-between space-y-3">
      {/* Header: Label + Icon */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">
          {metric.label}
        </span>
        <span className={`p-2 rounded-lg ${metric.iconBg}`}>
          <span className="material-symbols-outlined text-[18px]">
            {metric.icon}
          </span>
        </span>
      </div>

      {/* Value */}
      <div>
        <span
          className={`font-display font-bold text-2xl ${
            metric.valueColor ?? "text-slate-900"
          }`}
        >
          {metric.value}
        </span>
        {metric.unit && (
          <span className="text-sm font-medium text-slate-500 ml-1">
            {metric.unit}
          </span>
        )}
      </div>

      {/* Trend / Subtitle */}
      {metric.trend && (
        <div
          className={`flex items-center text-xs font-medium gap-1 ${
            metric.trend.color === "emerald"
              ? "text-emerald-700"
              : "text-red-600"
          }`}
        >
          <span className="material-symbols-outlined text-[14px]">
            {metric.trend.direction === "up"
              ? "arrow_upward"
              : "arrow_downward"}
          </span>
          <span>{metric.trend.value}</span>
        </div>
      )}
      {metric.subtitle && !metric.trend && (
        <span
          className={`text-xs font-medium ${
            metric.valueColor ?? "text-slate-500"
          }`}
        >
          {metric.subtitle}
        </span>
      )}
    </div>
  );
}
