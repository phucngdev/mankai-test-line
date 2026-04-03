/** Hanzi Writer (SVG/canvas) — jsDelivr npm */
export const HANZI_WRITER_SCRIPT =
  'https://cdn.jsdelivr.net/npm/hanzi-writer@3.7.3/dist/hanzi-writer.min.js';

/** Một script tag dùng chung (playground + form câu hỏi) */
export const HANZI_WRITER_SCRIPT_ID = 'hanzi-writer-lib-global';

/**
 * Dữ liệu ký tự tiếng Nhật — hanzi-writer-data-jp (jsDelivr npm)
 * @see https://github.com/chanind/hanzi-writer-data-jp
 */
export const JP_CHAR_DATA_BASE =
  'https://cdn.jsdelivr.net/npm/hanzi-writer-data-jp@0.0.2';

export const jpCharDataFallbackUrl = (char: string) =>
  `https://raw.githubusercontent.com/chanind/hanzi-writer-data-jp/master/data/${encodeURIComponent(char)}.json`;

export type CharacterJson = {
  strokes: string[];
  medians: number[][][];
};

declare global {
  interface Window {
    HanziWriter?: {
      create: (
        el: string | HTMLElement,
        character: string,
        options?: Record<string, unknown>,
      ) => HanziWriterInstance;
    };
  }
}

export type HanziWriterInstance = {
  animateCharacter: (opts?: {
    onComplete?: (r: { canceled: boolean }) => void;
  }) => Promise<unknown>;
  loopCharacterAnimation: () => Promise<unknown>;
  pauseAnimation: () => Promise<unknown>;
  resumeAnimation: () => Promise<unknown>;
  quiz: (opts?: Record<string, unknown>) => Promise<unknown>;
  cancelQuiz: () => void;
  showCharacter: (opts?: Record<string, unknown>) => Promise<unknown>;
  hideCharacter: (opts?: Record<string, unknown>) => Promise<unknown>;
  showOutline: (opts?: Record<string, unknown>) => Promise<unknown>;
  hideOutline: (opts?: Record<string, unknown>) => Promise<unknown>;
  updateDimensions: (opts: {
    width: number;
    height: number;
    padding?: number;
  }) => void;
};

export const loadScriptOnce = (src: string, id: string) =>
  new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(id) as HTMLScriptElement | null;
    if (existing) {
      if (window.HanziWriter) {
        resolve();
        return;
      }
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener(
        'error',
        () => reject(new Error('Script error')),
        {
          once: true,
        },
      );
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.id = id;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Không tải được: ${src}`));
    document.body.appendChild(s);
  });

export function loadJapaneseCharData(
  char: string,
  onLoad: (data: CharacterJson) => void,
  onError: (err?: unknown) => void,
) {
  const primary = `${JP_CHAR_DATA_BASE}/${encodeURIComponent(char)}.json`;
  fetch(primary)
    .then(r => {
      if (!r.ok) throw new Error(`CDN ${r.status}`);
      return r.json() as Promise<CharacterJson>;
    })
    .then(data => {
      if (!data?.strokes?.length || !data?.medians?.length) {
        throw new Error('JSON không hợp lệ');
      }
      onLoad(data);
    })
    .catch(() => {
      fetch(jpCharDataFallbackUrl(char))
        .then(r => {
          if (!r.ok) throw new Error(`Fallback ${r.status}`);
          return r.json() as Promise<CharacterJson>;
        })
        .then(data => {
          if (!data?.strokes?.length || !data?.medians?.length) {
            throw new Error('JSON fallback không hợp lệ');
          }
          onLoad(data);
        })
        .catch(onError);
    });
}
