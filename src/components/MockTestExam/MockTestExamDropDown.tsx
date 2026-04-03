import type { QuestionEntity } from '#/api/requests';
import { Select } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './MockTestExamDropDown.module.scss';

function fillInBlankSourceHtml(content: string): string {
  if (!content) return '';
  const parts = content.split('|');
  const body = parts.length >= 2 ? parts.slice(1).join('|') : content;
  return body
    .replace(/&nbsp;/g, ' ')
    .replace(/<\/?p>/g, '')
    .replace(/\uFF3F\uFF3F/g, '__');
}

export type MockTestExamDropDownProps = {
  question: QuestionEntity;
  initialAnswers?: Record<number, string>;
  onAnswerChange?: (val: Record<number, string>) => void;
  reviewMode?: boolean;
  disabled?: boolean;
};

export default function MockTestExamDropDown({
  question,
  initialAnswers,
  onAnswerChange,
  reviewMode = false,
  disabled = false,
}: MockTestExamDropDownProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<Record<number, string>>({});

  const blankOrder = useMemo(() => {
    const dd = question.dropDownAnswers;
    if (!Array.isArray(dd) || dd.length === 0) return [];
    return [...dd].sort((a, b) => a.index - b.index);
  }, [question.dropDownAnswers]);

  const bodyHtml = useMemo(
    () => fillInBlankSourceHtml(question.content ?? ''),
    [question.content],
  );

  const parts = useMemo(() => bodyHtml.split('__'), [bodyHtml]);

  useEffect(() => {
    setSelected(initialAnswers ?? {});
  }, [question.id, initialAnswers]);

  const handlePick = (blankIndex: number, value: string | null) => {
    const v = value ?? '';
    setSelected(prev => {
      const next = { ...prev, [blankIndex]: v };
      onAnswerChange?.(next);
      return next;
    });
  };

  if (blankOrder.length === 0) {
    return (
      <p className={styles.root}>
        {t('mocktest.dropdownNoBlanks', {
          defaultValue: 'No dropdown blanks configured for this question.',
        })}
      </p>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.fillBlankInlineWrap}>
        {parts.map((segment, i, arr) => {
          const slot = i < arr.length - 1 ? blankOrder[i] : null;
          const opts =
            slot?.arrAnswer?.map(a => ({
              value: a.content,
              label: a.content,
            })) ?? [];
          const val = slot ? (selected[slot.index] ?? '') : '';
          const correct = slot?.arrAnswer?.find(a => a.isCorrect)?.content;

          return (
            <span className={styles.fillBlankSegment} key={`dd-${i}`}>
              <span
                className={styles.fillBlankPart}
                dangerouslySetInnerHTML={{ __html: segment }}
              />
              {slot ? (
                <span className={styles.fillBlankPart}>
                  {reviewMode ? (
                    <span
                      className={`${styles.reviewValue} ${
                        val
                          ? val.trim().toLowerCase() ===
                            String(correct ?? '')
                              .trim()
                              .toLowerCase()
                            ? styles.reviewCorrect
                            : styles.reviewWrong
                          : ''
                      }`}
                    >
                      {val || t('mocktest.noSelection', { defaultValue: '—' })}
                    </span>
                  ) : (
                    <Select
                      allowClear
                      className={styles.selectInline}
                      disabled={disabled}
                      onChange={v => handlePick(slot.index, v as string | null)}
                      options={opts}
                      placeholder={t('mocktest.dropdownPlaceholder', {
                        defaultValue: 'Chọn',
                      })}
                      size="middle"
                      value={val || undefined}
                    />
                  )}
                </span>
              ) : null}
            </span>
          );
        })}
      </div>
    </div>
  );
}
