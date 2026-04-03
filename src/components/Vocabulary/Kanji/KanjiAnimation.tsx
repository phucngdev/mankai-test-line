import { useEffect, useState } from 'react';

interface KanjiAPIComponentProps {
  character: string;
  repeatTrigger?: number; // trigger để vẽ lại
}

interface KanjiResponse {
  svg: string;
}

export default function KanjiAPIComponent({
  character,
  repeatTrigger,
}: KanjiAPIComponentProps) {
  const [responseData, setResponseData] = useState<KanjiResponse | null>(null);

  const getUnicode = (char: string | undefined) => {
    if (!char || char.length === 0) return null;
    return char.charCodeAt(0);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!character) return;

      const unicodeValue = getUnicode(character);

      if (!unicodeValue) {
        return;
      }

      const payload = {
        data: [unicodeValue],
        lang: 'ja',
      };

      try {
        const response = await fetch(
          'https://kanji.rikkei.edu.vn/samples/_php/fetchData.php',
          {
            body: JSON.stringify(payload),
            headers: {
              'Content-Type': 'application/json',
            },
            method: 'POST',
          },
        );
        const data = await response.json();

        if (data && data.length > 0) {
          setResponseData(null);
          setTimeout(() => {
            setResponseData(data[0]);
          }, 0);
        } else {
          setResponseData(null);
        }
      } catch (error) {
        console.error('Error fetching Kanji SVG:', error);
        setResponseData(null);
      }
    };

    fetchData();
  }, [character, repeatTrigger]);

  return (
    <>
      {responseData?.svg ? (
        <div
          dangerouslySetInnerHTML={{ __html: responseData.svg }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            maxWidth: '500px',
            width: '100%',
          }}
        />
      ) : (
        <p>Không có dữ liệu SVG cho {character}</p>
      )}
    </>
  );
}
