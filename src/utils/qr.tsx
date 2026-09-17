/**
 * QR Code SVG Utility
 *
 * Generate a deterministic QR-like SVG grid from a seed string.
 * Uses a simple hash to fill a 21×21 matrix (standard QR Version 1).
 * Shared between CatatForm (post-save modal) and RiwayatPage (detail modal).
 */

/* ── Grid Generator ── */
export function generateQrGrid(seed: string): boolean[][] {
  const size = 21;
  const grid: boolean[][] = Array.from({ length: size }, () =>
    Array(size).fill(false)
  );

  // Simple deterministic hash from seed
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }

  const rand = () => {
    hash = (hash * 16807 + 12345) & 0x7fffffff;
    return hash / 0x7fffffff;
  };

  // Finder patterns (top-left, top-right, bottom-left)
  const drawFinder = (row: number, col: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const rr = row + r;
        const cc = col + c;
        if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue;
        const isBorder = r === -1 || r === 7 || c === -1 || c === 7;
        const isOuter = r === 0 || r === 6 || c === 0 || c === 6;
        const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        grid[rr][cc] = isBorder ? false : isOuter || isInner;
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, 14);
  drawFinder(14, 0);

  // Timing patterns
  for (let i = 8; i < 13; i++) {
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
  }

  // Fill remaining cells pseudo-randomly
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const inFinder =
        (r < 8 && c < 8) || (r < 8 && c > 12) || (r > 12 && c < 8);
      const inTiming = r === 6 || c === 6;
      if (!inFinder && !inTiming && !grid[r][c]) {
        grid[r][c] = rand() > 0.5;
      }
    }
  }

  return grid;
}

/* ── SVG HTML String Generator (for print) ── */
export function generateQrSvgHtml(payload: string): string {
  const grid = generateQrGrid(payload);
  const cellSize = 8;
  const size = grid.length * cellSize;

  let rects = "";
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c]) {
        rects += `<rect x="${c * cellSize}" y="${r * cellSize}" width="${cellSize}" height="${cellSize}" fill="#11562a"/>`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" style="display:block;margin:0 auto"><rect width="${size}" height="${size}" fill="white"/>${rects}</svg>`;
}

/* ── SVG Component ── */
export function QrCodeSvg({ payload }: { payload: string }) {
  const grid = generateQrGrid(payload);
  const cellSize = 8;
  const size = grid.length * cellSize;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className="mx-auto"
    >
      <rect width={size} height={size} fill="white" />
      {grid.map((row, r) =>
        row.map((filled, c) =>
          filled ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize}
              height={cellSize}
              fill="#11562a"
            />
          ) : null
        )
      )}
    </svg>
  );
}
