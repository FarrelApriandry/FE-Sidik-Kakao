import type { WeatherAlert } from "../../types";
import Button from "../ui/Button";

interface Props {
  alert: WeatherAlert;
}

export default function AiAlertBanner({ alert }: Props) {
  return (
    <div className="bg-amber-50/90 border border-amber-200 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 shrink-0 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
          <span className="material-symbols-outlined text-[20px]">
            warning
          </span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Peringatan Cuaca
            </span>
            <span className="text-[11px] text-amber-700">
              • {alert.source}
            </span>
          </div>
          <p className="text-sm text-amber-950 leading-snug">
            {alert.message}{" "}
            <strong className="font-semibold text-amber-900">
              {alert.highlight}
            </strong>
            .
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button variant="amber" size="sm">
          {alert.ctaLabel}
        </Button>
      </div>
    </div>
  );
}
