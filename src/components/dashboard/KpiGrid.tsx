import type { KpiMetric } from "../../types";
import KpiCard from "./KpiCard";

interface Props {
  metrics: KpiMetric[];
}

export default function KpiGrid({ metrics }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <KpiCard key={index} metric={metric} />
      ))}
    </div>
  );
}
