import audioSlice from '#/shared/redux/slices/AudioSlice';
import classSlice from '#/shared/redux/slices/ClassSlice';
import courseSlice from '#/shared/redux/slices/CourseSlice';
import essayTestSlice from '#/shared/redux/slices/EssayTestSlice';
import examLessonSlice from '#/shared/redux/slices/ExamLessonSlice';
import examResultSlice from '#/shared/redux/slices/ExamResultSlice';
import examSlice from '#/shared/redux/slices/ExamSlice';
import flashCardSlice from '#/shared/redux/slices/FlashCardSlice';
import forumSlice from '#/shared/redux/slices/ForumSlice';
import grammarSlice from '#/shared/redux/slices/GrammarSlice';
import kanjiSlice from '#/shared/redux/slices/KanjiSlice';
import lessionSlice from '#/shared/redux/slices/LessionSlice';
import listenSlice from '#/shared/redux/slices/ListenSlice';
import mockTestDetailSlice from '#/shared/redux/slices/MockTestDetailSlice';
import mockTestSlice from '#/shared/redux/slices/MockTestSlice';
import notficationSlice from '#/shared/redux/slices/NotificationSlice';
import practiceSlice from '#/shared/redux/slices/PracticeSlice';
import questionSlice from '#/shared/redux/slices/QuestionSlice';
import quizflashCardSlice from '#/shared/redux/slices/QuizFlashCardSlice';
import readingSlice from '#/shared/redux/slices/ReadingSlice';
import sessionSlice from '#/shared/redux/slices/SessionSlice';
import sessonSchedulesSlice from '#/shared/redux/slices/SessonSchedulesSlice';
import slideSlice from '#/shared/redux/slices/SlideSlice';
import textSlice from '#/shared/redux/slices/TextSlice';
import topicSlice from '#/shared/redux/slices/TopicSlice';
import topicVocabSlice from '#/shared/redux/slices/TopicVocabSlice';
import userSlice from '#/shared/redux/slices/UserSlice';
import videoSlice from '#/shared/redux/slices/VideoSlice';
import vocabSlice from '#/shared/redux/slices/VocabularySlice';
import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';

const store = configureStore({
  reducer: {
    audio: audioSlice,
    class: classSlice,
    course: courseSlice,
    essayTest: essayTestSlice,
    exam: examSlice,
    examLesson: examLessonSlice,
    examResult: examResultSlice,
    flashCard: flashCardSlice,
    forum: forumSlice,
    grammar: grammarSlice,
    kanji: kanjiSlice,
    lession: lessionSlice,
    listen: listenSlice,
    mockTest: mockTestSlice,
    mockTestDetail: mockTestDetailSlice,
    practice: practiceSlice,
    question: questionSlice,
    quizflashCard: quizflashCardSlice,
    notification: notficationSlice,
    reading: readingSlice,
    session: sessionSlice,
    sessonSchedules: sessonSchedulesSlice,
    slide: slideSlice,
    text: textSlice,
    topic: topicSlice,
    topicVocab: topicVocabSlice,
    user: userSlice,
    video: videoSlice,
    vocab: vocabSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();

export default store;
