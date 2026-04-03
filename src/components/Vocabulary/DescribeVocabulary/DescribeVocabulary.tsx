import type { DescribeVocabularyProps } from '#/api/requests/interface/DescribeVocabularyProps';
import styles from './DescribeVocabulary.module.scss';

export default function DescribeVocabulary({ data }: DescribeVocabularyProps) {
  return (
    <>
      <div className={styles.text}>
        <div className={`${styles.boxText}`}>
          <p
            className={styles.headerText}
            dangerouslySetInnerHTML={{
              __html: data?.[0]?.description || '',
            }}
          />
        </div>
      </div>
    </>
  );
}
