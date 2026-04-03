import { useState } from 'react'; // thêm useState
import styles from '../Hiragana/Hiragana.module.scss';
import TitleVideoVocabulary from '../TitleVideoVocabulary/TitleVideoVocabulary';
import { numberData } from './Count_Vocab';

export default function CountVocab() {
  const [selectedChar, setSelectedChar] = useState<{
    textJapan: string;
    textPronounce: string;
  } | null>(null);
  selectedChar;

  const [isModalVisible, setIsModalVisible] = useState(false);
  isModalVisible;

  const hiraganaList = numberData.map(item => ({
    textJapan: item.romaji,
    textPronounce: item.kana,
  }));

  return (
    <>
      <TitleVideoVocabulary videoUrl="ss" />

      <div className={styles.boxMain}>
        <div className={styles.contentMain}>
          <p className={styles.title}>Số đếm</p>
        </div>

        <div className={styles.contentText}>
          {hiraganaList.map((item, index) => (
            <div
              className={styles.textBox}
              key={index}
              onClick={
                item.textJapan
                  ? () => {
                      setSelectedChar(item);
                      setIsModalVisible(true);
                    }
                  : undefined
              }
              style={{
                cursor: item.textJapan ? 'pointer' : 'default',
                opacity: item.textJapan ? 1 : 0,
              }}
            >
              <p className={styles.textJapan}>{item.textJapan}</p>
              <p className={styles.textPronounce}>{item.textPronounce}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
