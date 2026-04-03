import rawHiragana from '../../fixtures/hiragana.json';

export const HIRAGANA_VIEW_BOX = 320;

const BASE_SIZE = 1024;
const S = HIRAGANA_VIEW_BOX / BASE_SIZE;

function scalePath(d: string) {
  return d.replace(/(-?[\d.]+)/g, n => (parseFloat(n) * S).toFixed(2));
}

function scaleMedian(pts: number[][]) {
  return pts.map(([x, y]) => ({ x: x * S, y: y * S }));
}

export type MedianPoint = { x: number; y: number };

export type KanaStrokeBuilt = {
  path: string;
  label: string;
  scaledPath: string;
  /** polyline median trong viewBox 320×320 */
  median: MedianPoint[];
};

export type KanaCharData = {
  reading: string;
  strokes: KanaStrokeBuilt[];
};

type RawStroke = { path: string; median: number[][]; label: string };

const RAW: Record<string, { reading: string; strokes: RawStroke[] }> = {};
for (const entry of rawHiragana as any[]) {
  const ch = String.fromCharCode(entry.charCode);
  const medianMap = new Map(
    (entry.medians || []).map((m: any) => [m.id, m.value as number[][]]),
  );
  RAW[ch] = {
    reading: '',
    strokes: (entry.strokes || []).map((s: any) => ({
      path: s.value as string,
      median: medianMap.get(s.id) || [],
      label: '',
    })),
  };
}

export const KANA_DATA: Record<string, KanaCharData> = {};
for (const [char, data] of Object.entries(RAW)) {
  KANA_DATA[char] = {
    reading: data.reading,
    strokes: data.strokes.map(s => ({
      path: s.path,
      label: s.label,
      scaledPath: scalePath(s.path),
      median: scaleMedian(s.median),
    })),
  };
}

export const KANA_CHARACTERS = Object.keys(KANA_DATA);

export function firstKanaGrapheme(s: string): string {
  const t = (s || '').trim();
  return [...t][0] ?? '';
}

export function getKanaData(char: string): KanaCharData | null {
  const k = firstKanaGrapheme(char);
  return KANA_DATA[k] ?? null;
}

export const HIT_THRESHOLD = 28;
export const MIN_PROGRESS = 0.68;

export function distToSeg(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
) {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - ax, py - ay);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

export function isNearMedian(
  pts: MedianPoint[],
  x: number,
  y: number,
  thr = HIT_THRESHOLD,
) {
  for (let i = 0; i < pts.length - 1; i++) {
    if (distToSeg(x, y, pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y) < thr) {
      return true;
    }
  }
  return false;
}

export function getMedianProgress(pts: MedianPoint[], x: number, y: number) {
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < pts.length; i++) {
    const d = Math.hypot(pts[i].x - x, pts[i].y - y);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best / Math.max(1, pts.length - 1);
}

export function medianArrowHint(pts: MedianPoint[]) {
  if (!pts || pts.length < 2) {
    return { angle: 0, pt: pts?.[0] || { x: 160, y: 160 } };
  }
  if (pts.length === 2) {
    const dx = pts[1].x - pts[0].x;
    const dy = pts[1].y - pts[0].y;
    return {
      angle: (Math.atan2(dy, dx) * 180) / Math.PI,
      pt: { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 },
    };
  }
  const i = Math.max(1, Math.min(pts.length - 2, Math.floor(pts.length / 2)));
  let dx = pts[i + 1].x - pts[i - 1].x;
  let dy = pts[i + 1].y - pts[i - 1].y;
  if (dx * dx + dy * dy < 1e-4) {
    dx = pts[i].x - pts[i - 1].x;
    dy = pts[i].y - pts[i - 1].y;
  }
  if (dx * dx + dy * dy < 1e-4) {
    dx = pts[i + 1].x - pts[i].x;
    dy = pts[i + 1].y - pts[i].y;
  }
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  return { angle, pt: pts[i] };
}
