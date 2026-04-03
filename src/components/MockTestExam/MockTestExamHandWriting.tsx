import type { QuestionEntity } from '#/api/requests';
import { HandWritingDto } from '#/api/requests';
import type { HandWritingAnswerPayload } from '#/api/requests/models/HandWritingUserAnswerDto';
import CanvasCard from '#/src/components/Vocabulary/KanjiCanvas/CanvasCard';
import CanvasCardKanji from '#/src/components/Vocabulary/KanjiCanvas/CanvasCardKanji';
import { message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './MockTestExamHandWriting.module.scss';

export type MockTestExamHandWritingProps = {
  question: QuestionEntity;
  initialAnswer?: HandWritingAnswerPayload | null;
  onAnswerChange?: (payload: HandWritingAnswerPayload) => void;
  disabled?: boolean;
  reviewMode?: boolean;
};

export default function MockTestExamHandWriting({
  question,
  initialAnswer,
  onAnswerChange,
  disabled = false,
  reviewMode = false,
}: MockTestExamHandWritingProps) {
  const { t } = useTranslation();
  const [resetSeed, setResetSeed] = useState(0);
  const [canSave, setCanSave] = useState(false);
  const [isCorrectResult, setIsCorrectResult] = useState<boolean | null>(null);
  const [saved, setSaved] = useState(false);
  const drawOrderRef = useRef<number[]>([]);
  const orderWrongRef = useRef(false);
  const hydratedRef = useRef<string | null>(null);
  const hw = question.handWriting;
  useEffect(() => {
    const hydrateKey = `${question.id}-${resetSeed}`;
    if (hydratedRef.current === hydrateKey) return;
    hydratedRef.current = hydrateKey;
    drawOrderRef.current = [];
    if (typeof initialAnswer?.isCorrect === 'boolean') {
      orderWrongRef.current = !initialAnswer.isCorrect;
      setIsCorrectResult(initialAnswer.isCorrect);
      setCanSave(true);
      setSaved(true);
    } else {
      orderWrongRef.current = false;
      setIsCorrectResult(null);
      setCanSave(false);
      setSaved(false);
    }
  }, [question.id, initialAnswer, resetSeed]);
  const kindLabel = (k: HandWritingDto.kind | undefined) => {
    switch (k) {
      case HandWritingDto.kind.HIRAGANA:
        return t('mocktest.handwritingKindHiragana', {
          defaultValue: 'Hiragana',
        });
      case HandWritingDto.kind.KATAKANA:
        return t('mocktest.handwritingKindKatakana', {
          defaultValue: 'Katakana',
        });
      case HandWritingDto.kind.KANJI:
        return t('mocktest.handwritingKindKanji', { defaultValue: 'Kanji' });
      default:
        return '';
    }
  };
  return (
    <div className={styles.wrap}>
      <div className={styles.meta}>
        {hw?.kind ? (
          <span className={styles.kindBadge}>{kindLabel(hw.kind)}</span>
        ) : null}
        {hw?.value ? (
          <span className={styles.targetChar}>{hw.value}</span>
        ) : (
          <span className={styles.hint}>
            {t('mocktest.handwritingNoTarget', {
              defaultValue: 'Chưa cấu hình ký tự mẫu.',
            })}
          </span>
        )}
      </div>
      <div
        style={
          disabled || reviewMode
            ? { opacity: 0.85, pointerEvents: 'none' }
            : undefined
        }
      >
        {!disabled && !reviewMode ? (
          <div className={styles.toolbar}>
            <button
              className={styles.resetBtn}
              onClick={() => {
                setResetSeed(prev => prev + 1);
                drawOrderRef.current = [];
                orderWrongRef.current = false;
                setCanSave(false);
                setIsCorrectResult(null);
                setSaved(false);
              }}
              type="button"
            >
              {t('mocktest.handwritingReset', { defaultValue: 'Reset nét vẽ' })}
            </button>
            <button
              className={`${styles.resetBtn} ${saved ? styles.savedBtn : ''}`}
              disabled={!canSave}
              onClick={() => {
                if (isCorrectResult === null) return;
                onAnswerChange?.({ isCorrect: isCorrectResult });
                setSaved(true);
                message.success(
                  t('mocktest.handwritingSavedToast', {
                    defaultValue: 'Đã lưu kết quả câu viết tay',
                  }),
                );
              }}
              type="button"
            >
              {saved
                ? t('mocktest.handwritingSaved', {
                    defaultValue: 'Đã lưu kết quả',
                  })
                : t('mocktest.handwritingSaveResult', {
                    defaultValue: 'Lưu kết quả',
                  })}
            </button>
          </div>
        ) : null}
        {hw?.kind === HandWritingDto.kind.KANJI ? (
          <CanvasCardKanji
            char={hw?.value}
            freeStrokeGuide
            key={`kanji-${question.id}-${resetSeed}`}
            onDrawStart={() => {
              setSaved(false);
            }}
            onStrokeComplete={(idx: number) => {
              const next = [...drawOrderRef.current, idx];
              if (idx !== drawOrderRef.current.length) {
                orderWrongRef.current = true;
              }
              drawOrderRef.current = next;
              setIsCorrectResult(!orderWrongRef.current);
              setCanSave(true);
              setSaved(false);
            }}
            onComplete={() => {
              const ok = !orderWrongRef.current;
              setIsCorrectResult(ok);
              setCanSave(true);
              setSaved(false);
            }}
          />
        ) : (
          <CanvasCard
            char={hw?.value}
            freeStrokeGuide
            kind={hw?.kind}
            key={`kana-${question.id}-${resetSeed}`}
            onDrawStart={() => {
              setSaved(false);
            }}
            onStrokeComplete={(idx: number) => {
              const next = [...drawOrderRef.current, idx];
              if (idx !== drawOrderRef.current.length) {
                orderWrongRef.current = true;
              }
              drawOrderRef.current = next;
              setIsCorrectResult(!orderWrongRef.current);
              setCanSave(true);
              setSaved(false);
            }}
            onComplete={() => {
              const ok = !orderWrongRef.current;
              setIsCorrectResult(ok);
              setCanSave(true);
              setSaved(false);
            }}
          />
        )}
      </div>
      {reviewMode && typeof initialAnswer?.isCorrect === 'boolean' ? (
        <p className={styles.hint}>
          {t('mocktest.handwritingSubmitted', {
            defaultValue: 'Da nop bai viet tay.',
          })}
        </p>
      ) : null}
      {!hw?.value ? (
        <div className={styles.emptyData}>
          {t('mocktest.handwritingNoTarget', {
            defaultValue: 'Chua cau hinh ky tu mau.',
          })}
        </div>
      ) : null}
    </div>
  );
}
