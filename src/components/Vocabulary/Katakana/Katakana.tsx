import { useState } from 'react'; // thêm useState
import { IconListen, Repeat } from '#/assets/svg/externalIcon';
import styles from '../Hiragana/Hiragana.module.scss';
import { Modal } from 'antd';
import TitleVideoVocabulary from '../TitleVideoVocabulary/TitleVideoVocabulary';
import {
  katakanaData,
  katakanaSoundChange,
  katakanaYouon,
} from './katakana_alphabet';
import KanjiSVG from '#/shared/components/KanjiSVG/KanjiSVG';

type TabKey = 'bangChuCai' | 'truongAm' | 'bienam' | 'amghep' | 'amngat';

export default function Hiragana() {
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

  const hiraganaList = katakanaData.text.map(item => ({
    textJapan: item.kana,
    textPronounce: item.romaji,
  }));

  const soundChange = katakanaSoundChange.text.map(item => ({
    textJapan: item.kana,
    textPronounce: item.romaji,
  }));

  const compoundSound = katakanaYouon.text.map(item => ({
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
          <p className={styles.title}>Katakana</p>
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
                    Âm ngắt trong tiếng Nhật được thể hiện bằng chữ ッ.
                  </p>
                </li>
                <li className={styles.listDisc}>
                  <p>
                    Âm ngắt được sử dụng trước các âm thuộc hàng: カ, タ, サ,
                    ザ, ダ ...
                  </p>
                  <p> Ví dụ:</p>
                  <div className={styles.flexRow}>
                    <div className={styles.flexCol}>
                      <p>コ ッ プ</p>
                      <p>チ ッ キン</p>
                    </div>
                    <div className={styles.flexCol}>
                      <p>Cái cốc</p>
                      <p>Thịt gà</p>
                    </div>
                  </div>
                </li>
              </ul>
              <li className={styles.listLatin}>
                <p>II. Cách đọc</p>
              </li>
              <ul>
                <li className={styles.listDisc}>
                  <p>Âm ngắt có độ dài bằng một đơn vị âm.</p>
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
                      <p>サッカー</p>
                      <p>バッグ</p>
                      <p>カット</p>
                      <p>クッキ</p>
                    </div>
                    <div className={styles.flexCol}>
                      <p>sa kk a</p>
                      <p>ba gg u</p>
                      <p>ka tt o</p>
                      <p>ku kk i</p>
                    </div>
                    <div className={styles.flexCol}>
                      <p>Bóng đá</p>
                      <p>Túi xách</p>
                      <p>Cắt</p>
                      <p>Bánh quy</p>
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
                    Âm ngắt được viết bằng chữ ッ . Cách viết giống như 1 chữ ツ
                    nhỏ.
                  </p>
                </li>
                <li className={styles.listDisc}>
                  <p>
                    Khi viết, âm ngắt được viết nhỏ hơn, thấp hơn và hơi lui về
                    bên trái so với các chữ katakana khác.
                  </p>
                  <p> Ví dụ:</p>
                  <div className={styles.flexRow}>
                    <div className={styles.flexCol}>
                      <p>コ ッ プ</p>
                      <p>ベ ッ ト</p>
                    </div>
                    <div className={styles.flexCol}>
                      <p>Cái cốc</p>
                      <p>Cái giường</p>
                    </div>
                  </div>
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
                    Trường âm là những nguyên âm kéo dài, có độ dài gấp đôi các
                    nguyên âm [ア] [イ] [ウ] [エ] [オ]
                  </p>
                </li>
              </ul>
              <li className={styles.listLatin}>
                <p>II. Cách ghi</p>
              </li>
              <ul style={{ marginBottom: '8px' }}>
                <li className={styles.listNone}>
                  <p>Sử dụng kí hiệu trường âm ―</p>
                </li>
                <li className={styles.ex}>
                  <p>Ví dụ:</p>
                </li>
                <li className={styles.listDisc}>
                  <p>カ ー ド : Thẻ bưu thiếp</p>
                </li>
                <li className={styles.listDisc}>
                  <p>タクシ ー : Taxi</p>
                </li>
                <li className={styles.listDisc}>
                  <p>ス ー パ ー : Siêu thị</p>
                </li>
                <li className={styles.listDisc}>
                  <p>ノ ー ト : Quyển vở</p>
                </li>
                <li className={styles.listDisc}>
                  <p>エスカレ ー タ ー : Thang cuốn</p>
                </li>
              </ul>
              <li className={styles.listLatin}>
                <p>III. Cách viết</p>
              </li>
              <ul>
                <li className={styles.listNone}>
                  <p>
                    Nếu âm ア có độ dài là 1 thì âm アー có độ dài là 2, nói
                    cách khác nếu dung khái niệm đợn vị âm thì âm ア có độ dài 1
                    đơn vị, còn âm アー có độ dài 2 đơn vị.
                  </p>
                </li>
                <ul>
                  <li className={styles.listDecimal}>
                    <p>
                      Trường âm của cột ア khi đọc sẽ kéo dài âm ア thành 2 đơn
                      vị âm.
                    </p>
                    <p>Ví dụ:</p>
                    <li className={styles.listDisc}>
                      カ ード kaado Thẻ, bưu thiếp
                    </li>
                  </li>
                  <li className={styles.listDecimal}>
                    <p>
                      Trường âm của cột イ khi đọc sẽ kéo dài âm イ thành 2 đơn
                      vị âm.
                    </p>
                    <p>Ví dụ: </p>
                    <li className={styles.listDisc}>
                      ディズニ ーランド dizuniirando Disneyland
                    </li>
                  </li>
                  <li className={styles.listDecimal}>
                    <p>
                      Trường âm của cột ウ khi đọc sẽ kéo dài âm ウ thành 2 đơn
                      vị âm.
                    </p>
                    <p>Ví dụ:</p>
                    <li className={styles.listDisc}>
                      ク ーラ ー kuuraa Máy lạnh
                    </li>
                  </li>
                  <li className={styles.listDecimal}>
                    <p>
                      Trường âm của cột エ khi đọc sẽ kéo dài âm エ thành 2 đơn
                      vị âm.
                    </p>
                    <p>Ví dụ:</p>
                    <li className={styles.listDisc}>
                      セ ータ ー seiitaa Áo len
                    </li>
                  </li>
                  <li className={styles.listDecimal}>
                    <p>
                      Trường âm của cột オ khi đọc sẽ kéo dài âm オ thành 2 đơn
                      vị âm.
                    </p>
                    <p>Ví dụ:</p>
                    <li className={styles.listDisc}>
                      オ ーバ ー oobaa Áo choàng
                    </li>
                  </li>
                </ul>
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
