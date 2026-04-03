import { Carousel } from 'antd';
import CarouselTopic from './CarouselTopic';
import { useEffect, useRef, useState } from 'react';
import type { KanjiDictionary } from '#/api/axios/dictionary';
import { fetchKanjiDictionaries } from '#/api/axios/dictionary';

const PAGE_LIMIT = 10;

function PrevArrow(props: any) {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        ...style,
        alignItems: 'center',
        background: 'white',
        borderRadius: '40px',
        boxShadow: '0px 0px 15px rgba(0, 0, 0, 0.10)',
        display: 'flex',
        height: '32px',
        justifyContent: 'center',
        left: '27px',
        opacity: 1,
        top: '110px',
        width: '32px',
        zIndex: 2,
      }}
    >
      <svg fill="none" height="24" viewBox="0 0 24 24" width="24">
        <path
          d="M15 6L9 12L15 18"
          stroke="#B5B5B5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}

function NextArrow(props: any) {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        ...style,
        alignItems: 'center',
        background: 'white',
        borderRadius: '40px',
        boxShadow: '0px 0px 15px rgba(0, 0, 0, 0.10)',
        display: 'flex',
        height: '32px',
        justifyContent: 'center',
        opacity: 1,
        right: '27px',
        top: '110px',
        width: '32px',
        zIndex: 2,
      }}
    >
      <svg fill="none" height="24" viewBox="0 0 24 24" width="24">
        <path
          d="M9 6L15 12L9 18"
          stroke="#B5B5B5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}

interface DictionaryProps {
  searchTerm: string;
  searchTrigger: boolean;
}

function Dictionary({ searchTerm, searchTrigger }: DictionaryProps) {
  const [kanjiList, setKanjiList] = useState<KanjiDictionary[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [maxHeight, setMaxHeight] = useState<number>(0);

  const offsetRef = useRef(0);
  const carouselRef = useRef<any>(null);
  const currentSlide = useRef(0);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  const loadKanji = async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    try {
      const data = await fetchKanjiDictionaries({
        limit: PAGE_LIMIT,
        offset: offsetRef.current,
        search: searchTerm,
      });

      const newList = offsetRef.current === 0 ? data : [...kanjiList, ...data];
      setKanjiList(newList);
      offsetRef.current += PAGE_LIMIT;

      if (data.length < PAGE_LIMIT) {
        setHasMore(false);
      }

      setTimeout(() => {
        if (carouselRef.current) {
          carouselRef.current.goTo(currentSlide.current, false);
        }

        updateHeight();
      }, 0);
    } catch (err) {
      console.error('❌ API lỗi:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateHeight = () => {
    const currentEl = slideRefs.current[currentSlide.current];

    if (currentEl) {
      setMaxHeight(currentEl.offsetHeight);
    }
  };

  useEffect(() => {
    const resetAndLoad = async () => {
      offsetRef.current = 0;
      setKanjiList([]);
      setHasMore(true);

      await loadKanji();
    };

    resetAndLoad();
  }, [searchTerm, searchTrigger]);

  const handleBeforeChange = (_: number, next: number) => {
    currentSlide.current = next;

    if (hasMore && next >= kanjiList.length - 1 && !loading) {
      loadKanji();
    }

    setTimeout(updateHeight, 100);
  };

  return (
    <section
      className="listTopicCarousel"
      style={{
        height: maxHeight,
      }}
    >
      <Carousel
        arrows
        beforeChange={handleBeforeChange}
        dots={false}
        infinite={false}
        nextArrow={<NextArrow />}
        prevArrow={<PrevArrow />}
        ref={carouselRef}
      >
        {kanjiList.map((kanji, index) => (
          <div key={index} ref={el => (slideRefs.current[index] = el)}>
            <CarouselTopic dataList={kanji} />
          </div>
        ))}
      </Carousel>
    </section>
  );
}

export default Dictionary;
