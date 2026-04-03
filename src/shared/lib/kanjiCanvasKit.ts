import { getStrokesService } from '#/api/services/question.service';

export const KATAKANA_VIEW_BOX = 320;

const BASE_SIZE = 1024;
const S = KATAKANA_VIEW_BOX / BASE_SIZE;

function scalePath(d: string) {
  return d?.replace(/(-?[\d.]+)/g, n => (parseFloat(n) * S).toFixed(2));
}

function scaleMedian(pts: number[][]) {
  return pts.map(([x, y]) => ({ x: x * S, y: KATAKANA_VIEW_BOX - y * S }));
}

/** Dùng cho API: cùng format `strokes` + `medians` như backend kanji-strokes. */
export function buildKanjiCharDataFromParts(
  strokesRaw: string[],
  mediansRaw: number[][][],
  reading = '',
): KanaCharData | null {
  if (!strokesRaw.length) return null;
  const strokes: KanaStrokeBuilt[] = strokesRaw.map((path, idx) => {
    const medianPtsRaw = mediansRaw[idx] ?? [];
    const medianScaled = scaleMedian(medianPtsRaw);
    const median =
      medianScaled.length > 0 ? medianScaled : [{ x: 160, y: 160 }];
    return {
      path,
      label: '',
      scaledPath: scalePath(path),
      median,
    };
  });
  return { reading, strokes };
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

export function firstKanaGrapheme(s: string): string {
  const t = (s || '').trim();
  return [...t][0] ?? '';
}

const kanjiCharCache = new Map<string, KanaCharData>();

function extractStrokeStrings(strokes: unknown): string[] {
  if (!Array.isArray(strokes) || strokes.length === 0) return [];
  const a = strokes[0];
  if (typeof a === 'string') return strokes as string[];
  return (strokes as { value?: string }[])
    .map(s =>
      s && typeof s === 'object' && typeof s.value === 'string' ? s.value : '',
    )
    .filter(Boolean);
}

function extractMedians(medians: unknown): number[][][] {
  if (!Array.isArray(medians) || medians.length === 0) return [];
  const first = medians[0];
  if (Array.isArray(first) && Array.isArray((first as number[][])[0])) {
    return medians as number[][][];
  }
  if (first && typeof first === 'object' && 'value' in (first as object)) {
    return (medians as { value?: number[][] }[])
      .map(m => m.value ?? [])
      .filter(v => v.length > 0);
  }
  return [];
}

/**
 * Parse body từ `GET questions/kanji-strokes/:char` (hoặc object tương đương).
 */
export function parseKanjiStrokesPayload(raw: unknown): {
  strokes: string[];
  medians: number[][][];
  reading?: string;
} | null {
  if (raw == null || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  let strokesRaw: unknown = o.strokes;
  let mediansRaw: unknown = o.medians;
  let reading: string | undefined =
    typeof o.reading === 'string' ? o.reading : undefined;

  if (strokesRaw === undefined && o.data && typeof o.data === 'object') {
    const d = o.data as Record<string, unknown>;
    strokesRaw = d.strokes;
    mediansRaw = d.medians;
    if (typeof d.reading === 'string') reading = d.reading;
  }

  const strokes = extractStrokeStrings(strokesRaw);
  if (!strokes.length) return null;
  const medians = extractMedians(mediansRaw);
  return { strokes, medians, reading };
}

export type FetchKanjiCharDataOptions = {
  /** Bỏ qua cache và gọi lại API */
  force?: boolean;
};

/**
 * Lấy dữ liệu nét cho một kanji qua API, có cache theo grapheme đầu tiên.
 */
export async function fetchKanjiCharData(
  char: string,
  options?: FetchKanjiCharDataOptions,
): Promise<KanaCharData | null> {
  const key = firstKanaGrapheme(char);
  if (!key) return null;
  if (!options?.force && kanjiCharCache.has(key)) {
    return kanjiCharCache.get(key) ?? null;
  }
  try {
    const res = await getStrokesService(encodeURIComponent(key));
    const norm = parseKanjiStrokesPayload(res?.data);
    if (!norm) return null;
    const built = buildKanjiCharDataFromParts(
      norm.strokes,
      norm.medians,
      norm.reading ?? '',
    );
    if (built) kanjiCharCache.set(key, built);
    return built;
  } catch {
    return null;
  }
}

export function clearKanjiCharCache(char?: string) {
  if (char) {
    kanjiCharCache.delete(firstKanaGrapheme(char));
    return;
  }
  kanjiCharCache.clear();
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
