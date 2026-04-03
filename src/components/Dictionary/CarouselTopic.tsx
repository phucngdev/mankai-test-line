import { Table } from 'antd';
import type { TableProps } from 'antd';
import { useTranslation } from 'react-i18next';

interface DataType {
  key: string;
  name: string;
  meaning: string;
  suggest: string;
  suggest2: string;
}

function CarouselTopic(dataList: any) {
  const { t } = useTranslation();
  const lookalikes = dataList.dataList.lookalikes || [];
  const allJukugo = (dataList.dataList.jukugo || []).flat().filter(Boolean);

  const columns: TableProps<DataType>['columns'] = [
    {
      dataIndex: 'name',
      key: 'name',
      render: text => <a className="first-css-col">{text}</a>,
      width: 64,
    },
    {
      dataIndex: 'meaning',
      key: 'meaning',
      render: text => <a className="seccond-css-col">{text}</a>,
      title: `${t('dictionary.meaningLabel')}`,
      width: 608,
    },
    {
      align: 'center',
      dataIndex: 'suggest',
      key: 'suggest',
      render: text => <a className="seccond-css-col">{text}</a>,
      title: `${t('dictionary.suggestionLabel')}`,
      width: 240,
    },
    {
      align: 'center',
      dataIndex: 'suggest2',
      key: 'suggest2',
      render: text => <a className="first-css-col">{text}</a>,
      title: `${t('dictionary.suggestionLabel')}`,
      width: 240,
    },
  ];

  const data: DataType[] = lookalikes.map((item: any, index: any) => ({
    key: item._id || `${index}`,
    meaning: item.meaning,
    name: item.kanji,
    suggest: item.hint,
    suggest2: item.radical,
  }));

  return (
    <div className="topicParent">
      <div className="topicTitle">
        <p className="pageination">
          {t('dictionary.vocabularyLabel')} {dataList.dataList.index}/1768
        </p>
        <p className="vocabulary">
          {dataList.dataList.kanji}
          <span>{dataList.dataList.meaning}</span>
        </p>
      </div>
      <div className="topicsDetail">
        <div className="topicDetail">
          <h1>Onyomi</h1>
          {dataList.dataList.onyomi ? (
            <p>
              <strong>{dataList.dataList.onyomi?.split('\n')[0]}</strong>
              <svg
                fill="none"
                height="4"
                viewBox="0 0 4 4"
                width="4"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="2" cy="2" fill="#676767" r="2" />
              </svg>
              {dataList.dataList.onyomi?.split('\n').slice(1).join(' ')}
            </p>
          ) : (
            ''
          )}
        </div>
      </div>
      <div className="topicsDetail">
        <div className="topicDetail">
          <h1>Kunyomi</h1>
          {dataList.dataList.kunyomi?.map((item: any, index: number) => (
            <div
              className="kunyomi"
              key={index}
              style={{
                alignItems: 'flex-start',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: '4px',
              }}
            >
              <div className="kunyomi-sino" style={{ width: '100px' }}>
                {item.sino}
              </div>
              <div
                className="kunyomi-svg"
                style={{ textAlign: 'center', width: '8px' }}
              >
                <svg
                  fill="none"
                  height="4"
                  style={{ marginTop: '6px' }}
                  viewBox="0 0 4 4"
                  width="4"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="2" cy="2" fill="#676767" r="2" />
                </svg>
              </div>
              <div className="kunyomi-english" style={{ flex: 1 }}>
                {item.english}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="topicsDetail">
        <div className="topicDetail">
          <h1>Mnemonic</h1>
          <p>
            {dataList.dataList.mnemonic
              ? dataList.dataList.mnemonic
              : 'Không có nghĩa'}
          </p>
        </div>
      </div>
      <div className="topicsDetail">
        <div className="topicDetail">
          <h1>Jukugo</h1>
          {allJukugo.map((item: any, index: number) => {
            const textCount = item.texts?.length || 0;

            return (
              <div
                className="tableTopic"
                key={index}
                style={{
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  marginBottom: '16px',
                }}
              >
                <div className="specialTopic" style={{ width: '10%' }}>
                  <strong>{item.sino}</strong>
                  <span style={{ fontSize: '14px' }}>{item.japan}</span>
                </div>

                <div className="specialTopic" style={{ width: '90%' }}>
                  <span className="Jukugo-english">{item.english}</span>
                  {textCount === 3 && (
                    <span className="Jukugo-texts-english">
                      <strong>{item.texts[0].sino}</strong>{' '}
                      {item.texts[0].english} +{' '}
                      <strong>{item.texts[1].sino}</strong>{' '}
                      {item.texts[1].english} ={' '}
                      <strong>{item.texts[2].sino}</strong>{' '}
                      {item.texts[2].english}
                    </span>
                  )}

                  {textCount === 4 && (
                    <span className="Jukugo-texts-english">
                      <strong>{item?.texts[0].sino}</strong>{' '}
                      {item.texts[0].english} +{' '}
                      <strong>{item?.texts[1].sino}</strong>{' '}
                      {item.texts[1].english} +{' '}
                      <strong>{item.texts[2].sino}</strong>{' '}
                      {item.texts[2].english} ={' '}
                      <strong>{item.texts[3].sino}</strong>{' '}
                      {item.texts[3].english}
                    </span>
                  )}

                  {textCount === 5 && (
                    <span className="Jukugo-texts-english">
                      <strong>{item.texts[0].sino}</strong>{' '}
                      {item.texts[0].english} +{' '}
                      <strong>{item.texts[1].sino}</strong>{' '}
                      {item.texts[1].english} +{' '}
                      <strong>{item.texts[2].sino}</strong>{' '}
                      {item.texts[2].english} +{' '}
                      <strong>{item.texts[3].sino}</strong>{' '}
                      {item.texts[3].english} ={' '}
                      <strong>{item.texts[4].sino}</strong>{' '}
                      {item.texts[4].english}
                    </span>
                  )}

                  <p>{item?.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="topicsDetail">
        <div className="topicDetail">
          <h1>Lookalikes</h1>
          <Table<DataType>
            className="custom-table-antd"
            columns={columns}
            dataSource={data}
            pagination={false}
            scroll={{ x: 'auto' }}
          />
        </div>
      </div>
      <div className="topicsDetail">
        <div className="topicDetail">
          <h1>Synonyms</h1>
          <div className="flex-gap-16-column">
            {dataList.dataList.synonyms?.map((item: any, index: number) => (
              <div className="end-text" key={index}>
                <p>{item.english}</p>
                <p>
                  <span>{item.sino}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CarouselTopic;
