import { useTranslation } from 'react-i18next';
import styles from './SpecialRanking.module.scss';
import { AIStar, LearnWithMankai, PlayIcon } from '#/assets/svg/externalIcon';
import cup from 'src/assets/images/banner/cup.png';
import avatar from 'src/assets/images/specialRanking/avatarrank.png';
import crown from 'src/assets/images/specialRanking/crown.png';
import star from 'src/assets/images/specialRanking/star.png';
import AI from 'src/assets/images/specialRanking/AI.png';
import sensei from 'src/assets/images/specialRanking/sensei.png';
import sensei2 from 'src/assets/images/specialRanking/sensei2.png';
import kanji from 'src/assets/images/specialRanking/kanji_mnemonic_resized.png';

import GlobalCourses from '../GlobalCourses/GlobalCourses';
import SpecialStreaks from '../SpecialStreaks/SpecialStreaks';
import { useNavigate } from 'react-router-dom';

function SpecialRanking(): JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const rawData = [
    { name: 'Nguyễn Văn An', score: 54 },
    { name: 'Trần Thị Bích', score: 50 },
    { name: 'Lê Hoàng Dũng', score: 48 },
    { name: 'Phạm Quỳnh Hoa', score: 52 },
    { name: 'Võ Minh Khang', score: 21 },
    { name: 'Đỗ Thị Hồng', score: 41 },
    { name: 'Ngô Văn Lâm', score: 21 },
    { name: 'Bùi Thị Mai', score: 41 },
    { name: 'Huỳnh Gia Huy', score: 21 },
    { name: 'Nguyễn Thị Lan', score: 41 },
    { name: 'Trịnh Văn Nam', score: 21 },
    { name: 'Cao Thị Oanh', score: 41 },
    { name: 'Phan Nhật Quang', score: 21 },
    { name: 'Lương Thị Phương', score: 41 },
  ];

  const rankData = rawData
    .sort((a, b) => b.score - a.score)
    .map((item, index) => ({
      ...item,
      isActive: index + 1 === 5,
      rank: index + 1,
    }));

  const topThreeOrder = [2, 1, 3];
  const topThree = topThreeOrder
    .map(rank => rankData.find(item => item.rank === rank))
    .filter(Boolean) as { name: string; score: number; rank: number }[];

  const otherRanks = rankData
    .filter(item => item.rank > 3)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 7);

  const handleNavigate = (route: string) => {
    navigate(route);
  };

  const listItems = [
    {
      button: <>{t('specialRanking.button')}</>,
      description: <>{t('specialRanking.listDesc.kaiwa')}</>,
      img: AI,
      route: '/',
      title: <>{t('specialRanking.kaiwa')}</>,
    },
    {
      button: <>{t('specialRanking.button')}</>,
      description: <>{t('specialRanking.listDesc.minna')}</>,
      img: sensei,
      route: '/list-topic',
      title: <>{t('specialRanking.minna')}</>,
    },
    {
      button: <>{t('specialRanking.button')}</>,
      description: <>{t('specialRanking.listDesc.testMankai')}</>,

      img: sensei2,
      route: '/mock-test',
      title: <>{t('specialRanking.testMankai')}</>,
    },
    {
      button: <>{t('specialRanking.button')}</>,
      description: <>{t('specialRanking.listDesc.kanji')}</>,
      img: kanji,
      route: '/dictionary',
      title: <>{t('specialRanking.kanji')}</>,
    },
  ];

  return (
    <>
      <div className={styles.specialRanking}>
        <div className={styles.left}>
          <div className={styles.top}>
            <div className={styles.title}>
              <div className={styles.icon}>
                <LearnWithMankai />
              </div>
              <div className={styles.text}>
                <p className={styles.texttop}>{t('specialRanking.title')}</p>
                <p>{t('specialRanking.description')}</p>
              </div>
            </div>

            <div className={styles.list}>
              {listItems.map((item, index) => (
                <div className={styles.item} key={index}>
                  <div className={styles.title}>
                    <p className={styles.texttop}>{item.title}</p>
                    {(item.img.includes('AI') ||
                      item.img.includes('sensei2')) && <AIStar />}
                  </div>
                  <p className={styles.description}>{item.description}</p>
                  <img alt="" className={styles.img} src={item.img} />
                  <div
                    className={styles.button}
                    onClick={() => handleNavigate(item.route)}
                  >
                    <p>{item.button}</p>
                    <PlayIcon color="#fff" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <GlobalCourses />
        </div>

        <div className={styles.right}>
          {/* TOP 3 */}
          <div className={styles.rankKing}>
            <div className={styles.topBox}>
              <div className={styles.titleRank}>
                <img
                  alt={t('specialRanking.ranking.imageAlt')}
                  className={styles.cup}
                  src={cup}
                />
                <p className={styles.text}>
                  {t('specialRanking.ranking.text')}
                </p>
              </div>

              <div className={styles.rankBox}>
                {topThree.map((item, index) => (
                  <div
                    className={`${styles.rank} ${index === 1 ? styles.middle : styles.side}`}
                    key={item.rank}
                  >
                    <div className={styles.avatarRank}>
                      <img
                        alt={t('specialRanking.ranking.crownAlt')}
                        className={styles.crown}
                        src={crown}
                      />
                      <img
                        alt={t('specialRanking.ranking.avatarAlt')}
                        className={styles.avatar}
                        src={avatar}
                      />
                      <div className={styles.text}>
                        <p className={styles.content}>{item.rank}</p>
                      </div>
                    </div>
                    <div className={styles.contentRank}>
                      <p className={styles.content}>{item.name}</p>
                      <div className={styles.starBox}>
                        <img
                          alt={t('specialRanking.ranking.starAlt')}
                          src={star}
                        />
                        <p className={styles.contentStar}>{item.score}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.mainBox}>
              {otherRanks.map(item => (
                <div
                  className={`${styles.boxRank} ${item.isActive ? styles.active : ''}`}
                  key={item.rank}
                >
                  <div className={styles.contentBox}>
                    <p className={styles.stt}>{item.rank}</p>
                    <img
                      alt={t('specialRanking.ranking.avatarAlt')}
                      className={styles.avatar}
                      src={avatar}
                    />
                    <p className={styles.name}>{item.name}</p>
                  </div>

                  <div className={styles.starBox}>
                    <img alt={t('specialRanking.ranking.starAlt')} src={star} />
                    <p className={styles.contentStar}>{item.score}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <SpecialStreaks />
          </div>
        </div>
      </div>
    </>
  );
}

export default SpecialRanking;
