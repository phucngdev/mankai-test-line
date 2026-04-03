import { BtnSubmit, Member } from '#/assets/svg/externalIcon';
import { useEffect, useState } from 'react';
import styles from './CommentVocabulary.module.scss';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import type { RootState } from '#/shared/redux/store';
import { useAppDispatch } from '#/shared/redux/store';
import {
  getLessionComment,
  postLessonComment,
} from '#/shared/redux/thunk/LessionThunk';

interface CommentVocabularyProps {
  lessonId?: string;
}

export default function CommentVocabulary({
  lessonId,
}: CommentVocabularyProps) {
  const dataComment = useSelector(
    (state: RootState) => state.lession.dataComment,
  );
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const [comment, setComment] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (lessonId) {
      dispatch(getLessionComment(lessonId));
    }
  }, [lessonId]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
    setComment(e.target.value);
  };

  const handleSubmit = async () => {
    if (!lessonId || !user?.id || !comment.trim()) return;

    await dispatch(
      postLessonComment({
        content: comment.trim(),
        lessonId,
        userId: user.id,
      }),
    );

    setComment('');
    dispatch(getLessionComment(lessonId));
  };

  return (
    <div className={styles.comment}>
      <div className={styles.commentBox}>
        <div className={styles.iconAvt}>
          <Member />
        </div>
        <div className={styles.boxComment}>
          <textarea
            className={styles.textComment}
            onChange={handleInput}
            placeholder={t('vocabulary.placeholderComment')}
            value={comment}
          />
          <div className={styles.btnSubmit} onClick={handleSubmit}>
            <BtnSubmit />
          </div>
        </div>
      </div>

      {lessonId && dataComment.length > 0 ? (
        <>
          <p className={styles.numberComment}>
            {dataComment.length} {t('vocabulary.comment')}
          </p>

          {/* 👇 Thêm wrapper có class styles.commentList */}
          <div className={styles.commentList}>
            {dataComment.map(comment => (
              <div className={styles.boxChat} key={comment.id}>
                <div className={styles.iconAvt}>
                  <Member />
                </div>
                <div className={styles.commentChat}>
                  <div className={styles.contentChat}>
                    <p className={styles.name}>
                      {comment.fullName || 'Ẩn danh'}
                    </p>
                    <p className={styles.textComment}>{comment.content}</p>
                  </div>
                  <div className={styles.timeChat}>
                    <p className={styles.date}>
                      {new Date(comment.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                    <a className={styles.feedback} href="">
                      {t('vocabulary.feedback')}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
