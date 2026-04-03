export interface SubtitleItem {
  id: string;
  startTime: number;
  endTime: number;
  textVn: string;
  textJp: string;
}

export interface TimeQuestion {
  _id: string;
  timer: number;
  idQuestion: any; // Using any for now to avoid circular dependency or complex imports, but will refine if needed
}

export interface VideoProps {
  lessonId: string;
  onClickNext: () => void;
  subtitles?: SubtitleItem[]; // Optional prop for when API is ready
  timeQuestion?: TimeQuestion[];
}
