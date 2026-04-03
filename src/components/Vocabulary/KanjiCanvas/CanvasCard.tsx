import { HandWritingDto } from '#/api/requests';
import * as hiraganaKit from '#/shared/lib/hiraganaCanvasKit';
import { fetchKanaCharData, type KanaKind } from '#/shared/lib/kanaStrokeApi';
import type { KanaCharData } from '#/shared/lib/katakanaCanvasKit';
import * as katakanaKit from '#/shared/lib/katakanaCanvasKit';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type TouchEvent,
} from 'react';

const TEMPLATE_STROKE_GRAY = '#64748b';
const FREE_DRAW_TRAIL_COLOR = '#64748b';

export type CanvasCardProps = {
  kind: HandWritingDto.kind;
  char: string;
  onComplete: () => void;
  onStrokeComplete?: (strokeIdx: number) => void;
  onDrawStart?: () => void;
  /**
   * Khi true: có thể chọn thứ tự nét (nét gần điểm chạm nhất), nét mẫu chỉ xám,
   * không gợi ý nét hiện tại; vẫn phải bám median và đạt tiến độ như chế độ học.
   */
  freeStrokeGuide?: boolean;
};

function CanvasCard({
  kind,
  char,
  onComplete,
  onStrokeComplete,
  onDrawStart,
  freeStrokeGuide = false,
}: CanvasCardProps) {
  const viewBox =
    kind === HandWritingDto.kind.KATAKANA
      ? katakanaKit.KATAKANA_VIEW_BOX
      : hiraganaKit.HIRAGANA_VIEW_BOX;

  const HIT_THRESHOLD =
    kind === 'KATAKANA' ? katakanaKit.HIT_THRESHOLD : hiraganaKit.HIT_THRESHOLD;

  const MIN_PROGRESS =
    kind === 'KATAKANA' ? katakanaKit.MIN_PROGRESS : hiraganaKit.MIN_PROGRESS;

  const keyChar = katakanaKit.firstKanaGrapheme(char);
  const isNearMedian =
    kind === 'KATAKANA' ? katakanaKit.isNearMedian : hiraganaKit.isNearMedian;
  const getMedianProgress =
    kind === 'KATAKANA'
      ? katakanaKit.getMedianProgress
      : hiraganaKit.getMedianProgress;
  const medianArrowHint =
    kind === 'KATAKANA'
      ? katakanaKit.medianArrowHint
      : hiraganaKit.medianArrowHint;

  const [kana, setKana] = useState<KanaCharData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [currentStroke, setCurrentStroke] = useState(0);
  const [completedTrails, setCompletedTrails] = useState<unknown[]>([]);
  const [completedStrokeIndices, setCompletedStrokeIndices] = useState<
    Set<number>
  >(() => new Set());
  const [activeGuideIndex, setActiveGuideIndex] = useState<number | null>(null);
  const [allDone, setAllDone] = useState(false);
  const [feedback, setFeedback] = useState<'error' | 'success' | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const isDrawing = useRef(false);
  const trail = useRef<{ x: number; y: number }[]>([]);
  const lastProg = useRef(0);
  const offPath = useRef(false);
  const strokeDone = useRef(false);
  const activeStrokeIndexRef = useRef(0);

  const resetDrawing = useCallback(() => {
    setCurrentStroke(0);
    setCompletedTrails([]);
    setCompletedStrokeIndices(new Set());
    setActiveGuideIndex(null);
    setAllDone(false);
    setFeedback(null);
    trail.current = [];
    lastProg.current = 0;
    offPath.current = false;
    strokeDone.current = false;
    isDrawing.current = false;
  }, [viewBox]);

  useEffect(() => {
    resetDrawing();
  }, [keyChar, kind, resetDrawing]);

  useEffect(() => {
    if (!keyChar) {
      setKana(null);
      setLoadError(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    setKana(null);

    const k: KanaKind =
      kind === HandWritingDto.kind.KATAKANA ? 'KATAKANA' : 'HIRAGANA';
    (async () => {
      const data = await fetchKanaCharData(k, keyChar);
      if (cancelled) return;
      if (!data) {
        setKana(null);
        setLoadError(
          `Không tải được nét ${kind === 'KATAKANA' ? 'katakana' : 'hiragana'}.`,
        );
      } else {
        setKana(data);
        setLoadError(null);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [keyChar, kind]);

  const total = kana?.strokes.length ?? 0;
  const strokeIndex = freeStrokeGuide
    ? (activeGuideIndex ?? currentStroke)
    : currentStroke;
  const stroke = kana?.strokes[strokeIndex];

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.width === 0 || !kana) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const drawPoly = (
      pts: { x: number; y: number }[],
      color: string,
      lw: number,
    ) => {
      if (pts.length < 2) return;
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = lw * (canvas.width / viewBox);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = color;
      ctx.shadowBlur = 6 * (canvas.width / viewBox);
      ctx.beginPath();
      pts.forEach((p, i) =>
        i === 0
          ? ctx.moveTo(
              (p.x * canvas.width) / viewBox,
              (p.y * canvas.height) / viewBox,
            )
          : ctx.lineTo(
              (p.x * canvas.width) / viewBox,
              (p.y * canvas.height) / viewBox,
            ),
      );
      ctx.stroke();
      ctx.restore();
    };

    completedTrails.forEach(() => {
      /* nét xanh đã vẽ trên SVG path — canvas chỉ vẽ tạm khi kéo */
    });
    const t = trail.current;
    if (t.length > 1) {
      const c = offPath.current
        ? '#f87171'
        : freeStrokeGuide
          ? FREE_DRAW_TRAIL_COLOR
          : '#38bdf8';
      drawPoly(t, c, 7);
    }
  }, [completedTrails, kana, viewBox, freeStrokeGuide]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      drawCanvas();
    });
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [drawCanvas]);

  useEffect(() => {
    drawCanvas();
  }, [completedTrails, drawCanvas, currentStroke, allDone]);

  const svgCoords = useCallback(
    (e: MouseEvent | TouchEvent) => {
      const svg = svgRef.current;
      if (!svg) return { x: 0, y: 0 };
      const r = svg.getBoundingClientRect();
      const cx =
        'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const cy =
        'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      return {
        x: ((cx - r.left) / r.width) * viewBox,
        y: ((cy - r.top) / r.height) * viewBox,
      };
    },
    [viewBox],
  );

  const onDown = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!kana || allDone || strokeDone.current) return;
      e.preventDefault();
      const pt = svgCoords(e);

      if (freeStrokeGuide) {
        const incomplete = Array.from({ length: total }, (_, i) => i).filter(
          i => !completedStrokeIndices.has(i),
        );
        if (incomplete.length === 0) return;
        let best = incomplete[0];
        let bestD = Infinity;
        for (const i of incomplete) {
          const m0 = kana.strokes[i]?.median?.[0];
          if (!m0) continue;
          const d = Math.hypot(pt.x - m0.x, pt.y - m0.y);
          if (d < bestD) {
            bestD = d;
            best = i;
          }
        }
        const start = kana.strokes[best]?.median?.[0];
        if (
          !start ||
          Math.hypot(pt.x - start.x, pt.y - start.y) > HIT_THRESHOLD + 12
        ) {
          setFeedback('error');
          setTimeout(() => setFeedback(null), 700);
          return;
        }
        activeStrokeIndexRef.current = best;
        setActiveGuideIndex(best);
      } else {
        const s = kana.strokes[currentStroke];
        if (!s) return;
        const sp = s.median[0];
        if (Math.hypot(pt.x - sp.x, pt.y - sp.y) > HIT_THRESHOLD + 12) {
          setFeedback('error');
          setTimeout(() => setFeedback(null), 700);
          return;
        }
      }

      isDrawing.current = true;
      onDrawStart?.();
      trail.current = [pt];
      lastProg.current = 0;
      offPath.current = false;
      strokeDone.current = false;
      setFeedback(null);
      drawCanvas();
    },
    [
      allDone,
      kana,
      total,
      currentStroke,
      completedStrokeIndices,
      svgCoords,
      drawCanvas,
      freeStrokeGuide,
      HIT_THRESHOLD,
    ],
  );

  const onMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!kana || !isDrawing.current || allDone) return;
      const idx = freeStrokeGuide
        ? activeStrokeIndexRef.current
        : currentStroke;
      const strokeNow = kana.strokes[idx];
      if (!strokeNow) return;
      e.preventDefault();
      const pt = svgCoords(e);
      if (!isNearMedian(strokeNow.median, pt.x, pt.y)) {
        offPath.current = true;
        trail.current = [...trail.current, pt];
        isDrawing.current = false;
        drawCanvas();
        setFeedback('error');
        setTimeout(() => {
          setFeedback(null);
          trail.current = [];
          lastProg.current = 0;
          offPath.current = false;
          drawCanvas();
        }, 700);
        return;
      }
      const prog = getMedianProgress(strokeNow.median, pt.x, pt.y);
      if (prog > lastProg.current) lastProg.current = prog;
      trail.current = [...trail.current, pt];
      drawCanvas();
    },
    [
      allDone,
      kana,
      svgCoords,
      drawCanvas,
      freeStrokeGuide,
      currentStroke,
      isNearMedian,
      getMedianProgress,
    ],
  );

  const onUp = useCallback(() => {
    if (!kana || !isDrawing.current) return;
    const idx = freeStrokeGuide ? activeStrokeIndexRef.current : currentStroke;
    const strokeNow = kana.strokes[idx];
    if (!strokeNow) return;
    isDrawing.current = false;
    const strokeComplete = lastProg.current >= MIN_PROGRESS;
    if (strokeComplete) {
      strokeDone.current = true;
      setFeedback('success');
      const finished = [...trail.current];
      if (freeStrokeGuide) {
        setCompletedTrails(prev => [...prev, { points: finished }]);
        setCompletedStrokeIndices(prev => {
          const n = new Set(prev).add(idx);
          onStrokeComplete?.(idx);
          setActiveGuideIndex(null);
          if (n.size >= total) {
            setAllDone(true);
            onComplete();
          }
          return n;
        });
      } else {
        const next = currentStroke + 1;
        setCompletedTrails(prev => [...prev, { points: finished }]);
        if (next >= total) {
          setAllDone(true);
          onComplete();
        } else {
          setCurrentStroke(next);
        }
      }
      trail.current = [];
      lastProg.current = 0;
      offPath.current = false;
      drawCanvas();
      setTimeout(() => {
        strokeDone.current = false;
        setFeedback(null);
      }, 500);
    } else {
      trail.current = [];
      lastProg.current = 0;
      drawCanvas();
    }
  }, [
    currentStroke,
    total,
    drawCanvas,
    kana,
    onComplete,
    onStrokeComplete,
    onDrawStart,
    keyChar,
    freeStrokeGuide,
    MIN_PROGRESS,
  ]);

  if (!keyChar) {
    return (
      <div
        style={{
          padding: 16,
          textAlign: 'center',
          color: '#94a3b8',
          fontSize: 13,
          border: '1px dashed #e5e7eb',
          borderRadius: 12,
          maxWidth: viewBox,
        }}
      >
        Chưa có ký tự để vẽ.
      </div>
    );
  }

  if (loading) {
    return (
      <div
        style={{
          width: viewBox,
          maxWidth: '100%',
          padding: 24,
          textAlign: 'center',
          color: '#94a3b8',
          fontSize: 13,
        }}
      >
        Đang tải nét…
      </div>
    );
  }

  if (loadError || !kana || total === 0) {
    return (
      <div
        style={{
          padding: 16,
          textAlign: 'center',
          color: '#94a3b8',
          fontSize: 13,
          border: '1px dashed #e5e7eb',
          borderRadius: 12,
          maxWidth: viewBox,
        }}
      >
        {loadError ??
          `Không có dữ liệu nét ${kind === 'KATAKANA' ? 'katakana' : 'hiragana'} cho “${char || '…'}”.`}
      </div>
    );
  }

  const renderStroke =
    kana.strokes[Math.min(strokeIndex, Math.max(0, total - 1))];
  const med = renderStroke.median;
  const { angle: arrowAngle, pt: arrowPt } = medianArrowHint(med);
  const startPt = med[0];
  const borderColor =
    feedback === 'error'
      ? '#f87171'
      : feedback === 'success'
        ? '#4ade80'
        : 'transparent';

  return (
    <div style={{ width: viewBox, maxWidth: '100%', margin: '0 auto' }}>
      <div
        style={{
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,.08)',
          background: '#fff',
          position: 'relative',
          border: `2px solid ${borderColor}`,
          transition: 'border-color .15s',
          aspectRatio: '1',
        }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${viewBox} ${viewBox}`}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            touchAction: 'none',
            cursor: 'crosshair',
          }}
          onMouseDown={onDown}
          onMouseMove={onMove}
          onMouseUp={onUp}
          onMouseLeave={onUp}
          onTouchStart={onDown}
          onTouchMove={onMove}
          onTouchEnd={onUp}
        >
          <line
            x1="160"
            y1="10"
            x2="160"
            y2="310"
            stroke="#e5e7eb"
            strokeWidth="1"
            strokeDasharray="5 4"
          />
          <line
            x1="10"
            y1="160"
            x2="310"
            y2="160"
            stroke="#e5e7eb"
            strokeWidth="1"
            strokeDasharray="5 4"
          />
          <g
            opacity={freeStrokeGuide ? 0.18 : 0.12}
            fill="none"
            stroke={TEMPLATE_STROKE_GRAY}
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {kana.strokes.map((s: any, i: number) => (
              <path key={i} d={s.scaledPath} />
            ))}
          </g>
          {(freeStrokeGuide
            ? Array.from(completedStrokeIndices).sort((a, b) => a - b)
            : Array.from({ length: completedTrails.length }, (_, i) => i)
          ).map((idx: number) => {
            const s = kana.strokes[idx];
            if (!s) return null;
            return (
              <path
                key={`done-${idx}`}
                d={s.scaledPath}
                fill="none"
                stroke="#4ade80"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="9"
              />
            );
          })}
          {!allDone &&
          stroke &&
          (!freeStrokeGuide || activeGuideIndex !== null) ? (
            <path
              d={stroke.scaledPath}
              fill="none"
              stroke="#93c5fd"
              strokeDasharray="16 10"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="9"
            />
          ) : null}
          {!freeStrokeGuide && !allDone && med.length >= 2 && (
            <g
              transform={`translate(${arrowPt.x},${arrowPt.y}) rotate(${arrowAngle})`}
            >
              <polygon points="-10,-6 3,0 -10,6" fill="#60a5fa" opacity="0.9" />
            </g>
          )}
          {!freeStrokeGuide && !allDone && !strokeDone.current && (
            <g>
              <circle
                cx={startPt.x}
                cy={startPt.y}
                r="22"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2"
              >
                <animate
                  attributeName="r"
                  values="18;28;18"
                  dur="1.4s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.6;0;0.6"
                  dur="1.4s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx={startPt.x} cy={startPt.y} r="17" fill="#1cb0f6" />
            </g>
          )}
          {!allDone && (
            <text x="12" y="312" fill="#94a3b8" fontSize="11" fontWeight="700">
              {freeStrokeGuide
                ? `Đã vẽ ${completedStrokeIndices.size}/${total}`
                : `Nét ${currentStroke + 1}/${total}${
                    renderStroke.label ? ` · ${renderStroke.label}` : ''
                  }`}
            </text>
          )}
        </svg>
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            borderRadius: 14,
          }}
        />
      </div>
    </div>
  );
}

export default CanvasCard;
