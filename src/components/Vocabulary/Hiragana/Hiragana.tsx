import { useState } from 'react'; // thêm useState
import { IconListen, Repeat } from '#/assets/svg/externalIcon';
import styles from './Hiragana.module.scss';
import { Modal } from 'antd';
import TitleVideoVocabulary from '../TitleVideoVocabulary/TitleVideoVocabulary';
import { SoundChange, Youon, alphabetData } from './hiragana_alphabet';
import KanjiSVG from '#/shared/components/KanjiSVG/KanjiSVG';
import { useTranslation } from 'react-i18next';

type TabKey = 'bangChuCai' | 'truongAm' | 'bienam' | 'amghep' | 'amngat';

export default function Hiragana() {
  const { t } = useTranslation();
  const [selectedChar, setSelectedChar] = useState<{
    textJapan: string;
    textPronounce: string;
  } | null>(null);
  const [repeatTrigger, setRepeatTrigger] = useState(0);

  const speakText = (text: string) => {
    const synth = window.speechSynthesis;
    if (!synth) return;

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'ja-JP';
    utter.rate = 1;

    const voices = synth.getVoices();
    const preferredVoices = [
      'Google 日本語',
      'Kyoko',
      'Nanami',
      'Haruka',
      'Otoya',
    ];
    const japaneseVoice = voices.find(
      v =>
        v.lang === 'ja-JP' &&
        preferredVoices.some(name => v.name.includes(name)),
    );

    if (japaneseVoice) {
      utter.voice = japaneseVoice;
    }

    synth.cancel();
    synth.speak(utter);
  };

  const [activeTab, setActiveTab] = useState<
    'bangChuCai' | 'truongAm' | 'bienam' | 'amghep' | 'amngat' | null
  >('bangChuCai');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const hiraganaList = alphabetData.text.map(item => ({
    textJapan: item.kana,
    textPronounce: item.romaji,
  }));

  const soundChange = SoundChange.text.map(item => ({
    textJapan: item.kana,
    textPronounce: item.romaji,
  }));

  const compoundSound = Youon.text.map(item => ({
    textJapan: item.kana,
    textPronounce: item.romaji,
  }));

  const tabItems: { key: TabKey; label: string }[] = [
    { key: 'bangChuCai', label: 'Bảng chữ cái' },
    { key: 'bienam', label: 'Biến âm' },
    { key: 'amghep', label: 'Âm ghép' },
    { key: 'truongAm', label: 'Trường âm' },
    { key: 'amngat', label: 'Âm ngắt' },
  ];
  return (
    <>
      <TitleVideoVocabulary videoUrl="ss" />

      <div className={styles.boxMain}>
        <div className={styles.contentMain}>
          <p className={styles.title}>Hiragana</p>
          <div className={styles.fillterMain}>
            {tabItems.map(({ key, label }) => (
              <div
                className={`${styles.contentFillter} ${
                  activeTab === key ? styles.isActive : ''
                }`}
                key={key}
                onClick={() => setActiveTab(key)}
              >
                <p className={styles.text}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {activeTab === 'bangChuCai' && (
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
        )}

        {activeTab === 'bienam' && (
          <div className={styles.contentText}>
            {soundChange.map((item, index) => (
              <div
                className={styles.textBox}
                key={index}
                onClick={() => {
                  setSelectedChar(item);
                  setIsModalVisible(true);
                }}
                style={{ cursor: 'pointer' }}
              >
                <p className={styles.textJapan}>{item.textJapan}</p>
                <p className={styles.textPronounce}>{item.textPronounce}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'amghep' && (
          <div className={styles.contentText}>
            {compoundSound.map((item, index) => (
              <div
                className={styles.textBox}
                key={index}
                onClick={() => {
                  setSelectedChar(item);
                  setIsModalVisible(true);
                }}
                style={{ cursor: 'pointer' }}
              >
                <p className={styles.textJapan}>{item.textJapan}</p>
                <p className={styles.textPronounce}>{item.textPronounce}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'amngat' && (
          <div className={styles.contentSoundField}>
            <ul>
              <li className={styles.listLatin}>
                <p>I. Khái niệm</p>
              </li>
              <ul>
                <li className={styles.listDisc}>
                  <p>
                    Gọi là âm ngắt vì khi đọc nó ngắt từ ngữ ra làm 2 bộ phận.
                    Âm ngắt trong tiếng Nhật được thể hiện bằng chữ っ.
                  </p>
                </li>
                <li className={styles.listDisc}>
                  <p>
                    Âm ngắt thường xuất hiện trong các kết hợp mà các chữ
                    Hiragana kế tiếp âm ngắt đó thuộc các hàng : か - さ - た -
                    ぱ.
                  </p>
                </li>
              </ul>
              <li className={styles.listLatin}>
                <p>II. Cách đọc</p>
              </li>
              <ul>
                <li className={styles.listDisc}>
                  <p>Âm có độ dài bằng một đơn vị âm.</p>
                </li>
                <li className={styles.listDisc}>
                  <p>
                    Khi phát âm, âm ngắt được phát âm với độ dài tương đương 1
                    phách như với các âm khác.
                  </p>
                </li>
                <li className={styles.listDisc}>
                  <p>
                    Khi đọc chúng ta gấp đôi chữ cái đầu tiên của từ sau âm
                    ngắt.
                  </p>
                  <p> Ví dụ:</p>
                  <div className={styles.flexRow}>
                    <div className={styles.flexCol}>
                      <p>にっき</p>
                      <p>ざっし</p>
                      <p>きって</p>
                      <p>いっぱい</p>
                    </div>
                    <div className={styles.flexCol}>
                      <p>ni kk i</p>
                      <p>za ss hi</p>
                      <p>ki tt e</p>
                      <p>i pp ai</p>
                    </div>
                    <div className={styles.flexCol}>
                      <p>Nhật ký</p>
                      <p>Tạp chí</p>
                      <p>Con tem</p>
                      <p>Đầy</p>
                    </div>
                  </div>
                </li>
              </ul>
              <li className={styles.listLatin}>
                <p>III. Cách viết</p>
              </li>
              <ul>
                <li className={styles.listDisc}>
                  <p>
                    Âm ngắt được viết bằng chữ っ . Cách viết giống như 1 chữ
                    nhỏ.
                  </p>
                </li>
                <li className={styles.listDisc}>
                  <p>
                    Khi viết, âm ngắt được viết nhỏ hơn, thấp hơn và hơi lui về
                    bên trái so với các chữ Hiragana khác.
                  </p>
                </li>
              </ul>
            </ul>
          </div>
        )}

        {activeTab === 'truongAm' && (
          <div className={styles.contentSoundField}>
            <ul>
              <li className={styles.listLatin}>
                <p>I. Khái niệm</p>
              </li>
              <ul>
                <li className={styles.listDisc} style={{ marginBottom: '8px' }}>
                  <p>
                    Trường âm là các nguyên âm kéo dài, có độ dài gấp đôi các
                    nguyên âm.
                  </p>
                </li>
              </ul>
              <li className={styles.listLatin}>
                <p>II. Cách đọc</p>
              </li>
              <ul style={{ marginBottom: '8px' }}>
                <li className={styles.listDisc}>
                  <p>
                    Nếu âm あ có độ dài là 1 âm thì âm ああ có độ dài là 2, nói
                    cách khác nếu dùng khái niệm đơn vị âm thì âm X có độ dài 1
                    đơn vị, còn âm XX có độ dài 2 đơn vị.
                  </p>
                </li>
              </ul>
              <li className={styles.listLatin}>
                <p>III. Cách viết</p>
              </li>
              <ul>
                <li className={styles.listDecimal}>
                  <p>
                    Trường âm của cột あ ta thêm あ sau các chữ thuộc cột あ
                  </p>
                  <p>
                    Ví dụ 1: Chữ か thuộc cột あ khi thêm trường âm ta thêm あ
                    vào sau chữ か
                  </p>
                  <ul>
                    <li className={styles.listDisc}>
                      おか あさん Mẹ (gọi mẹ của người khác)
                    </li>
                  </ul>
                  <p>
                    Ví dụ 2: Chữ ま thuộc cột あ khi ghi trường âm ta thêm あ
                    vào sau chữ ま
                  </p>
                  <ul>
                    <li className={styles.listDisc}>ま あま あ Vừa vừa</li>
                  </ul>
                </li>
                <li className={styles.listDecimal}>
                  <p>
                    Trường âm của cột い ta thêm い vào sau các chữ thuộc cột い
                  </p>
                  <p>
                    Ví dụ: Chữ じ thuộc cột い ta thêm い vào sau じ để tạo
                    thành trường âm
                  </p>
                  <ul>
                    <li className={styles.listDisc}>
                      おじ いさん Ông (gọi ông của người khác)
                    </li>
                  </ul>
                </li>
                <li className={styles.listDecimal}>
                  <p>Trường âm cột う thêm う vào sau các chữ thuộc cột う</p>
                  <p>
                    Ví dụ 1: Chữ ゆ thuộc cột う thì khi ghi trường âm ta thêm
                    chữ う vào sau chữ ゆ
                  </p>
                  <ul>
                    <li className={styles.listDisc}>ゆ う き Dũng khí</li>
                  </ul>
                  <p>
                    Ví dụ 2: Chữ く thuộc cột う thì khi ghi trường âm ta thêm
                    chữ う vào sau chữ く
                  </p>
                  <ul>
                    <li className={styles.listDisc}>く うこう Máy bay</li>
                  </ul>
                </li>
                <li className={styles.listDecimal}>
                  <p>Trường âm cột え thêm い vào sau các chữ thuộc cột え</p>
                  <p>
                    Ví dụ 1: Chữ れ thuộc cột え . Khi ghi trường âm ta thêm chữ
                    い vào sau chữ れ
                  </p>
                  <ul>
                    <li className={styles.listDisc}>れ いぶん Câu ví dụ</li>
                  </ul>
                  <p>
                    <strong style={{ fontWeight: '600' }}>Chú ý:</strong> Trong
                    nhiều trường hợp trường âm của cột え thêm え
                  </p>
                  <p>Ví dụ :</p>
                  <ul>
                    <li className={styles.listDisc}>え え Vâng</li>
                    <li className={styles.listDisc}>ね え Này</li>
                    <li className={styles.listDisc}>おね えさん Chị gái</li>
                  </ul>
                </li>
                <li className={styles.listDecimal}>
                  <p>Trường âm cột お thêm う vào sau các chữ thuộc cột お</p>
                  <p>
                    Ví dụ 1: Chữ こ thuộc cột お. Khi ghi trường âm ta thêm chữ
                    う vào sau chữ こ
                  </p>
                  <ul>
                    <li className={styles.listDisc}>
                      う こ う Trường trung học phổ thông
                    </li>
                  </ul>
                  <p>
                    Ví dụ 2: Chữ よ thuộc cột お. Khi ghi trường âm ta thêm chữ
                    う vào sau chữ よ
                  </p>
                  <ul>
                    <li className={styles.listDisc}>
                      よ うやく Dần dần, từ từ
                    </li>
                  </ul>
                  <p>
                    <strong style={{ fontWeight: '600' }}>Chú ý:</strong> Trong
                    nhiều trường hợp trường âm của cột お thêm お
                  </p>
                  <p>Ví dụ :</p>
                  <ul>
                    <li className={styles.listDisc}>お おきい To, lớn</li>
                    <li className={styles.listDisc}>お お い Nhiều</li>
                    <li className={styles.listDisc}>と お い Xa</li>
                  </ul>
                </li>
              </ul>
            </ul>
          </div>
        )}
      </div>

      <Modal
        closable={false}
        footer={null}
        onCancel={() => setIsModalVisible(false)}
        open={isModalVisible}
        width={448}
      >
        <div className={styles.contentModal}>
          <div style={{ display: 'flex' }}>
            {selectedChar?.textJapan ? (
              <KanjiSVG
                character={selectedChar.textJapan || ''}
                repeatTrigger={repeatTrigger}
              />
            ) : null}
          </div>
          <div className={styles.modalBox}>
            <p>{selectedChar?.textPronounce ?? ''}</p>
            <div className={styles.btnModal}>
              <div
                className={styles.btnRepeat}
                onClick={() => setRepeatTrigger(prev => prev + 1)}
              >
                <Repeat />
              </div>
              <div
                className={styles.btnListen}
                onClick={() =>
                  selectedChar?.textJapan && speakText(selectedChar.textJapan)
                }
              >
                <IconListen color="#0BA5EC" />
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
