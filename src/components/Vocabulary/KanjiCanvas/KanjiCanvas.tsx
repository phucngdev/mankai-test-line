import React, { useEffect } from 'react';
import styles from './KanjiCanvas.module.scss';
import KanjiCanvasShared from '#/shared/components/canvas/kanji/KanjiCanvas';
import {
  ExamLessonWithMappingEntity,
  HandWritingDto,
  QuestionEntity,
  QuestionGroupEntity,
} from '#/api/requests';
import { useTranslation } from 'react-i18next';
import GenCanvas from '#/shared/components/canvas/katakana-higarana/GenCanvas';
import CanvasCard from './CanvasCard';
import CanvasCardKanji from './CanvasCardKanji';

interface KanjiCanvasProps {
  data: QuestionEntity | QuestionGroupEntity;
  currentItem: ExamLessonWithMappingEntity;
  onAnswerChange: (answer: Record<number, string>) => void;
  currentGroupIndex?: number;
  onSelectQuestion?: (index: number) => void;
  onSetExplanation?: (explanation: string) => void;
}

const KanjiCanvas = ({
  data,
  currentItem,
  onAnswerChange,
  currentGroupIndex,
  onSelectQuestion,
  onSetExplanation,
}: KanjiCanvasProps) => {
  const { t } = useTranslation();

  useEffect(() => {
    let explanation = '';

    if ('questions' in data && data.questions[0]?.explain) {
      explanation = data.questions[0].explain;
    } else if ('explain' in data && typeof data.explain === 'string') {
      explanation = data.explain;
    }

    onSetExplanation?.(explanation);
  }, [data, onSetExplanation]);

  function checkAnswers(userAnswers: any[] = [], opts: any[] = []) {
    const correct = opts.filter(o => o.isCorrect).map(o => o.content);
    const user = userAnswers.map(u => u.content);
    return (
      user.length === correct.length && user.every(c => correct.includes(c))
    );
  }

  return (
    <>
      <div className={styles.boxKanjiCanvas}>
        <div className={styles.boxContent}>
          <div className={styles.boxQuestion}>
            <div className={styles.lboxQuestion}>
              <p className={styles.title}>{t('mocktest.listQuestion')}</p>
              <div className={styles.listQuestion}>
                {Array.from(
                  { length: currentItem.exam.questionMapping.length },
                  (_, i) => (
                    <button
                      className={`${styles.questionNumber} ${
                        i === currentGroupIndex ? styles.activeQuestion : ''
                      }`}
                      key={i}
                      onClick={() => onSelectQuestion?.(i)}
                      disabled
                    >
                      {i + 1}
                    </button>
                  ),
                )}
              </div>
            </div>
            <div className={styles.boxGenCanvas}>
              <p className={styles.headerGenCanvas}>
                {t('historyExam.numberExam')} {(currentGroupIndex ?? 0) + 1} /{' '}
                {currentItem.exam.questionMapping.length}
              </p>
              {data?.handWriting?.kind === HandWritingDto.kind.KANJI ? (
                <div className={styles.boxKanjiCanvasShared}>
                  {/* <KanjiCanvasShared
                    char={data?.handWriting?.value}
                    onComplete={() => {
                      onAnswerChange({
                        [currentGroupIndex ?? 0]: data?.handWriting?.value,
                      });
                    }}
                  /> */}
                  <CanvasCardKanji
                    char={data?.handWriting?.value}
                    onComplete={() => {
                      onAnswerChange({
                        [currentGroupIndex ?? 0]: data?.handWriting?.value,
                      });
                    }}
                  />
                </div>
              ) : (
                // <GenCanvas
                //   kind={data?.handWriting?.kind}
                //   char={data?.handWriting?.value}
                //   onComplete={() => {
                //     onAnswerChange({
                //       [currentGroupIndex ?? 0]: data?.handWriting?.value,
                //     });
                //   }}
                // />
                <CanvasCard
                  kind={data?.handWriting?.kind}
                  char={data?.handWriting?.value}
                  onComplete={() => {
                    onAnswerChange({
                      [currentGroupIndex ?? 0]: data?.handWriting?.value,
                    });
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default KanjiCanvas;
