import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Empty, message } from 'antd';

import HeaderVocabulary from '../Header/HeaderVocabulary';
import MenuVocabulary from '../Menu/MenuVocabulary';
import FormVideo from '../FormVideo/FormVideo';
import FormText from '../FormText/FormText';
import FormExam from '../FormExam/FormExam';
import Hiragana from '../Hiragana/Hiragana';
import FormVocabulary from '../FormVocabulary/FormVocabulary';
import Kanji from '../Kanji/Kanji';
import Grammar from '../Grammar/Grammar';
import Practice from '../Practice/Practice';
import Reading from '../Reading/Reading';
import Listening from '../Listening/Listening';
import AppTrain from '../FlashCard/FormFlashCard';
import FormPDF from '../FormPDF/FormPDF';

import styles from './GlobalVocabulary.module.scss';
import {
  GrammarIcon,
  IconBook,
  IconExam,
  IconHeadphone,
  IconVocab,
  Pdf,
  PlayFlashCard,
  PlayVideo,
  ReadBookIcon,
} from '#/assets/svg/externalIcon';
import type { VocabularyItem } from '#/api/requests/interface/PropVocabulary/PropVocabulary';
import type { RootState } from '#/shared/redux/store';
import { useAppDispatch } from '#/shared/redux/store';
import { fetchAllLessionByIdCourse } from '#/shared/redux/thunk/LessionThunk';
import { LessonStudentEntity } from '#/api/requests';
import Loading from '#/shared/components/loading/Loading';
import HistoryExam from '../HistoryExam/HistoryExam';
import Cookies from 'js-cookie';
import { useResetDataOnLogout } from '#/shared/hooks/useResetDataOnLogout';
import { FloatingChatButton } from '../../floating-chat';
import Survey from '../Survey/Survey';

function GlobalVocabulary(): JSX.Element {
  const user = useResetDataOnLogout();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const data = useSelector((state: RootState) => {
    return state.lession.data;
  });
  const [loading, setLoading] = useState(false);
  const [hasTimeout, setHasTimeout] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { courseId, id, lessonId } = useParams<{
    courseId: string;
    id: string;
    lessonId: string;
  }>();
  const [reviewData, setReviewData] = useState<any>(null);

  const fetchaData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      await dispatch(fetchAllLessionByIdCourse({ id }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchaData();
  }, [id]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (loading) {
      timeout = setTimeout(() => {
        setHasTimeout(true);
      }, 10000); // 10 seconds
    } else {
      setHasTimeout(false);
    }

    return () => clearTimeout(timeout);
  }, [loading]);

  const getIconByType = (type: LessonStudentEntity.type): JSX.Element => {
    switch (type) {
      case LessonStudentEntity.type.VIDEO:
        return <PlayVideo />;
      case LessonStudentEntity.type.SLIDE:
        return <Pdf />;
      case LessonStudentEntity.type.TEXT:
        return <IconBook />;
      case LessonStudentEntity.type.AUDIO:
      case LessonStudentEntity.type.LISTENING:
        return <IconHeadphone />;
      case LessonStudentEntity.type.QUIZ:
      case LessonStudentEntity.type.PRACTICE_THROUGH:
        return <IconExam />;
      case LessonStudentEntity.type.READING:
        return <ReadBookIcon />;
      case LessonStudentEntity.type.HIRAGANA:
      case LessonStudentEntity.type.VOCAB:
        return <IconVocab />;
      case LessonStudentEntity.type.KANJI:
      case LessonStudentEntity.type.FLASH_CARD:
        return <PlayFlashCard />;
      case LessonStudentEntity.type.GRAMMAR:
        return <GrammarIcon />;
      case LessonStudentEntity.type.SURVEY:
        return <PlayFlashCard />;
      default:
        return <IconExam />;
    }
  };

  const menuItems: VocabularyItem[] = useMemo(() => {
    if (!Array.isArray(data)) return [];

    return data.map(item => ({
      icon: getIconByType(item.type),
      id: item.id,
      isRequired: item.isRequired,
      label: item.title,
      percent: item.progress,
      rawId: item.id,
      type: item.type,
      videoUrl: item.videoUrl,
    }));
  }, [data]);

  // redirect mặc định 1 lần khi vào page mà chưa có lessonId
  useEffect(() => {
    if (!lessonId && menuItems.length > 0) {
      navigate(`/vocabulary/${courseId}/${id}/${menuItems[0].rawId}`);
    }
  }, []);

  // mỗi khi lessonId thay đổi, set lại selectedId
  useEffect(() => {
    setSelectedId(lessonId || null);
    setReviewData(null);
  }, [lessonId]);

  const handleSelect = (rawId: string) => {
    navigate(`/vocabulary/${courseId}/${id}/${rawId}`, {
      replace: true,
      state: { from: location.state?.from || `/detail-course/${courseId}` }, // tránh tạo thêm history rác
    });
  };

  const handleNext = () => {
    if (!selectedId || menuItems.length === 0) return;
    const currentIndex = menuItems.findIndex(item => item.rawId === selectedId);
    const currentItem = menuItems[currentIndex];

    // Check if the current lesson is required and not fully completed
    if (currentItem.isRequired && currentItem.percent < 100) {
      message.warning(
        'Bạn phải hoàn thành bài học này 100% trước khi chuyển tiếp!',
      );
      return;
    }

    const nextIndex = (currentIndex + 1) % menuItems.length;
    const nextId = menuItems[nextIndex].rawId;
    setSelectedId(nextId);
    navigate(`/vocabulary/${courseId}/${id}/${nextId}`);
  };

  const currentItem = useMemo(
    () => menuItems.find(item => item.rawId === selectedId),
    [menuItems, selectedId],
  );

  // Determine if the current lesson is completed (for isAnyCompleted)
  const isAnyCompleted = useMemo(() => {
    if (!currentItem) return false;

    if (currentItem.isRequired) {
      return currentItem.percent >= 100;
    }

    return true; // Non-required lessons are considered "completed" for navigation
  }, [currentItem]);

  const renderForm = () => {
    if (!currentItem) {
      return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }

    const typeMap: Record<LessonStudentEntity.type, string> = {
      [LessonStudentEntity.type.VIDEO]: 'video',
      [LessonStudentEntity.type.SLIDE]: 'slide',
      [LessonStudentEntity.type.TEXT]: 'text',
      [LessonStudentEntity.type.AUDIO]: 'audio',
      [LessonStudentEntity.type.QUIZ]: 'quiz',
      [LessonStudentEntity.type.LISTENING]: 'listen',
      [LessonStudentEntity.type.READING]: 'reading',
      [LessonStudentEntity.type.HIRAGANA]: 'hiragana',
      [LessonStudentEntity.type.KATAKANA]: 'katakana',
      [LessonStudentEntity.type.VOCAB]: 'vocabulary',
      [LessonStudentEntity.type.COUNTVOCAB]: 'countvocab',
      [LessonStudentEntity.type.TESTVOCAB]: 'testvocab',
      [LessonStudentEntity.type.KANJI]: 'kanji',
      [LessonStudentEntity.type.GRAMMAR]: 'grammar',
      [LessonStudentEntity.type.PRACTICE_THROUGH]: 'practice',
      [LessonStudentEntity.type.FLASH_CARD]: 'flashcard',
      [LessonStudentEntity.type.FILE]: 'file',
      [LessonStudentEntity.type.HINAGAN]: 'hinagan',
      [LessonStudentEntity.type.SURVEY]: 'survey',
    };

    const mappedType = typeMap[currentItem.type] || '';

    const componentsByType: Record<string, JSX.Element> = {
      audio: (
        <FormExam
          isAnyCompleted={isAnyCompleted}
          key={currentItem.rawId}
          lessonId={currentItem.rawId}
          onClickNext={handleNext}
        />
      ),
      flashcard: (
        <AppTrain
          key={currentItem.rawId}
          lessonId={currentItem.rawId}
          onClickNext={handleNext}
        />
      ),
      grammar: <Grammar key={currentItem.rawId} lessonId={currentItem.rawId} />,
      hiragana: <Hiragana key={currentItem.rawId} />,
      kanji: <Kanji key={currentItem.rawId} lessonId={currentItem.rawId} />,
      listen: (
        <Listening
          key={currentItem.rawId}
          lessonId={currentItem.rawId}
          onClickNext={handleNext}
        />
      ),
      practice: (
        <Practice
          key={currentItem.rawId}
          lessonId={currentItem.rawId}
          onClickNext={handleNext}
        />
      ),
      quiz: (
        <FormExam
          isAnyCompleted={isAnyCompleted}
          key={currentItem.rawId}
          lessonId={currentItem.rawId}
          onClickNext={handleNext}
          reviewData={reviewData}
        />
      ),
      reading: (
        <Reading
          key={currentItem.rawId}
          lessonId={currentItem.rawId}
          onClickNext={handleNext}
        />
      ),
      slide: (
        <FormPDF
          key={currentItem.rawId}
          lessonId={currentItem.rawId}
          onClickNext={handleNext}
        />
      ),
      text: (
        <FormText
          key={currentItem.rawId}
          lessonId={currentItem.rawId}
          onClickNext={handleNext}
        />
      ),
      video: (
        <FormVideo
          key={currentItem.rawId}
          lessonId={currentItem.rawId}
          onClickNext={handleNext}
        />
      ),
      vocabulary: (
        <FormVocabulary key={currentItem.rawId} lessonId={currentItem.rawId} />
      ),
      survey: <Survey key={currentItem.rawId} lessonId={currentItem.rawId} />,
    };

    return (
      componentsByType[mappedType] || (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )
    );
  };

  if (hasTimeout) {
    return (
      <div className={styles.timeoutContainer}>
        <p>Đang tải quá lâu, vui lòng thử lại.</p>
        <button onClick={() => navigate(-1)}>Quay lại</button>
      </div>
    );
  }

  if (loading) return <Loading />;

  return (
    <>
      <HeaderVocabulary />
      <div className={styles.main}>
        <div className={styles.menu}>
          <MenuVocabulary
            data={menuItems}
            onSelect={handleSelect}
            selectedId={selectedId || ''}
          />
        </div>
        <div className={styles.right}>
          <div>{renderForm()} </div>
          {currentItem && currentItem.type === LessonStudentEntity.type.QUIZ ? (
            <HistoryExam onSelectReview={setReviewData} />
          ) : null}
        </div>
      </div>
    </>
  );
}

export default GlobalVocabulary;
