export const KATAKANA_VIEW_BOX = 320;

export type MedianPoint = { x: number; y: number };

export type KanaStrokeBuilt = {
  path: string;
  label: string;
  scaledPath: string;
  median: MedianPoint[];
};

export type KanaCharData = {
  reading: string;
  strokes: KanaStrokeBuilt[];
};

export const KANA_DATA: Record<string, KanaCharData> = {};
export const KANA_CHARACTERS: string[] = [];

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
