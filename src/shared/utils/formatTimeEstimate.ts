/**
 * Formats a duration given in **seconds**.
 * - Under 1 minute: `00:ss`
 * - Under 1 hour: `m:ss` (minutes unpadded when ≥ 10)
 * - 1 hour or more: `h:mm:ss` (minutes and seconds zero-padded)
 */
export function formatTimeEstimateSeconds(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return '—';
  }
  const s = Math.floor(totalSeconds);
  if (s < 60) {
    return `00:${String(s).padStart(2, '0')}`;
  }
  if (s < 3600) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  }
  const h = Math.floor(s / 3600);
  const rem = s % 3600;
  const m = Math.floor(rem / 60);
  const sec = rem % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}
