const EOCD_SIG = 0x06054b50;
const CEN_SIG = 0x02014b50;
const SLIDE_RE = /^ppt\/slides\/slide\d+\.xml$/i;

function findEocdOffset(view: DataView): number {
  const n = view.byteLength;
  const maxScan = Math.min(65557, n);
  for (let i = n - 22; i >= n - maxScan; i--) {
    if (view.getUint32(i, true) === EOCD_SIG) return i;
  }
  return -1;
}

/** Đếm `ppt/slides/slideN.xml` từ buffer ZIP (PPTX = OOXML). */
export function countPptxSlidesFromArrayBuffer(
  buffer: ArrayBuffer,
): number | null {
  const view = new DataView(buffer);
  const eocd = findEocdOffset(view);
  if (eocd < 0) return null;

  const cdOffset = view.getUint32(eocd + 16, true);
  const cdSize = view.getUint32(eocd + 12, true);
  const end = cdOffset + cdSize;

  let offset = cdOffset;
  let count = 0;

  while (offset + 46 <= end && offset + 46 <= view.byteLength) {
    if (view.getUint32(offset, true) !== CEN_SIG) break;

    const nameLen = view.getUint16(offset + 28, true);
    const extraLen = view.getUint16(offset + 30, true);
    const commentLen = view.getUint16(offset + 32, true);

    const nameStart = offset + 46;
    const nameBytes = new Uint8Array(buffer, nameStart, nameLen);
    const name = new TextDecoder('utf-8').decode(nameBytes);
    if (SLIDE_RE.test(name)) count += 1;

    offset += 46 + nameLen + extraLen + commentLen;
  }

  return count > 0 ? count : null;
}

/**
 * Đếm số slide trong .pptx bằng cách đọc tên file trong ZIP.
 * Cần URL cho phép CORS. Thất bại (CORS, không phải ZIP) → null.
 */
export async function countPptxSlidesFromUrl(
  url: string,
): Promise<number | null> {
  try {
    const res = await fetch(url, { mode: 'cors', credentials: 'omit' });
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    return countPptxSlidesFromArrayBuffer(buf);
  } catch {
    return null;
  }
}
