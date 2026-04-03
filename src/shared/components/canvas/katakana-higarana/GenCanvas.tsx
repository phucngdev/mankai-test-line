import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  HIT_THRESHOLD as KATA_HIT_THRESHOLD,
  MIN_PROGRESS as KATA_MIN_PROGRESS,
  getMedianProgress as kataGetMedianProgress,
  getKanaData as kataGetKanaData,
  isNearMedian as kataIsNearMedian,
  medianArrowHint as kataMedianArrowHint,
  firstKanaGrapheme as kataFirstKanaGrapheme,
  type KanaCharData,
} from '#/shared/lib/katakanaCanvasKit';
import {
  HIT_THRESHOLD as HIRA_HIT_THRESHOLD,
  MIN_PROGRESS as HIRA_MIN_PROGRESS,
  getMedianProgress as hiraGetMedianProgress,
  getKanaData as hiraGetKanaData,
  isNearMedian as hiraIsNearMedian,
  medianArrowHint as hiraMedianArrowHint,
  firstKanaGrapheme as hiraFirstKanaGrapheme,
} from '#/shared/lib/hiraganaCanvasKit';
import { HandWritingDto } from '#/api/requests';

interface GenCanvasProps {
  kind: HandWritingDto.kind;
  char: string;
  onComplete: () => void;
}

function GenCanvas({ kind, char, onComplete }: GenCanvasProps) {
  const [currentStroke, setCurrentStroke] = useState(0);
  const [completedStrokes, setCompletedStrokes] = useState(0);
  const [allDone, setAllDone] = useState(false);
  const [feedback, setFeedback] = useState<'error' | 'success' | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const isDrawing = useRef(false);
  const trail = useRef<Array<{ x: number; y: number }>>([]);
  const lastProg = useRef(0);
  const offPath = useRef(false);
  const strokeDone = useRef(false);

  const kit = useMemo(() => {
    if (kind === HandWritingDto.kind.KATAKANA) {
      return {
        getKanaData: kataGetKanaData,
        firstKanaGrapheme: kataFirstKanaGrapheme,
        HIT_THRESHOLD: KATA_HIT_THRESHOLD,
        MIN_PROGRESS: KATA_MIN_PROGRESS,
        isNearMedian: kataIsNearMedian,
        getMedianProgress: kataGetMedianProgress,
        medianArrowHint: kataMedianArrowHint,
      };
    }

    return {
      getKanaData: hiraGetKanaData,
      firstKanaGrapheme: hiraFirstKanaGrapheme,
      HIT_THRESHOLD: HIRA_HIT_THRESHOLD,
      MIN_PROGRESS: HIRA_MIN_PROGRESS,
      isNearMedian: hiraIsNearMedian,
      getMedianProgress: hiraGetMedianProgress,
      medianArrowHint: hiraMedianArrowHint,
    };
  }, [kind]);

  const displayChar = useMemo(() => kit.firstKanaGrapheme(char), [char, kit]);

  const kana: KanaCharData | null = useMemo(() => {
    if (!displayChar) return null;
    return kit.getKanaData(displayChar);
  }, [displayChar, kit]);

  const total = kana?.strokes.length ?? 0;
  const stroke = kana?.strokes[currentStroke] ?? null;
  const med = stroke?.median ?? [];

  // ---------------- Canvas drawing (trail while user is drawing) ----------------
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.width === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const drawPoly = (
      pts: Array<{ x: number; y: number }>,
      color: string,
      lw: number,
    ) => {
      if (pts.length < 2) return;
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = lw * (canvas.width / 320);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = color;
      ctx.shadowBlur = 6 * (canvas.width / 320);
      ctx.beginPath();
      pts.forEach((p, i) => {
        if (i === 0)
          ctx.moveTo((p.x * canvas.width) / 320, (p.y * canvas.height) / 320);
        else
          ctx.lineTo((p.x * canvas.width) / 320, (p.y * canvas.height) / 320);
      });
      ctx.stroke();
      ctx.restore();
    };

    const t = trail.current;
    if (t.length > 1) {
      drawPoly(t, offPath.current ? '#f87171' : '#38bdf8', 7);
    }
  }, []);

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

  // Reset when `kind` or `char` changes
  useEffect(() => {
    setCurrentStroke(0);
    setCompletedStrokes(0);
    setAllDone(false);
    setFeedback(null);
    trail.current = [];
    lastProg.current = 0;
    offPath.current = false;
    strokeDone.current = false;
    drawCanvas();
  }, [kind, displayChar, drawCanvas]);

  const svgCoords = useCallback((e: any) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const r = svg.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: ((cx - r.left) / r.width) * 320,
      y: ((cy - r.top) / r.height) * 320,
    };
  }, []);

  const onDown = useCallback(
    (e: any) => {
      if (allDone || strokeDone.current || !stroke) return;
      e.preventDefault();

      const pt = svgCoords(e);
      const sp = stroke.median?.[0];
      if (!sp) return;

      if (Math.hypot(pt.x - sp.x, pt.y - sp.y) > kit.HIT_THRESHOLD + 12) {
        setFeedback('error');
        setTimeout(() => setFeedback(null), 700);
        return;
      }

      isDrawing.current = true;
      trail.current = [pt];
      lastProg.current = 0;
      offPath.current = false;
      strokeDone.current = false;
      setFeedback(null);
      drawCanvas();
    },
    [allDone, drawCanvas, kit.HIT_THRESHOLD, stroke, svgCoords],
  );

  const onMove = useCallback(
    (e: any) => {
      if (!isDrawing.current || allDone || !stroke) return;
      e.preventDefault();

      const pt = svgCoords(e);

      if (!kit.isNearMedian(stroke.median, pt.x, pt.y)) {
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
          strokeDone.current = false;
          drawCanvas();
        }, 700);
        return;
      }

      const prog = kit.getMedianProgress(stroke.median, pt.x, pt.y);
      if (prog > lastProg.current) lastProg.current = prog;
      trail.current = [...trail.current, pt];
      drawCanvas();
    },
    [allDone, drawCanvas, kit, stroke, svgCoords],
  );

  const onUp = useCallback(() => {
    if (!isDrawing.current || !stroke) return;
    isDrawing.current = false;

    if (lastProg.current >= kit.MIN_PROGRESS) {
      strokeDone.current = true;
      setFeedback('success');

      setTimeout(() => {
        const next = currentStroke + 1;

        trail.current = [];
        drawCanvas(); // xoa trail tay o canva ngay khi ket thuc net
        lastProg.current = 0;
        offPath.current = false;
        strokeDone.current = false;
        setFeedback(null);
        setCompletedStrokes(prev => prev + 1);

        if (next >= total) {
          setAllDone(true);
          onComplete();
        } else {
          setCurrentStroke(next);
        }
      }, 500);
    } else {
      trail.current = [];
      lastProg.current = 0;
      drawCanvas();
    }
  }, [currentStroke, drawCanvas, kit.MIN_PROGRESS, stroke, total]);

  const borderColor =
    feedback === 'error'
      ? '#f87171'
      : feedback === 'success'
        ? '#4ade80'
        : 'transparent';

  const { angle: arrowAngle, pt: arrowPt } = kit.medianArrowHint(med);
  const startPt = med[0] ?? { x: 160, y: 160 };

  if (!kana || total === 0) {
    return (
      <div
        style={{
          width: '100%',
          aspectRatio: '1',
          position: 'relative',
          borderRadius: 19,
          border: '2px dashed #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6b7280',
          fontWeight: 700,
        }}
      >
        Khong co du lieu cho: {displayChar || char}
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        aspectRatio: '1',
        borderRadius: 22,
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,.09)',
        background: 'white',
        position: 'relative',
        border: `3px solid ${borderColor}`,
        transition: 'border-color .15s',
      }}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 320 320"
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
          opacity="0.12"
          fill="none"
          stroke="#64748b"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {kana.strokes.map((s: any, i: number) => (
            <path key={i} d={s.scaledPath} />
          ))}
        </g>

        {completedStrokes > 0 &&
          kana.strokes
            .slice(0, completedStrokes)
            .map((s: any, i: number) => (
              <path
                key={i}
                d={s.scaledPath}
                fill="none"
                stroke="#4ade80"
                strokeWidth="9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}

        {!allDone && stroke && (
          <path
            d={stroke.scaledPath}
            fill="none"
            stroke="#93c5fd"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="16 10"
          />
        )}

        {!allDone && med.length >= 2 && (
          <g
            transform={`translate(${arrowPt.x},${arrowPt.y}) rotate(${arrowAngle})`}
          >
            <polygon points="-10,-6 3,0 -10,6" fill="#60a5fa" opacity="0.9" />
          </g>
        )}

        {!allDone && !strokeDone.current && (
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
            Net {currentStroke + 1}/{total}
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
          borderRadius: 19,
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: -26,
          marginTop: 10,
          fontSize: 13,
          minHeight: 20,
          fontWeight: 600,
          textAlign: 'center',
          color:
            feedback === 'error'
              ? '#ef4444'
              : feedback === 'success'
                ? '#16a34a'
                : '#94a3b8',
        }}
      >
        {feedback === 'error'
          ? 'Ra ngoai net! Thu lai tu dau cham.'
          : feedback === 'success'
            ? 'Tuyet voi!'
            : 'Nhan dau cham roi keo theo duong cham ->'}
      </div>
    </div>
  );
}

export default GenCanvas;
