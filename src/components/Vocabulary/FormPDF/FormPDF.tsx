import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Addition,
  DropArrow,
  Pdf,
  SquareArrow,
  Subtraction,
  IconPrev,
  IconNext,
} from '#/assets/svg/externalIcon';
import styles from './FormPDF.module.scss';

import TitleVocabulary from '../TitleVocabulary/TitleVocabulary';
import { useSelector } from 'react-redux';
import type { RootState } from '#/shared/redux/store';
import { useAppDispatch } from '#/shared/redux/store';
import {
  getLessionById,
  postLessionProgress,
} from '#/shared/redux/thunk/LessionThunk';
import { getSlideByIdLession } from '#/shared/redux/thunk/SlideThunk';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import FilterVocabulary from '../FilterVocabulary/FilterVocabulary';
import { updateLessionProgress } from '#/shared/redux/slices/LessionSlice';
import type { SlideProps } from '#/api/requests/interface/SlideProps';
import { countPptxSlidesFromUrl } from '#/shared/lib/countPptxSlides';
import { useTranslation } from 'react-i18next';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

export default function FormPDF({ lessonId, onClickNext }: SlideProps) {
  const { t } = useTranslation();
  const dataById = useSelector((state: RootState) => state.lession.dataById);
  const { data } = useSelector((state: RootState) => state.slide);
  const [scale, setScale] = useState(1);
  const [pptSlideIndex, setPptSlideIndex] = useState(1);
  const [pptSlideCount, setPptSlideCount] = useState<number | null>(null);
  const [numPages, setNumPages] = useState<number>();
  const [squareArrow, setSquareArrow] = useState(false);
  const dispatch = useAppDispatch();
  const [translateY, setTranslateY] = useState(0);
  const [startY, setStartY] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const isAnyCompleted = data ? data.some(item => item.description) : true;
  const [hasPostedProgress, setHasPostedProgress] = useState(false);
  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set([1]));
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pptResetContextRef = useRef<{ lessonId?: string; slideUrl?: string }>(
    {},
  );
  const [isDocumentReady, setIsDocumentReady] = useState(false);
  const isPdf = data?.[0]?.slideUrl?.includes('pdf');
  const isPptx = data?.[0]?.slideUrl?.includes('pptx');
  const canGoNextPpt =
    isPptx &&
    (pptSlideCount != null && pptSlideCount > 0
      ? pptSlideIndex < pptSlideCount
      : true);

  const getPptxEmbedSrc = (slideIndex: number) => {
    const slideUrl = data?.[0]?.slideUrl;
    if (!slideUrl) return '';

    // Các tham số `wd*` của Office Web Viewer không được công khai đầy đủ,
    // nhưng `wdSlideIndex` thường dùng để chuyển slide.
    const params = new URLSearchParams({
      wdSlideIndex: String(slideIndex),
      wdHidePageNav: 'True',
      wdHideHeader: 'True',
      wdHideFooter: 'True',
      wdDownloadButton: 'False',
      wdPrintButton: 'False',
      wdHideControls: 'True',
    });

    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
      slideUrl,
    )}&${params.toString()}`;
  };

  useEffect(() => {
    if (isPptx) {
      dispatch(postLessionProgress({ lessonId, progress: 100 }));
      dispatch(updateLessionProgress({ lessonId, progress: 100 }));
    }
  }, [isPptx, lessonId]);

  const onDocumentLoadSuccess = (pdf: any) => {
    setNumPages(pdf.numPages);
    setIsDocumentReady(true);
  };

  const onDocumentLoadError = (error: any) => {
    console.error('PDF load error:', error);
  };

  const fetchData = async () => {
    if (lessonId) {
      await Promise.all([
        dispatch(
          getSlideByIdLession({
            id: lessonId,
          }),
        ),
        dispatch(getLessionById(lessonId)),
      ]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [lessonId]);

  useEffect(() => {
    const url = data?.[0]?.slideUrl;
    if (!isPptx || !url) return;
    const prev = pptResetContextRef.current;
    if (prev.lessonId !== lessonId || prev.slideUrl !== url) {
      pptResetContextRef.current = { lessonId, slideUrl: url };
      setPptSlideIndex(1);
      setPptSlideCount(null);
      return;
    }
    if (pptSlideCount != null && pptSlideCount > 0) {
      setPptSlideIndex(prevIdx =>
        prevIdx > pptSlideCount ? pptSlideCount : prevIdx,
      );
    }
  }, [lessonId, isPptx, data?.[0]?.slideUrl, pptSlideCount]);

  useEffect(() => {
    const url = data?.[0]?.slideUrl;
    if (!isPptx || !url) {
      setPptSlideCount(null);
      return;
    }
    let cancelled = false;
    void countPptxSlidesFromUrl(url).then(n => {
      if (!cancelled) setPptSlideCount(n);
    });
    return () => {
      cancelled = true;
    };
  }, [isPptx, data?.[0]?.slideUrl]);

  const handleScroll = useCallback(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || !numPages || !isDocumentReady) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
    const scrollPercent = scrollTop / (scrollHeight - clientHeight);

    // Tính toán trang nào đang được xem dựa trên scroll position
    const currentViewPage = Math.ceil(scrollPercent * numPages) || 1;

    // Load thêm trang khi scroll gần đến cuối các trang đã load
    const maxLoadedPage = Math.max(...Array.from(loadedPages));
    const shouldLoadMore = currentViewPage >= maxLoadedPage - 1;

    if (shouldLoadMore && maxLoadedPage < numPages) {
      setLoadedPages(prev => {
        const newSet = new Set(prev);

        // Load thêm 2 trang tiếp theo để tránh load quá nhiều
        for (
          let i = maxLoadedPage + 1;
          i <= Math.min(numPages, maxLoadedPage + 2);
          i++
        ) {
          newSet.add(i);
        }

        return newSet;
      });
    }

    // Progress tracking
    const nearBottom = scrollTop + clientHeight >= scrollHeight - 20;

    if (nearBottom && !hasPostedProgress) {
      dispatch(postLessionProgress({ lessonId, progress: 100 }));
      dispatch(updateLessionProgress({ lessonId, progress: 100 }));
      setHasPostedProgress(true);
    }
  }, [
    numPages,
    loadedPages,
    hasPostedProgress,
    lessonId,
    dispatch,
    isDocumentReady,
  ]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setStartY(e.clientY);
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || startY === null) return;
      const deltaY = e.clientY - startY;
      const clamped = Math.min(
        0,
        Math.max(-250, isOpen ? -250 + deltaY : deltaY),
      );
      setTranslateY(clamped);
    };

    const handleMouseUp = () => {
      if (isDragging) {
        if (translateY < -100) {
          setIsOpen(true);
          setTranslateY(-250);
        } else {
          setIsOpen(false);
          setTranslateY(0);
        }
      }

      setIsDragging(false);
      setStartY(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startY, translateY, isOpen]);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    // Throttle scroll event để tránh gọi quá nhiều
    let ticking = false;

    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    scrollContainer.addEventListener('scroll', throttledScroll);
    return () => scrollContainer.removeEventListener('scroll', throttledScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (squareArrow) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [squareArrow]);

  const handleSquareArrow = () => {
    setSquareArrow(!squareArrow);
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };

  // Component cho từng trang với error handling tốt hơn
  function PageComponent({ pageNum }: { pageNum: number }) {
    const isLoaded = loadedPages.has(pageNum);
    const [pageError, setPageError] = useState<string | null>(null);
    const [isPageLoading, setIsPageLoading] = useState(false);

    const handleLoadPage = () => {
      if (!isDocumentReady || isPageLoading) return;

      setIsPageLoading(true);
      setPageError(null);
      setLoadedPages(prev => new Set([...prev, pageNum]));
    };

    const handlePageLoadSuccess = () => {
      setIsPageLoading(false);
    };

    const handlePageLoadError = (error: any) => {
      setIsPageLoading(false);
      setPageError(`Lỗi tải trang ${pageNum}: ${error.message}`);
      console.error(`Error loading page ${pageNum}:`, error);
    };

    return (
      <div
        style={{
          alignItems: 'center',
          backgroundColor: isLoaded ? 'transparent' : '#f9f9f9',
          border: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '10px',
          minHeight: isLoaded ? 'auto' : '600px',
          position: 'relative',
        }}
      >
        {isLoaded ? (
          <div style={{ width: '100%' }}>
            {pageError ? (
              <div
                style={{
                  backgroundColor: '#ffebee',
                  color: '#d32f2f',
                  padding: '40px',
                  textAlign: 'center',
                }}
              >
                <p>{pageError}</p>
                <button
                  onClick={() => {
                    setPageError(null);
                    handleLoadPage();
                  }}
                  style={{
                    backgroundColor: '#1976d2',
                    border: 'none',
                    borderRadius: '4px',
                    color: 'white',
                    cursor: 'pointer',
                    marginTop: '10px',
                    padding: '8px 16px',
                  }}
                >
                  Thử lại
                </button>
              </div>
            ) : (
              <Page
                key={`page_${pageNum}`}
                loading={
                  <div style={{ padding: '40px', textAlign: 'center' }}>
                    <p>Đang tải trang {pageNum}...</p>
                  </div>
                }
                onLoadError={handlePageLoadError}
                onLoadSuccess={handlePageLoadSuccess}
                pageNumber={pageNum}
                renderAnnotationLayer={false}
                renderTextLayer={false}
                scale={scale}
              />
            )}
          </div>
        ) : (
          <div
            onClick={isDocumentReady ? handleLoadPage : undefined}
            style={{
              color: '#666',
              cursor: isDocumentReady ? 'pointer' : 'default',
              opacity: isDocumentReady ? 1 : 0.5,
              padding: '40px',
              textAlign: 'center',
            }}
          >
            {isPageLoading ? (
              <>
                <p style={{ fontSize: '16px', marginBottom: '8px' }}>
                  Đang tải trang {pageNum}...
                </p>
                <div
                  style={{
                    animation: 'spin 1s linear infinite',
                    border: '2px solid #f3f3f3',
                    borderRadius: '50%',
                    borderTop: '2px solid #1976d2',
                    height: '20px',
                    margin: '0 auto',
                    width: '20px',
                  }}
                />
              </>
            ) : (
              <>
                <p style={{ fontSize: '16px', marginBottom: '8px' }}>
                  Trang {pageNum}
                </p>
                <p style={{ color: '#999', fontSize: '12px' }}>
                  {isDocumentReady
                    ? 'Click để tải trang này'
                    : 'Đang chuẩn bị document...'}
                </p>
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    data && (
      <div className={styles.boxContent}>
        <TitleVocabulary
          description={t('titleVocabulary.descriptionPdf')}
          icon={<Pdf color="#F37142" />}
          isAnyCompleted={isAnyCompleted}
          onClickNext={onClickNext}
          title={dataById?.title}
        />
        {isPptx && (
          <div className={styles.formSlide}>
            <div
              className={`${styles.frameSlide}`}
              style={
                squareArrow
                  ? {
                      bottom: '0',
                      left: '0',
                      maxHeight: '100%',
                      position: 'fixed',
                      right: '0',
                      top: '0',
                      zIndex: '100',
                    }
                  : undefined
              }
            >
              <div className={styles.menuSlide}>
                {/* <div onClick={handleZoomOut} style={{ cursor: 'pointer' }}>
                  <Subtraction />
                </div> */}
                <div
                  className={styles.divText}
                  style={{
                    background: '#3d3d3d',
                    color: '#fff',
                    padding: '5px 8px',
                    borderRadius: 8,
                  }}
                >
                  <p className={styles.text}>Powerpoint</p>
                </div>
                {/* <div onClick={handleZoomIn} style={{ cursor: 'pointer' }}>
                  <Addition />
                </div> */}
                {/* <div className={styles.boxSlide}>
                  <div
                    onClick={e => {
                      e.stopPropagation();
                      e.preventDefault();
                      if (pptSlideIndex <= 1) return;
                      setPptSlideIndex(prev => Math.max(1, prev - 1));
                    }}
                    style={{
                      cursor: pptSlideIndex > 1 ? 'pointer' : 'not-allowed',
                      opacity: pptSlideIndex > 1 ? 1 : 0.4,
                      pointerEvents: pptSlideIndex > 1 ? 'auto' : 'none',
                    }}
                  >
                    <IconPrev />
                  </div>
                  <div className={styles.divText}>
                    <p className={styles.text}>
                      {pptSlideCount != null && pptSlideCount > 0
                        ? `Slide ${pptSlideIndex}/${pptSlideCount}`
                        : `Slide ${pptSlideIndex}`}
                    </p>
                  </div>
                  <div
                    onClick={e => {
                      e.stopPropagation();
                      e.preventDefault();
                      if (!canGoNextPpt) {
                        dispatch(
                          postLessionProgress({ lessonId, progress: 100 }),
                        );
                        dispatch(
                          updateLessionProgress({ lessonId, progress: 100 }),
                        );
                        return;
                      }
                      if (pptSlideCount != null && pptSlideCount > 0) {
                        setPptSlideIndex(prev =>
                          Math.min(pptSlideCount, prev + 1),
                        );
                      } else {
                        setPptSlideIndex(prev => prev + 1);
                      }
                    }}
                    style={{
                      cursor: canGoNextPpt ? 'pointer' : 'not-allowed',
                      opacity: canGoNextPpt ? 1 : 0.4,
                      pointerEvents: canGoNextPpt ? 'auto' : 'none',
                    }}
                  >
                    <IconNext />
                  </div>
                </div> */}
                <div>|</div>
                <div className={styles.squareArrow} onClick={handleSquareArrow}>
                  <SquareArrow />
                </div>
              </div>

              <div className={styles.scrollContent} ref={scrollContainerRef}>
                {data?.[0]?.slideUrl ? (
                  <div
                    className={styles.pptxContainer}
                    style={{
                      width: '100%',
                      height: squareArrow ? '100%' : `${600 * scale}px`,
                      display: 'flex',
                    }}
                  >
                    <div className={styles.pptxOverlayRight}></div>
                    <div className={styles.pptxOverlayLeft}></div>
                    <div
                      style={{
                        transform: `scale(${scale})`,
                        transformOrigin: 'top left',
                        width: '100%',
                      }}
                    >
                      <iframe
                        key={`ppt_slide_${pptSlideIndex}`}
                        title="pptx-viewer"
                        src={getPptxEmbedSrc(pptSlideIndex)}
                        width="100%"
                        height={squareArrow ? '100%' : '600px'}
                        frameBorder="0"
                        style={{ border: 'none', display: 'block' }}
                      />
                    </div>
                  </div>
                ) : (
                  <p>Không có dữ liệu PPTX.</p>
                )}
              </div>
            </div>
          </div>
        )}
        {isPdf && (
          <div className={styles.formSlide}>
            <div
              className={`${styles.frameSlide}`}
              style={
                squareArrow
                  ? {
                      bottom: '0',
                      left: '0',
                      maxHeight: '100%',
                      position: 'fixed',
                      right: '0',
                      top: '0',
                      zIndex: '100',
                    }
                  : undefined
              }
            >
              <div className={styles.menuSlide}>
                <div className={styles.boxSlide}>
                  <div onClick={handleZoomOut} style={{ cursor: 'pointer' }}>
                    <Subtraction />
                  </div>
                  <div className={styles.divText}>
                    <p className={styles.text}>{Math.round(scale * 100)}%</p>
                  </div>
                  <div onClick={handleZoomIn} style={{ cursor: 'pointer' }}>
                    <Addition />
                  </div>
                </div>
                <div>|</div>
                <div className={styles.squareArrow} onClick={handleSquareArrow}>
                  <SquareArrow />
                </div>
              </div>
              <div className={styles.scrollContent} ref={scrollContainerRef}>
                <div
                  className={styles.headerText}
                  style={{
                    alignItems: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: `${squareArrow ? 'unset' : '500px'}`,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top center',
                  }}
                >
                  {data[0]?.slideUrl ? (
                    <Document
                      error={
                        <div
                          style={{
                            color: '#d32f2f',
                            padding: '40px',
                            textAlign: 'center',
                          }}
                        >
                          <p>Không thể tải PDF.</p>
                          <button
                            onClick={() => window.location.reload()}
                            style={{
                              backgroundColor: '#1976d2',
                              border: 'none',
                              borderRadius: '4px',
                              color: 'white',
                              cursor: 'pointer',
                              marginTop: '10px',
                              padding: '8px 16px',
                            }}
                          >
                            Tải lại trang
                          </button>
                        </div>
                      }
                      file={data[0].slideUrl}
                      loading={
                        <div style={{ padding: '40px', textAlign: 'center' }}>
                          <p>Đang tải tài liệu...</p>
                        </div>
                      }
                      noData={
                        <div style={{ padding: '40px', textAlign: 'center' }}>
                          <p>Không có dữ liệu PDF.</p>
                        </div>
                      }
                      onLoadError={onDocumentLoadError}
                      onLoadSuccess={onDocumentLoadSuccess}
                    >
                      {isDocumentReady && numPages
                        ? Array.from(new Array(numPages), (_, index) => (
                            <PageComponent
                              key={`page_${index + 1}`}
                              pageNum={index + 1}
                            />
                          ))
                        : null}
                    </Document>
                  ) : (
                    <p>Không có dữ liệu PDF.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className={styles.contentTitle}>
          <div
            className={styles.contentTitle}
            style={{
              transform: `translateY(${translateY}px)`,
              transition: isDragging ? 'none' : 'transform 0.3s ease',
            }}
          >
            <div className={styles.dropDown} onMouseDown={handleMouseDown}>
              <DropArrow />
            </div>
            <div className={styles.filterWrapper}>
              <FilterVocabulary data={data} dataComent={lessonId} />
            </div>
          </div>
        </div>
      </div>
    )
  );
}
