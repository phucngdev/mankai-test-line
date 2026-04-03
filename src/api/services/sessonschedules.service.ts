import { jsonAxios } from '#/api/axios/axios';

export const getSessonSchedulesService = async (
  classId: string,
  courseId: string,
  limit: number,
  offset: number,
) =>
  await jsonAxios.get(
    `student/sesson-schedules?classId=${classId}&courseId=${courseId}&limit=${limit}&offset=${offset}`,
  );
