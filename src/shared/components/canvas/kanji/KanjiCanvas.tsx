import {
  PlayCircleOutlined,
  RedoOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { Alert, Button, Card, Space, Typography, message } from 'antd';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import {
  HANZI_WRITER_SCRIPT,
  HANZI_WRITER_SCRIPT_ID,
  loadJapaneseCharData,
  loadScriptOnce,
  type CharacterJson,
  type HanziWriterInstance,
} from '#/shared/lib/hanziWriterJp';

const { Text } = Typography;

const WRITER_SIZE = 320;
const WRITER_PADDING = 10;

interface KanjiCanvasSharedProps {
  char?: string;
  onComplete: () => void;
}

function KanjiCanvasShared({ char = '', onComplete }: KanjiCanvasSharedProps) {
  const mountId = useId().replace(/:/g, '');
  const containerId = `hanzi-writer-mount-${mountId}`;

  const containerRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<HanziWriterInstance | null>(null);

  const [libReady, setLibReady] = useState(false);
  const [libError, setLibError] = useState('');
  const [activeChar, setActiveChar] = useState(char);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState('');
  const [showOutline] = useState(true);
  const [showCharacter] = useState(false);
  const [quizRunning, setQuizRunning] = useState(false);

  const firstChar = useCallback((s: string) => {
    const t = s.trim();
    if (!t) return '';
    return [...t][0] ?? '';
  }, []);

  useEffect(() => {
    const ch = firstChar(char);
    if (ch) setActiveChar(ch);
  }, [char, firstChar]);

  useEffect(() => {
    let cancelled = false;
    loadScriptOnce(HANZI_WRITER_SCRIPT, HANZI_WRITER_SCRIPT_ID)
      .then(() => {
        if (!cancelled) {
          if (!window.HanziWriter?.create) {
            setLibError('HanziWriter không khả dụng sau khi tải script.');
          } else {
            setLibReady(true);
          }
        }
      })
      .catch(e => {
        if (!cancelled) {
          setLibError(
            e instanceof Error ? e.message : 'Không tải được Hanzi Writer.',
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const disposeWriter = useCallback(() => {
    try {
      writerRef.current?.cancelQuiz?.();
    } catch {
      /* ignore */
    }
    writerRef.current = null;
    const el = containerRef.current;
    if (el) el.innerHTML = '';
  }, []);

  const createWriter = useCallback(
    (ch: string) => {
      const HW = window.HanziWriter;
      const el = containerRef.current;
      if (!HW?.create || !el || !ch) return;

      disposeWriter();

      setDataLoading(true);
      setDataError('');

      const writer = HW.create(el, ch, {
        width: WRITER_SIZE,
        height: WRITER_SIZE,
        padding: WRITER_PADDING,
        showOutline,
        showCharacter,
        strokeColor: '#333',
        outlineColor: '#d1d5db',
        drawingColor: '#1677ff',
        highlightColor: '#91caff',
        strokeWidth: 2,
        outlineWidth: 2,
        drawingWidth: 4,
        renderer: 'svg',
        charDataLoader: (
          character: string,
          onLoad: (data: CharacterJson) => void,
          onError: (err?: unknown) => void,
        ) => {
          loadJapaneseCharData(character, onLoad, err => {
            onError(err);
            setDataError('Không tải được dữ liệu nét (hanzi-writer-data-jp).');
            setDataLoading(false);
          });
        },
        onLoadCharDataSuccess: () => {
          setDataLoading(false);
          setDataError('');
        },
        onLoadCharDataError: () => {
          setDataLoading(false);
        },
      });

      writerRef.current = writer;
    },
    [disposeWriter, showCharacter, showOutline],
  );

  useEffect(() => {
    if (!libReady) return;
    const ch = firstChar(activeChar);
    if (!ch) return;
    createWriter(ch);
    return () => {
      disposeWriter();
    };
  }, [libReady, activeChar, createWriter, disposeWriter, firstChar]);

  const handleAnimate = async () => {
    const w = writerRef.current;
    if (!w) return;
    try {
      await w.animateCharacter?.({});
    } catch {
      message.error('Không phát được animation.');
    }
  };

  const handleQuiz = useCallback(async () => {
    const w = writerRef.current;
    if (!w) return;
    setQuizRunning(true);
    try {
      await w.quiz?.({
        onComplete: (summary: {
          totalMistakes?: number;
          character?: string;
        }) => {
          onComplete();
        },
        onMistake: () => {
          /* optional: subtle feedback */
        },
      });
    } catch {
      message.warning('Quiz đã dừng hoặc lỗi.');
    } finally {
      setQuizRunning(false);
    }
  }, [activeChar]);

  const handleCancelQuiz = () => {
    writerRef.current?.cancelQuiz?.();
    setQuizRunning(false);
  };

  /** Sau khi script + dữ liệu nét sẵn sàng mới gọi quiz — gọi chỉ khi `char` đổi (writer chưa tạo) sẽ không vẽ được. */
  useEffect(() => {
    if (!libReady || dataLoading || dataError) return;
    if (!writerRef.current) return;
    void handleQuiz();
  }, [libReady, dataLoading, dataError, activeChar, handleQuiz]);

  return (
    <Card className="w-full">
      <Space size="middle" className="w-full items-start">
        {/* <Space wrap align="center" direction="vertical">
            <Input
              style={{
                height: WRITER_SIZE,
                touchAction: 'none',
                width: WRITER_SIZE,
                fontSize: WRITER_SIZE,
              }}
              maxLength={8}
              onPressEnter={() => {}}
              placeholder="VD: 絵"
              value={char}
              onChange={() => {}}
            />
            <Space direction="vertical">
              <Button onClick={() => {}} type="primary">
                Áp dụng
              </Button>
              <Space wrap>
                <Space>
                  <Text type="secondary">Khung nét</Text>
                  <Switch checked={showOutline} onChange={() => {}} />
                </Space>
                <Space>
                  <Text type="secondary">Chữ mẫu</Text>
                  <Switch checked={showCharacter} onChange={() => {}} />
                </Space>
              </Space>
            </Space>
          </Space> */}

        {/* {libError ? <Alert type="error" message={libError} showIcon /> : null}
          {dataError ? (
            <Alert type="warning" message={dataError} showIcon />
          ) : null} */}

        <div
          className="rounded border border-gray-200 bg-white inline-block overflow-hidden"
          style={{ height: WRITER_SIZE, width: WRITER_SIZE }}
        >
          <div
            ref={containerRef}
            id={containerId}
            style={{
              height: WRITER_SIZE,
              touchAction: 'none',
              width: WRITER_SIZE,
            }}
          />
        </div>

        {/* {libReady && !dataLoading && !dataError ? (
          <Space wrap>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={handleQuiz}
              loading={quizRunning}
            >
              Luyện lại
            </Button>
            <Button icon={<RedoOutlined />} onClick={handleAnimate}>
              Xem animation
            </Button>
            {quizRunning ? (
              <Button icon={<StopOutlined />} onClick={handleCancelQuiz}>
                Dừng
              </Button>
            ) : null}
          </Space>
        ) : null} */}

        {/* <Space direction="vertical" className="flex-1">
          <Input
            style={{
              height: WRITER_SIZE,
              touchAction: 'none',
              width: WRITER_SIZE,
              fontSize: WRITER_SIZE,
            }}
            maxLength={8}
            onPressEnter={() => {}}
            placeholder="VD: 絵"
            value={char}
            onChange={() => {}}
          />
          <Space direction="vertical" className="w-full mt-6">
            <Button onClick={() => {}} type="primary" className="mb-4">
              Áp dụng
            </Button>
            <Space wrap>
              <Space>
                <Text type="secondary">Khung nét</Text>
                <Switch checked={showOutline} onChange={() => {}} />
              </Space>
              <Space>
                <Text type="secondary">Chữ mẫu</Text>
                <Switch checked={showCharacter} onChange={() => {}} />
              </Space>
            </Space>
          </Space>
        </Space> */}

        {libError ? <Alert type="error" message={libError} showIcon /> : null}
        {dataError ? (
          <Alert type="warning" message={dataError} showIcon />
        ) : null}

        {!libReady ? (
          <Text type="secondary">Đang tải Hanzi Writer…</Text>
        ) : null}
        {dataLoading ? (
          <Text type="secondary">Đang tải dữ liệu ký tự…</Text>
        ) : null}
      </Space>
    </Card>
  );
}

export default KanjiCanvasShared;
