import type { QualitySegment } from "../../types";

interface Props {
  segments: QualitySegment[];
  centerValue: string;
  centerLabel: string;
}

const RADIUS = 38;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function QualityDonutChart({
  segments,
  centerValue,
  centerLabel,
}: Props) {
  // Calculate stroke-dasharray and stroke-dashoffset for each segment
  let cumulativeOffset = 0;
  const segmentArcs = segments.map((seg) => {
    const segLength = (seg.percentage / 100) * CIRCUMFERENCE;
    const gap = CIRCUMFERENCE - segLength;
    const offset = -cumulativeOffset;
    cumulativeOffset += segLength;
    return {
      ...seg,
      dasharray: `${segLength} ${gap}`,
      dashoffset: offset,
    };
  });

  return (
    <div className="lg:col-span-5 bg-white border border-slate-200/80 p-5 rounded-xl shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div>
        <h2 className="font-display font-bold text-base text-slate-900">
          Distribusi Mutu Kakao
        </h2>
        <p className="text-xs text-slate-500">Kualifikasi Standar SNI</p>
      </div>

      {/* Donut Graphic */}
      <div className="flex items-center justify-center my-4 relative">
        <svg
          className="w-40 h-40 -rotate-90"
          viewBox="0 0 100 100"
          aria-label="Distribusi Mutu Kakao"
        >
          {/* Background Ring */}
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth="12"
          />
          {/* Segments (rendered in reverse order so Grade A is on top) */}
          {segmentArcs.toReversed().map((seg) => (
            <circle
              key={seg.label}
              cx="50"
              cy="50"
              r={RADIUS}
              fill="transparent"
              stroke={seg.color}
              strokeWidth="12"
              strokeDasharray={seg.dasharray}
              strokeDashoffset={seg.dashoffset}
            />
          ))}
        </svg>

        {/* Center Text */}
        <div className="absolute text-center">
          <span className="text-2xl font-bold font-display text-slate-900 block">
            {centerValue}
          </span>
          <span className="text-[11px] font-semibold text-brand-700">
            {centerLabel}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className="flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: seg.color }}
              />
              <span className="font-medium text-slate-700">{seg.label}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-900">
                {seg.percentage}%
              </span>
              <span className="text-slate-500">{seg.weight}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
