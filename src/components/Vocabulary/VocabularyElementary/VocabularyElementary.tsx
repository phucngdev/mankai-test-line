import { useState } from 'react';
import styles from './GlobalVocabulary.module.scss';
import Hiragana from '../Hiragana/Hiragana';

import type { VocabularyElementory } from '#/api/requests/interface/PropVocabulary/PropVocabulary';
import MenuVocaElementary from '../Menu/MenuVocaElementary';
import Katakana from '../Katakana/Katakana';
import CountVocab from '../Count/CountVocab';
import TestVocab from '../testVocab/TestVocab';
import { LessonEntity } from '#/api/requests';

function VocabularyElementary(): JSX.Element {
  const [selectedId, setSelectedId] = useState<number>(() => {
    const saved = localStorage.getItem('selected_vocab_tab');
    return saved ? parseInt(saved, 10) : 1;
  });

  const menuItems: VocabularyElementory[] = [
    {
      id: 1,
      label: 'Hiragana',
      type: LessonEntity.type.HIRAGANA,
    },
    {
      id: 2,
      label: 'Katakana',
      type: LessonEntity.type.KATAKANA,
    },
    {
      id: 3,
      label: 'Số đếm',
      type: LessonEntity.type.COUNTVOCAB,
    },
    // {
    //   id: 4,
    //   label: 'Kiểm tra cuối bài',
    //   type: LessonEntity.type.TESTVOCAB,
    // },
  ];

  const handleSelect = (id: number) => {
    setSelectedId(id);
    localStorage.setItem('selected_vocab_tab', id.toString());
  };

  const currentItem = menuItems.find(item => item.id === selectedId);

  const renderForm = () => {
    if (!currentItem) return <div>Bài học không tồn tại</div>;
    const typeMap: Partial<Record<LessonEntity.type, string>> = {
      [LessonEntity.type.HIRAGANA]: 'hiragana',
      [LessonEntity.type.KATAKANA]: 'katakana',
      [LessonEntity.type.COUNTVOCAB]: 'countvocab',
      [LessonEntity.type.TESTVOCAB]: 'testvocab',
    };

    const mappedType = typeMap[currentItem.type];

    const componentsByType: Record<string, JSX.Element> = {
      countvocab: <CountVocab />,
      hiragana: <Hiragana />,
      katakana: <Katakana />,
      testvocab: <TestVocab />,
    };

    if (!mappedType || !componentsByType[mappedType]) {
      return <div>Loại bài học không tồn tại</div>;
    }

    const ComponentToRender = componentsByType[mappedType];
    return ComponentToRender || <div>Loại bài học không tồn tại</div>;
  };

  return (
    <>
      <div className={styles.main}>
        <MenuVocaElementary
          data={menuItems}
          onSelect={handleSelect}
          selectedId={selectedId}
        />
        <div className={styles.right}>{renderForm()}</div>
      </div>
    </>
  );
}

export default VocabularyElementary;
