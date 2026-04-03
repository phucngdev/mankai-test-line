import styles from './Survey.module.scss';
import TitleVocabulary from '../TitleVocabulary/TitleVocabulary';
import { IconBook } from '#/assets/svg/externalIcon';
import { useTranslation } from 'react-i18next';
import { CSSProperties, useState } from 'react';
import { Checkbox } from 'antd';
import SimpleCkEditor from '#/shared/components/ckeditor/SimpleCkEditor';

interface SurveyProps {
  lessonId: string;
}

enum SurveyQuestionType {
  FEEDBACK_TEXT = 'FEEDBACK_TEXT',
  RATING = 'RATING',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
}

type SurveyQuestion = {
  id: string;
  content: string;
  tag: string;
  type: SurveyQuestionType;
  options?: string[];
};

const MOCK_SURVEY_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'survey-mock-1',
    content: '<p>Bạn cảm thấy khóa học này như thế nào?</p>',
    tag: 'cảm nhận',
    type: SurveyQuestionType.FEEDBACK_TEXT,
  },
  {
    id: 'survey-mock-2',
    content: '<p>Mức độ hữu ích của nội dung đối với bạn (1–5)?</p>',
    tag: 'hữu ích',
    type: SurveyQuestionType.RATING,
  },
  {
    id: 'survey-mock-3',
    content: '<p>Phần nào trong khóa học khiến bạn ấn tượng nhất?</p>',
    tag: 'ấn tượng',
    type: SurveyQuestionType.FEEDBACK_TEXT,
  },
  {
    id: 'survey-mock-4',
    content:
      '<p>Nội dung khóa học có đáp ứng kỳ vọng ban đầu của bạn không?</p>',
    tag: 'kỳ vọng',
    type: SurveyQuestionType.MULTIPLE_CHOICE,
    options: ['Vượt mong đợi', 'Đúng như mong đợi', 'Chưa như mong đợi'],
  },
  {
    id: 'survey-mock-5',
    content: '<p>Bạn đánh giá chất lượng giảng dạy như thế nào (1–5)?</p>',
    tag: 'giảng viên',
    type: SurveyQuestionType.RATING,
  },
  {
    id: 'survey-mock-6',
    content: '<p>Có phần nào bạn thấy khó hiểu hoặc chưa rõ không?</p>',
    tag: 'khó hiểu',
    type: SurveyQuestionType.FEEDBACK_TEXT,
  },
  {
    id: 'survey-mock-7',
    content: '<p>Thời lượng khóa học có phù hợp với bạn không?</p>',
    tag: 'thời lượng',
    type: SurveyQuestionType.MULTIPLE_CHOICE,
    options: ['Quá dài', 'Vừa đủ', 'Quá ngắn'],
  },
  {
    id: 'survey-mock-8',
    content:
      '<p>Bạn có áp dụng được kiến thức từ khóa học vào thực tế không?</p>',
    tag: 'ứng dụng',
    type: SurveyQuestionType.MULTIPLE_CHOICE,
    options: ['Áp dụng rất tốt', 'Áp dụng được một phần', 'Chưa áp dụng được'],
  },
  {
    id: 'survey-mock-9',
    content: '<p>Trải nghiệm tổng thể của bạn với khóa học (1–5)?</p>',
    tag: 'trải nghiệm',
    type: SurveyQuestionType.RATING,
  },
  {
    id: 'survey-mock-10',
    content:
      '<p>Bạn có sẵn sàng giới thiệu khóa học này cho người khác không?</p>',
    tag: 'giới thiệu',
    type: SurveyQuestionType.MULTIPLE_CHOICE,
    options: ['Chắc chắn có', 'Có thể', 'Không'],
  },
  {
    id: 'survey-mock-11',
    content: '<p>Bạn thích điểm nào nhất ở khóa học?</p>',
    tag: 'yêu thích',
    type: SurveyQuestionType.FEEDBACK_TEXT,
  },
  {
    id: 'survey-mock-12',
    content: '<p>Bạn mong muốn cải thiện điều gì trong khóa học?</p>',
    tag: 'cải thiện',
    type: SurveyQuestionType.FEEDBACK_TEXT,
  },
];

const RATING_EMOJIS = ['🥺', '😕', '😐', '😊', '🤩'];
const RATING_LABELS = [
  'Rất tệ',
  'Chưa hài lòng',
  'Bình thường',
  'Hài lòng',
  'Rất tốt',
];
const RATING_COLORS = ['#F04438', '#F97066', '#FDB022', '#39B872', '#039855'];

const Survey = ({ lessonId: _lessonId }: SurveyProps) => {
  const { t } = useTranslation();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [transitionKey, setTransitionKey] = useState(0);

  const question = MOCK_SURVEY_QUESTIONS[currentQuestionIndex];
  const total = MOCK_SURVEY_QUESTIONS.length;
  const isLastQuestion = currentQuestionIndex === total - 1;

  const handleNext = () => {
    if (isLastQuestion) return;
    setCurrentQuestionIndex(prev => prev + 1);
    setTransitionKey(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentQuestionIndex === 0) return;
    setCurrentQuestionIndex(prev => prev - 1);
    setTransitionKey(prev => prev + 1);
  };

  return (
    <div className={styles.boxSurvey}>
      <TitleVocabulary
        description={t('titleVocabulary.descriptionPdf')}
        icon={<IconBook color="#F37142" />}
        isAnyCompleted={true}
        onClickNext={() => {}}
        title="Survey"
      />
      <div className={styles.boxContent}>
        <div className={styles.header}>
          <h3 className={styles.title}>{t('survey.title')}</h3>
          <p className={styles.desc}>{t('survey.description')}</p>
        </div>

        <div className={styles.progressRow}>
          <span>
            {currentQuestionIndex + 1} / {total}
          </span>
        </div>

        <div
          key={`${question.id}-${transitionKey}`}
          className={styles.questionCard}
        >
          <div
            className={styles.questionContent}
            dangerouslySetInnerHTML={{ __html: question.content }}
          />

          {question.type === SurveyQuestionType.FEEDBACK_TEXT ? (
            <SimpleCkEditor value={''} changeData={() => {}} />
          ) : null}

          {question.type === SurveyQuestionType.RATING ? (
            <div className={styles.ratingGroup}>
              {RATING_EMOJIS.map((emoji, index) => (
                <label
                  key={emoji}
                  className={styles.ratingItem}
                  style={
                    {
                      '--rating-active-color':
                        RATING_COLORS[index] ?? '#039855',
                    } as CSSProperties
                  }
                >
                  <input type="radio" name={question.id} value={index + 1} />
                  <span className={styles.emoji}>{emoji}</span>
                  <span className={styles.ratingText}>
                    {RATING_LABELS[index] ?? ''}
                  </span>
                </label>
              ))}
            </div>
          ) : null}

          {question.type === SurveyQuestionType.MULTIPLE_CHOICE ? (
            <div className={styles.optionList}>
              {question.options?.map(option => (
                <label key={option} className={styles.optionItem}>
                  <span>{option}</span>
                  <Checkbox name={question.id} />
                </label>
              ))}
            </div>
          ) : null}
        </div>

        <div className={styles.actionRow}>
          <button
            type="button"
            className={`${styles.btnSession} ${styles.prevBtn}`}
            onClick={handlePrev}
            disabled={currentQuestionIndex === 0}
          >
            <p className={styles.textSessionPrev}>{t('survey.prev')}</p>
          </button>
          <div
            className={`${styles.btnSession} ${styles.nextBtn}`}
            onClick={handleNext}
          >
            <p className={styles.textSession}>{t('survey.next')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Survey;
