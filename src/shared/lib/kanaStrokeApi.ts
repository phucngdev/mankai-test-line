import { getStrokesService } from '#/api/services/question.service';
import type { KanaCharData } from '#/shared/lib/katakanaCanvasKit';
import { firstKanaGrapheme } from '#/shared/lib/katakanaCanvasKit';

const VIEW_BOX = 320;
const BASE_SIZE = 1024;
const S = VIEW_BOX / BASE_SIZE;

function scalePath(d: string) {
  return d.replace(/(-?[\d.]+)/g, n => (parseFloat(n) * S).toFixed(2));
}

function scaleMedian(pts: number[][]) {
  return pts.map(([x, y]) => ({ x: x * S, y: y * S }));
}

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

/** medians theo từng nét: number[][][] hoặc [{ id, value }] */
function extractMediansList(medians: unknown): number[][][] {
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
 * Ghép strokes + medians theo id (format fixture katakana/hiragana.json).
 */
function buildFromStrokeMedianObjects(
  strokesIn: unknown,
  mediansIn: unknown,
  reading: string,
): KanaCharData | null {
  if (!Array.isArray(strokesIn) || !strokesIn.length) return null;
  const s0 = strokesIn[0];
  if (typeof s0 === 'string') return null;

  const medianMap = new Map<string, number[][]>();
  if (Array.isArray(mediansIn)) {
    for (const m of mediansIn as { id?: string; value?: number[][] }[]) {
      if (
        m &&
        typeof m === 'object' &&
        m.id != null &&
        Array.isArray(m.value)
      ) {
        medianMap.set(String(m.id), m.value);
      }
    }
  }

  const rawStrokes = (strokesIn as { id?: string; value?: string }[]).map(
    s => ({
      id: s.id != null ? String(s.id) : '',
      path: typeof s.value === 'string' ? s.value : '',
    }),
  );
  if (!rawStrokes.some(x => x.path)) return null;

  const strokesBuilt = rawStrokes.map(s => {
    const medianPts = medianMap.get(s.id) ?? [];
    const medianScaled = scaleMedian(medianPts);
    const median =
      medianScaled.length > 0
        ? medianScaled
        : [{ x: VIEW_BOX / 2, y: VIEW_BOX / 2 }];
    return {
      path: s.path,
      label: '',
      scaledPath: scalePath(s.path),
      median,
    };
  });

  return { reading, strokes: strokesBuilt };
}

export function buildKanaCharDataFromFlatParts(
  strokes: string[],
  medians: number[][][],
  reading = '',
): KanaCharData | null {
  if (!strokes.length) return null;
  const strokesBuilt = strokes.map((path, idx) => {
    const medianPtsRaw = medians[idx] ?? [];
    const medianScaled = scaleMedian(medianPtsRaw);
    const median =
      medianScaled.length > 0
        ? medianScaled
        : [{ x: VIEW_BOX / 2, y: VIEW_BOX / 2 }];
    return {
      path,
      label: '',
      scaledPath: scalePath(path),
      median,
    };
  });
  return { reading, strokes: strokesBuilt };
}

/**
 * Parse response API (tương thích body giống fixture hoặc strokes/medians phẳng).
 */
export function parseKanaStrokesPayload(raw: unknown): {
  data: KanaCharData | null;
} {
  if (raw == null || typeof raw !== 'object') return { data: null };
  const o = raw as Record<string, unknown>;
  let body: Record<string, unknown> = o;
  if (o.data && typeof o.data === 'object') {
    body = o.data as Record<string, unknown>;
  }

  const reading = typeof body.reading === 'string' ? body.reading : '';

  const byId = buildFromStrokeMedianObjects(
    body.strokes,
    body.medians,
    reading,
  );
  if (byId) return { data: byId };

  const strokes = extractStrokeStrings(body.strokes);
  if (!strokes.length) return { data: null };
  const medians = extractMediansList(body.medians);
  const flat = buildKanaCharDataFromFlatParts(strokes, medians, reading);
  return { data: flat };
}

const cache = new Map<string, KanaCharData>();

export type KanaKind = 'KATAKANA' | 'HIRAGANA';

export async function fetchKanaCharData(
  kind: KanaKind,
  char: string,
  options?: { force?: boolean },
): Promise<KanaCharData | null> {
  const keyChar = firstKanaGrapheme(char);
  if (!keyChar) return null;
  const cacheKey = `${kind}:${keyChar}`;
  if (!options?.force && cache.has(cacheKey)) {
    return cache.get(cacheKey) ?? null;
  }
  try {
    const enc = encodeURIComponent(keyChar);
    const res = await getStrokesService(enc);
    const { data } = parseKanaStrokesPayload(res?.data);
    if (data) cache.set(cacheKey, data);
    return data;
  } catch {
    return null;
  }
}

export function clearKanaCharCache(kind?: KanaKind, char?: string) {
  if (kind && char) {
    cache.delete(`${kind}:${firstKanaGrapheme(char)}`);
    return;
  }
  if (kind) {
    for (const k of [...cache.keys()]) {
      if (k.startsWith(`${kind}:`)) cache.delete(k);
    }
    return;
  }
  cache.clear();
}
