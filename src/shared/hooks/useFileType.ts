import { useMemo } from 'react';

type FileType = 'image' | 'pdf' | 'doc' | 'youtube' | 'video' | 'unknown';

export const useFileType = (url?: string): FileType => {
  return useMemo(() => {
    if (!url) return 'unknown';

    const lowerUrl = url.toLowerCase();

    // youtube
    if (
      lowerUrl.includes('youtube.com/watch') ||
      lowerUrl.includes('youtu.be/')
    ) {
      return 'youtube';
    }

    // image
    if (/\.(jpg|jpeg|png|gif|webp|svg)$/.test(lowerUrl)) {
      return 'image';
    }

    // pdf
    if (lowerUrl.endsWith('.pdf')) {
      return 'pdf';
    }

    // doc
    if (/\.(doc|docx)$/.test(lowerUrl)) {
      return 'doc';
    }

    // video
    if (/\.(mp4|webm|ogg)$/.test(lowerUrl)) {
      return 'video';
    }

    return 'unknown';
  }, [url]);
};
