import styles from './ListTopic.module.scss';
import StartJourney from '#/src/components/StartJourney/StartJourney';
import { useTranslation } from 'react-i18next';
import { ArrowIconBack, ArrowIconNext } from '#/assets/svg/externalIcon';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '#/shared/redux/store';
import { useAppDispatch } from '#/shared/redux/store';
import { useEffect } from 'react';
import { fetchAllTopic } from '#/shared/redux/thunk/TopicThunk';
import type { TopicEntity } from '#/api/requests';

function ListTopic(): React.ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data } = useSelector((state: RootState) => state.topic) || {
    items: [],
  };
  const dispatch = useAppDispatch();
  const offset = 0;
  const limit = 100;

  useEffect(() => {
    const nameToSpeak = localStorage.getItem('speakTopicName');

    if (nameToSpeak) {
      const utterance = new SpeechSynthesisUtterance(nameToSpeak);
      utterance.lang = 'ja-JP';
      speechSynthesis.speak(utterance);
      localStorage.removeItem('speakTopicName');
    }
  }, []);

  useEffect(() => {
    dispatch(fetchAllTopic({ limit, offset }));
  }, [limit, offset]);

  const handleDetailTopic = (topic: TopicEntity) => {
    localStorage.setItem('speakTopicName', topic.name);
    navigate(`/detail-topic/${topic.id}`);
  };

  const filteredData = Array.isArray(data)
    ? data.map(topic => ({ ...topic, key: topic.id }))
    : [];

  return (
    <>
      <div className={styles.home}>
        <main className={styles.main}>
          <div className={styles.list}>
            <div className={styles.listTop}>
              <div className={styles.arrowIcons}>
                <ArrowIconBack
                  height={24}
                  onClick={() => {
                    navigate(-1);
                  }}
                  width={24}
                />
                <ArrowIconNext
                  height={24}
                  onClick={() => {
                    navigate(+1);
                  }}
                  width={24}
                />
              </div>
              <p className={styles.homeText}>{t('banner.homeText')}</p>
              <p>/</p>
              <p
                className={styles.courseText}
                onClick={() => {
                  navigate('/');
                }}
              >
                {t('banner.courseText')}
              </p>

              <p>/</p>
              <p
                className={styles.topicText}
                onClick={() => {
                  navigate('/list-topic');
                }}
              >
                {t('banner.topic')}
              </p>
            </div>

            <p className={styles.title}> {t('banner.topic')}</p>

            <div className={styles.topicBox}>
              {filteredData.map(topic => (
                <div
                  className={styles.topicContent}
                  key={topic.id}
                  onClick={() => handleDetailTopic(topic)}
                >
                  <div className={styles.titleBox}>
                    <img
                      alt={topic.title}
                      className={styles.boderImg}
                      src={topic.image}
                    />

                    <div className={styles.contentTitle}>
                      <p className={styles.titleTopic}>{t('topic.title')}</p>
                      <p className={styles.contentTopic}>{topic.name}</p>
                    </div>
                  </div>
                  <p className={styles.vocabulary}>
                    {topic.count} {t('topic.vocabulary')}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <StartJourney />
        </main>
      </div>
    </>
  );
}

export default ListTopic;
