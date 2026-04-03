import { useState, useRef, useEffect, useCallback } from 'react';
import {
  HIT_THRESHOLD,
  KANA_CHARACTERS,
  KANA_DATA,
  MIN_PROGRESS,
  getMedianProgress,
  isNearMedian,
  medianArrowHint,
} from '#/shared/lib/katakanaCanvasKit';

const CHARACTERS = KANA_CHARACTERS;

const PrintCanvas = () => {
  const [charIndex, setCharIndex] = useState(0);
  const [currentStroke, setCurrentStroke] = useState(0);
  const [completedStrokes, setCompletedStrokes] = useState(0); // ← đổi từ completedTrails
  const [allDone, setAllDone] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [, forceUpdate] = useState(0);

  const canvasRef = useRef(null);
  const svgRef = useRef(null);
  const isDrawing = useRef(false);
  const trail = useRef([]);
  const lastProg = useRef(0);
  const offPath = useRef(false);
  const strokeDone = useRef(false);

  const char = CHARACTERS[charIndex];
  const kana = KANA_DATA[char];
  const total = kana.strokes.length;
  const stroke = kana.strokes[currentStroke];

  // ── Canvas ──────────────────────────────────────────────────────────────────
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.width === 0) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const drawPoly = (pts: any, color: string, lw: any) => {
      if (pts.length < 2) return;
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = lw * (canvas.width / 320);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = color;
      ctx.shadowBlur = 6 * (canvas.width / 320);
      ctx.beginPath();
      pts.forEach((p: any, i: number) =>
        i === 0
          ? ctx.moveTo((p.x * canvas.width) / 320, (p.y * canvas.height) / 320)
          : ctx.lineTo((p.x * canvas.width) / 320, (p.y * canvas.height) / 320),
      );
      ctx.stroke();
      ctx.restore();
    };

    // Chỉ vẽ trail đang vẽ — completed strokes do SVG scaledPath handle
    const t = trail.current;
    if (t.length > 1) drawPoly(t, offPath.current ? '#f87171' : '#38bdf8', 7);
  }, []); // ← không phụ thuộc completedStrokes nữa

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
  }, [completedStrokes, drawCanvas]); // ← trigger lại khi stroke xong để clear canvas

  const svgCoords = useCallback(e => {
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
    e => {
      if (allDone || strokeDone.current) return;
      e.preventDefault();
      const pt = svgCoords(e);
      const sp = stroke.median[0];
      if (Math.hypot(pt.x - sp.x, pt.y - sp.y) > HIT_THRESHOLD + 12) {
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
    [allDone, stroke, svgCoords, drawCanvas],
  );

  const onMove = useCallback(
    e => {
      if (!isDrawing.current || allDone) return;
      e.preventDefault();
      const pt = svgCoords(e);

      if (!isNearMedian(stroke.median, pt.x, pt.y)) {
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

      const prog = getMedianProgress(stroke.median, pt.x, pt.y);
      if (prog > lastProg.current) lastProg.current = prog;
      trail.current = [...trail.current, pt];
      drawCanvas();
    },
    [allDone, stroke, svgCoords, drawCanvas],
  );

  const onUp = useCallback(() => {
    if (!isDrawing.current) return;
    isDrawing.current = false;

    if (lastProg.current >= MIN_PROGRESS) {
      strokeDone.current = true;
      setFeedback('success');

      setTimeout(() => {
        const next = currentStroke + 1;

        // ← Snap: xóa trail tay, tăng completedStrokes → SVG tự render scaledPath
        trail.current = [];
        lastProg.current = 0;
        offPath.current = false;
        strokeDone.current = false;
        setFeedback(null);
        setCompletedStrokes(prev => prev + 1);

        if (next >= total) {
          setAllDone(true);
          setScore(s => s + 10 + combo * 2);
          setCombo(c => c + 1);
        } else {
          setCurrentStroke(next);
        }
      }, 500);
    } else {
      trail.current = [];
      lastProg.current = 0;
      drawCanvas();
    }
  }, [currentStroke, total, combo, drawCanvas]);

  // ── Reset ────────────────────────────────────────────────────────────────────
  const fullReset = useCallback(
    (idx = charIndex) => {
      setCharIndex(idx);
      setCurrentStroke(0);
      setCompletedStrokes(0); // ← reset về 0
      setAllDone(false);
      setFeedback(null);
      trail.current = [];
      lastProg.current = 0;
      offPath.current = false;
      strokeDone.current = false;
      forceUpdate(n => n + 1);
    },
    [charIndex],
  );

  const med = stroke.median;
  const { angle: arrowAngle, pt: arrowPt } = medianArrowHint(med);
  const startPt = med[0];

  const borderColor =
    feedback === 'error'
      ? '#f87171'
      : feedback === 'success'
        ? '#4ade80'
        : 'transparent';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg,#f0f7ff,#e8f4ff)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Nunito','Segoe UI',sans-serif",
        padding: 16,
        userSelect: 'none',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 14,
        }}
      >
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {combo > 1 && (
            <div
              style={{
                background: 'linear-gradient(135deg,#ff9500,#ff6000)',
                color: 'white',
                borderRadius: 20,
                padding: '3px 11px',
                fontSize: 13,
                fontWeight: 800,
              }}
            >
              🔥 {combo}x
            </div>
          )}
          <div
            style={{
              background: 'white',
              borderRadius: 20,
              padding: '3px 13px',
              fontSize: 14,
              fontWeight: 700,
              color: '#374151',
              boxShadow: '0 2px 8px rgba(0,0,0,.07)',
            }}
          >
            ⭐ {score}
          </div>
        </div>
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: 400,
          background: 'white',
          borderRadius: 18,
          padding: '12px 18px',
          marginBottom: 12,
          boxShadow: '0 3px 16px rgba(0,0,0,.06)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'linear-gradient(135deg,#1cb0f6,#0095d5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            flexShrink: 0,
          }}
        >
          🔊
        </div>
        <div>
          <div
            style={{
              fontSize: 11,
              color: '#9ca3af',
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            {kana.reading.toUpperCase()}
          </div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 900,
              color: '#111827',
              lineHeight: 1.1,
            }}
          >
            {char}
          </div>
        </div>
        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            gap: 7,
            alignItems: 'center',
          }}
        >
          {kana.strokes.map((_: any, i: number) => {
            const done = i < currentStroke || allDone;
            const active = i === currentStroke && !allDone;
            return (
              <div
                key={i}
                style={{
                  width: active ? 12 : 10,
                  height: active ? 12 : 10,
                  borderRadius: '50%',
                  background: done ? '#4ade80' : active ? '#1cb0f6' : '#e5e7eb',
                  transition: 'all .3s',
                  boxShadow: active ? '0 0 0 3px rgba(28,176,246,.2)' : 'none',
                }}
              />
            );
          })}
        </div>
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: 400,
          borderRadius: 22,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,.09)',
          background: 'white',
          position: 'relative',
          border: `3px solid ${borderColor}`,
          transition: 'border-color .15s',
          aspectRatio: '1',
        }}
      >
        {/* {allDone && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 20,
              background: 'rgba(255,255,255,.93)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              borderRadius: 19,
            }}
          >
            <div style={{ fontSize: 60 }}>🎉</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#111827' }}>
              Xuất sắc!
            </div>
            <div style={{ fontSize: 14, color: '#6b7280' }}>
              Hoàn thành <strong>{char}</strong> ({kana.reading})
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
              <button
                onClick={() => {
                  setCombo(0);
                  fullReset();
                }}
                style={{
                  padding: '9px 18px',
                  borderRadius: 12,
                  border: '2px solid #e5e7eb',
                  background: 'white',
                  color: '#374151',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                🔄 Làm lại
              </button>
              <button
                onClick={() => fullReset((charIndex + 1) % CHARACTERS.length)}
                style={{
                  padding: '9px 22px',
                  borderRadius: 12,
                  border: 'none',
                  background: 'linear-gradient(135deg,#4ade80,#16a34a)',
                  color: 'white',
                  fontWeight: 900,
                  cursor: 'pointer',
                  fontSize: 14,
                  boxShadow: '0 4px 12px rgba(74,222,128,.3)',
                }}
              >
                Tiếp →
              </button>
            </div>
          </div>
        )} */}

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

          {/* Current stroke guide (dashed) */}
          {!allDone && (
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

          {/* Direction arrow */}
          {!allDone && med.length >= 2 && (
            <g
              transform={`translate(${arrowPt.x},${arrowPt.y}) rotate(${arrowAngle})`}
            >
              <polygon points="-10,-6 3,0 -10,6" fill="#60a5fa" opacity="0.9" />
            </g>
          )}

          {/* Animated start circle */}
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

          {/* Stroke info */}
          {!allDone && (
            <text x="12" y="312" fill="#94a3b8" fontSize="11" fontWeight="700">
              Nét {currentStroke + 1}/{total} · {stroke.label}
            </text>
          )}
        </svg>

        {/* Canvas: chỉ vẽ trail đang vẽ (in-progress) */}
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
      </div>

      {/* Feedback */}
      <div
        style={{
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
          ? '❌ Ra ngoài nét! Thử lại từ ●'
          : feedback === 'success'
            ? '✅ Tuyệt vời!'
            : 'Nhấn ● rồi kéo theo đường chấm ---→'}
      </div>

      {/* Char picker */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginTop: 14,
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: 400,
        }}
      >
        {CHARACTERS.map((c, i) => (
          <button
            key={c}
            onClick={() => fullReset(i)}
            style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              border:
                i === charIndex ? '2.5px solid #1cb0f6' : '2px solid #e5e7eb',
              background: i === charIndex ? '#eff9ff' : 'white',
              color: i === charIndex ? '#1cb0f6' : '#4b5563',
              fontWeight: 800,
              fontSize: 20,
              cursor: 'pointer',
              transition: 'all .2s',
              boxShadow:
                i === charIndex ? '0 2px 10px rgba(28,176,246,.18)' : 'none',
            }}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PrintCanvas;
