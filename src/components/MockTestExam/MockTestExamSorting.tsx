import type { QuestionEntity } from '#/api/requests';
import styles from './MockTestExam.module.scss';

type Props = {
  question: QuestionEntity;
  disabled?: boolean;
  ordered: string[];
  onChange: (ordered: string[]) => void;
};

/**
 * Same interaction as lesson Practice: tap items to build order, tap result row to remove.
 */
export function MockTestExamSorting({
  question,
  disabled = false,
  ordered,
  onChange,
}: Props): JSX.Element {
  const pool = question.sortingAnswers ?? [];

  const togglePoolItem = (content: string) => {
    if (disabled) return;
    if (ordered.includes(content)) return;
    onChange([...ordered, content]);
  };

  const removeFromResult = (content: string) => {
    if (disabled) return;
    onChange(ordered.filter(c => c !== content));
  };

  return (
    <div className={styles.sortingWrap}>
      {pool.length > 0 ? (
        <div className={styles.sortingResultBlock}>
          <p className={styles.sortingLabel}>Kết quả sắp xếp:</p>
          <div className={styles.sortingResultRow}>
            {ordered.map((content, index) => (
              <div
                className={`${styles.answerBox} ${styles.sortingAnswerBox}`}
                key={`${content}-${index}`}
                onClick={() => removeFromResult(content)}
              >
                <div className={styles.contentBox}>
                  <p className={styles.text}>
                    {String.fromCharCode(65 + index)}
                  </p>
                </div>
                <div className={styles.contentText}>
                  <p className={styles.text}>{content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className={`${styles.answer} ${styles.sortingPool}`}>
        {pool.map((answerObj, index) => {
          const answer = answerObj.content;
          const isSelected = ordered.includes(answer);
          return (
            <div
              className={`${styles.answerBox} ${isSelected ? styles.sortingPoolSelected : ''}`}
              key={`${question.id}-${index}`}
              onClick={() => {
                if (disabled) return;
                togglePoolItem(answer);
              }}
            >
              <div className={styles.contentBox}>
                <p className={styles.text}>{String.fromCharCode(65 + index)}</p>
              </div>
              <div className={styles.contentText}>
                <p className={styles.text}>{answer}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
