import type { TrendDataPoint } from "../../types";

interface Props {
  data: TrendDataPoint[];
}

const SVG_LEFT = 40;
const SVG_RIGHT = 460;
const SVG_TOP = 20;
const SVG_BOTTOM = 150;
const SVG_WIDTH = SVG_RIGHT - SVG_LEFT;
const SVG_HEIGHT = SVG_BOTTOM - SVG_TOP;
const MAX_VOLUME = 15;
const MIN_PRICE = 35000;
const MAX_PRICE = 55000;

function mapX(index: number, total: number): number {
  const denominator = Math.max(1, total - 1);
  return SVG_LEFT + (index / denominator) * SVG_WIDTH;
}

function mapVolumeY(volume: number): number {
  return SVG_BOTTOM - (volume / MAX_VOLUME) * SVG_HEIGHT;
}

function mapPriceY(price: number): number {
  if (price <= 0) return SVG_BOTTOM;
  return SVG_BOTTOM - ((price - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * SVG_HEIGHT;
}

export default function TrendChart({ data }: Props) {
  // Empty state: no data to chart
  if (!data || data.length === 0) {
    return (
      <div className="lg:col-span-7 bg-white border border-slate-200/80 p-5 rounded-xl shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-bold text-base text-slate-900">
              Tren Volume & Harga Jual
            </h2>
            <p className="text-xs text-slate-500">
              Statistik agregat 6 bulan terakhir
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
          Belum ada data tren panen
        </div>
      </div>
    );
  }

  // Build polyline points for volume
  const volumePoints = data
    .map((d, i) => `${mapX(i, data.length)},${mapVolumeY(d.volume)}`)
    .join(" ");

  // Build area polygon (volume line + bottom edge)
  const volumeAreaPoints = [
    ...data.map((d, i) => `${mapX(i, data.length)},${mapVolumeY(d.volume)}`),
    `${mapX(data.length - 1, data.length)},${SVG_BOTTOM}`,
    `${mapX(0, data.length)},${SVG_BOTTOM}`,
  ].join(" ");

  // Build polyline points for price
  const pricePoints = data
    .map((d, i) => `${mapX(i, data.length)},${mapPriceY(d.price)}`)
    .join(" ");

  // Last data point positions for endpoint dots
  const lastIdx = data.length - 1;
  const lastVolumeX = mapX(lastIdx, data.length);
  const lastVolumeY = mapVolumeY(data[lastIdx].volume);
  const lastPriceY = mapPriceY(data[lastIdx].price);

  const activeMonth = data[lastIdx].month;

  // Y-axis label ticks
  const volumeLabels = ["15T", "10T", "5T", "0T"];
  const priceLabels = ["55k", "50k", "45k", "40k"];

  return (
    <div className="lg:col-span-7 bg-white border border-slate-200/80 p-5 rounded-xl shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display font-bold text-base text-slate-900">
            Tren Volume & Harga Jual
          </h2>
          <p className="text-xs text-slate-500">
            Statistik agregat 6 bulan terakhir
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-brand-600" />
            <span className="text-slate-700">Volume (Ton)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-cacao-500" />
            <span className="text-slate-700">Harga (Rp/Kg)</span>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative w-full h-56 select-none">
        <svg
          className="w-full h-full"
          viewBox="0 0 500 180"
          preserveAspectRatio="none"
          aria-label="Grafik Tren Volume dan Harga"
        >
          {/* Gridlines */}
          {[20, 60, 100, 140].map((y) => (
            <line
              key={y}
              x1={SVG_LEFT}
              y1={y}
              x2={SVG_RIGHT}
              y2={y}
              stroke="#f1f5f9"
              strokeWidth="1"
            />
          ))}

          {/* Volume Area Fill */}
          <polygon
            fill="#2e6f40"
            fillOpacity="0.1"
            points={volumeAreaPoints}
          />

          {/* Volume Line */}
          <polyline
            fill="none"
            stroke="#2e6f40"
            strokeWidth="2.5"
            points={volumePoints}
          />

          {/* Price Line (Dashed) */}
          <polyline
            fill="none"
            stroke="#775652"
            strokeWidth="2"
            strokeDasharray="4 3"
            points={pricePoints}
          />

          {/* Endpoint Dots */}
          <circle cx={lastVolumeX} cy={lastVolumeY} r="4" fill="#2e6f40" />
          <circle cx={lastVolumeX} cy={lastPriceY} r="4" fill="#775652" />
        </svg>

        {/* Left Y-Axis Labels (Volume) */}
        <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] font-semibold text-brand-600">
          {volumeLabels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>

        {/* Right Y-Axis Labels (Price) */}
        <div className="absolute right-0 top-0 bottom-6 flex flex-col justify-between text-[10px] font-semibold text-cacao-500">
          {priceLabels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      </div>

      {/* X-Axis Months */}
      <div className="grid grid-cols-6 text-center text-xs font-medium text-slate-500 pt-2 border-t border-slate-100">
        {data.map((d) => (
          <span
            key={d.month}
            className={
              d.month === activeMonth
                ? "font-bold text-brand-700"
                : ""
            }
          >
            {d.month}
          </span>
        ))}
      </div>
    </div>
  );
}
