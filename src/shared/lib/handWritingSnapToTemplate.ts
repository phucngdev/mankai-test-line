/** Chiếu điểm lên polyline (median mẫu) — dùng cho viết tay bám nét */

export type Point2 = { x: number; y: number };

export function projectPointOntoPolyline(
  pts: Point2[],
  x: number,
  y: number,
): Point2 & { dist: number } {
  if (pts.length === 0) return { x, y, dist: Infinity };
  if (pts.length === 1) {
    const d = Math.hypot(x - pts[0].x, y - pts[0].y);
    return { x: pts[0].x, y: pts[0].y, dist: d };
  }
  let bx = pts[0].x;
  let by = pts[0].y;
  let bestD = Infinity;
  for (let i = 0; i < pts.length - 1; i++) {
    const ax = pts[i].x;
    const ay = pts[i].y;
    const px = pts[i + 1].x;
    const py = pts[i + 1].y;
    const dx = px - ax;
    const dy = py - ay;
    const lenSq = dx * dx + dy * dy;
    const t =
      lenSq === 0
        ? 0
        : Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / lenSq));
    const qx = ax + t * dx;
    const qy = ay + t * dy;
    const d = Math.hypot(x - qx, y - qy);
    if (d < bestD) {
      bestD = d;
      bx = qx;
      by = qy;
    }
  }
  return { x: bx, y: by, dist: bestD };
}

/** Chọn nét mẫu có khoảng cách tới (x,y) nhỏ nhất; trả về điểm đã chiếu lên nét đó */
export function pickNearestTemplateStroke(
  medians: Point2[][],
  x: number,
  y: number,
): { strokeIndex: number; x: number; y: number } {
  if (!medians.length) return { strokeIndex: 0, x, y };
  let bestI = 0;
  let bestX = x;
  let bestY = y;
  let bestDist = Infinity;
  medians.forEach((pts, i) => {
    const p = projectPointOntoPolyline(pts, x, y);
    if (p.dist < bestDist) {
      bestDist = p.dist;
      bestI = i;
      bestX = p.x;
      bestY = p.y;
    }
  });
  return { strokeIndex: bestI, x: bestX, y: bestY };
}

/** Chuẩn hoá medians từ hanzi-writer JSON (1024) sang viewBox (320) */
export function kanjiMediansJsonToViewBox(
  medians: number[][][],
  viewBox = 320,
): Point2[][] {
  const scale = viewBox / 1024;
  return medians.map(stroke =>
    stroke.map(pt => ({
      x: pt[0] * scale,
      y: pt[1] * scale,
    })),
  );
}
