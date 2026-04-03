import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '#/shared/redux/store';
import { Button, Card } from 'antd';
import { useEffect, useState } from 'react';
import styles from './ExamResultDetail.module.scss';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

export default function ExamResultDetail() {
  const { id } = useParams();
  const { dataResultUser } = useSelector(
    (state: RootState) => state.mockTestDetail,
  );
  const navigate = useNavigate();
  const result = dataResultUser.find(item => item.id === id);
  const { t } = useTranslation();

  useEffect(() => {
    if (!result) {
      navigate('/list-exam');
    }
  }, [result, navigate]);

  if (!result) return null;

  return (
    <div className={styles.box}>
      <div className={styles.boxTitle}>
        <h2 className={styles.title}>{result.testId.name}</h2>
        <p className={styles.date}>
          {t('banner.dateExam')}:{' '}
          {new Date(result.createdAt).toLocaleString('vi-VN')}
        </p>
        <p className={styles.point}>
          {t('banner.point')}:{' '}
          <span className={styles.colorPoint}>{result.score}</span>
        </p>
      </div>
      {result.details.map((detail: any, detailIndex: number) => (
        <div
          className={styles.boxContent}
          key={detail.id}
          style={{ marginBottom: 32 }}
        >
          <h3 className={styles.contentTitle}>
            {t('banner.part')} {detailIndex + 1}: {detail.name}
          </h3>

          {detail.questionGroups?.map((group: any, groupIndex: number) => (
            <div
              className={styles.questionGroup}
              key={groupIndex}
              style={{ marginBottom: 24, marginLeft: 20 }}
            >
              {group.content ? (
                <div
                  style={{
                    alignItems: 'center',
                    background: '#fafafa',
                    border: '2px solid #ff7300',
                    borderRadius: 8,
                    display: 'flex',
                    gap: 12,
                    marginBottom: 12,
                    padding: 12,
                  }}
                >
                  <div
                    dangerouslySetInnerHTML={{ __html: group.content }}
                    style={{ flex: 1 }}
                  />

                  {group.audioUrl ? (
                    <audio controls style={{ height: 32 }}>
                      <source src={group.audioUrl} type="audio/mpeg" />
                      {t('banner.audio')}
                    </audio>
                  ) : null}
                </div>
              ) : null}

              {group.questions?.map((q: any, qIndex: number) => {
                const userAnswer = q.userAnswers?.[0];
                const correctAnswer = q.correctAnswers?.find(
                  (ans: any) => ans.isCorrect,
                );

                const [showExplain, setShowExplain] = useState(false);

                return (
                  <Card key={q.id} style={{ marginBottom: 16 }}>
                    <div className={styles.boxAnswer}>
                      <p className={styles.answer}>
                        <b className={styles.titleAnswer}>
                          {t('historyExam.numberExam')} {qIndex + 1}:
                        </b>{' '}
                        <span dangerouslySetInnerHTML={{ __html: q.content }} />
                      </p>
                      <p className={styles.answerUser}>
                        <b className={styles.titleAnswer}>
                          {t('historyExam.answer')}
                        </b>{' '}
                        {userAnswer ? (
                          <>
                            {userAnswer.content}{' '}
                            {userAnswer.isCorrect ? (
                              <CheckCircleFilled
                                style={{ color: 'green', marginLeft: 8 }}
                              />
                            ) : (
                              <CloseCircleFilled
                                style={{ color: 'red', marginLeft: 8 }}
                              />
                            )}
                          </>
                        ) : (
                          t('historyExam.noAnswer')
                        )}
                      </p>
                      <p className={styles.answerQuestion}>
                        <b className={styles.titleAnswer}>
                          {t('historyExam.answerDone')}
                        </b>{' '}
                        {correctAnswer?.content}
                      </p>

                      {q.explain ? (
                        <>
                          <Button
                            onClick={() => setShowExplain(!showExplain)}
                            type="link"
                          >
                            {showExplain
                              ? t('mocktest.noneExplain')
                              : t('mocktest.showExplain')}
                          </Button>
                          {showExplain ? (
                            <p className={styles.explain}>
                              <b className={styles.titleExplain}>
                                {t('mocktest.explain')}:
                              </b>{' '}
                              <span
                                dangerouslySetInnerHTML={{ __html: q.explain }}
                              />
                            </p>
                          ) : null}
                        </>
                      ) : null}
                    </div>
                  </Card>
                );
              })}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
