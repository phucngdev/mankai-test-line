import { useState } from 'react';
import Dictionary from '#/src/components/Dictionary/Dictionary';
import StartJourney from '#/src/components/StartJourney/StartJourney';
import './Dictionary.scss';
import { useTranslation } from 'react-i18next';

const DictionaryPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [searchClicked, setSearchClicked] = useState(false);

  const handleSearch = () => {
    setSearchTerm(inputValue);
    setSearchClicked(prev => !prev);
  };

  return (
    <div className="parentDic">
      <div className="containerListTopic">
        <section className="banner">
          <div className="searchCenter">
            <h1>{t('dictionary.kanjiLookupLabel')}</h1>
            <div className="parentsSearch">
              <input
                onChange={e => setInputValue(e.target.value)}
                placeholder={t('dictionary.vocabularySearchLabel')}
                type="text"
                value={inputValue}
              />
              <button onClick={handleSearch} type="submit">
                {t('dictionary.searchLabel')}
                <svg
                  className="decorButton"
                  fill="none"
                  height="48"
                  viewBox="0 0 77 48"
                  width="77"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g opacity="0.5">
                    <g style={{ mixBlendMode: 'soft-light' }}>
                      <rect
                        fill="#FBD3C4"
                        height="109.684"
                        transform="rotate(-27.1119 9.59521 -22.3418)"
                        width="10.8577"
                        x="9.59521"
                        y="-22.3418"
                      />
                    </g>
                    <g style={{ mixBlendMode: 'soft-light' }}>
                      <rect
                        fill="#FBD3C4"
                        height="109.684"
                        transform="rotate(-27.1119 24.3511 -22.3418)"
                        width="1.9657"
                        x="24.3511"
                        y="-22.3418"
                      />
                    </g>
                    <g style={{ mixBlendMode: 'soft-light' }}>
                      <rect
                        fill="#FBD3C4"
                        height="109.684"
                        transform="rotate(-27.1119 0.231934 -22.3418)"
                        width="5.16073"
                        x="0.231934"
                        y="-22.3418"
                      />
                    </g>
                  </g>
                </svg>
              </button>
            </div>
          </div>
        </section>
        <Dictionary searchTerm={searchTerm} searchTrigger={searchClicked} />
        <StartJourney />
      </div>
    </div>
  );
};

export default DictionaryPage;
