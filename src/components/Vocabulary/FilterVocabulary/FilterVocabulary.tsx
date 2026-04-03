import { memo, useState } from 'react';
import CommentVocabulary from '../CommentVocabulary/CommentVocabulary';
import DescribeVocabulary from '../DescribeVocabulary/DescribeVocabulary';
import DocumentVocabulary from '../DocumentVocabulary/DocumentVocabulary';
import styles from './FilterVocabulary.module.scss';
import { useTranslation } from 'react-i18next';
import type {
  EssayAnswerEntity,
  SlideEntity,
  TextEntity,
  VideoUrlEntity,
} from '#/api/requests';

interface FilterVocabularyProps {
  data:
    | TextEntity[]
    | VideoUrlEntity[]
    | SlideEntity[]
    | EssayAnswerEntity[]
    | null
    | undefined;
  hideComment?: boolean;
  dataComent?: string;
}

const FilterVocabulary = memo(
  ({ data, hideComment, dataComent }: FilterVocabularyProps) => {
    const { t } = useTranslation();

    const [activeTab, setActiveTab] = useState<
      'describe' | 'document' | 'comment'
    >('describe');
    return (
      <>
        <div className={styles.boxTitle}>
          <div
            className={`${styles.title} ${activeTab === 'describe' ? styles.active : ''}`}
            onClick={() => setActiveTab('describe')}
          >
            <p className={styles.text}>{t('vocabulary.filter.describe')}</p>
          </div>
          <div
            className={`${styles.title} ${activeTab === 'document' ? styles.active : ''}`}
            onClick={() => setActiveTab('document')}
          >
            <div className={styles.titleText}>
              <p className={styles.text}>{t('vocabulary.filter.document')}</p>
              <div className={styles.boxNumber}>
                <p className={styles.textNumber}>
                  {Array.isArray(data) && data.length > 0 && data[0].documents
                    ? data[0].documents.length
                    : ''}
                </p>
              </div>
            </div>
          </div>
          {!hideComment && (
            <div
              className={`${styles.title} ${activeTab === 'comment' ? styles.active : ''}`}
              onClick={() => setActiveTab('comment')}
            >
              <p className={styles.text}>{t('vocabulary.filter.discuss')}</p>
            </div>
          )}
        </div>
        <div className={styles.contentFilter}>
          {activeTab === 'describe' && <DescribeVocabulary data={data} />}
          {activeTab === 'document' && <DocumentVocabulary data={data} />}
          {activeTab === 'comment' && (
            <CommentVocabulary lessonId={dataComent} />
          )}
        </div>
      </>
    );
  },
);
export default FilterVocabulary;
