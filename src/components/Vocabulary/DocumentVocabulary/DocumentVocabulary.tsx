import { DropDownLoad, File } from '#/assets/svg/externalIcon';
import { useEffect, useState } from 'react';
import styles from './DocumentVocabulary.module.scss';
import { saveAs } from 'file-saver';
import type { DocumentVocabularyProps } from '#/api/requests/interface/DocumentVocabularyProps';

export default function DocumentVocabulary({ data }: DocumentVocabularyProps) {
  const [fileSizes, setFileSizes] = useState<Record<string, string>>({});
  useEffect(() => {
    const fetchFileSizes = async () => {
      const sizes: Record<string, string> = {};

      const allDocs = data?.flatMap(
        item => item.documents.map(doc => ({ id: doc.id, url: doc.url })) || [],
      );

      if (!allDocs) return;

      await Promise.all(
        allDocs.map(async doc => {
          try {
            const response = await fetch(doc.url, { method: 'HEAD' });
            const contentLength = response.headers.get('Content-Length');

            if (contentLength) {
              const sizeInMB = (
                parseInt(contentLength, 10) /
                (1024 * 1024)
              ).toFixed(2);
              sizes[doc.id] = `${sizeInMB}MB`;
            } else {
              sizes[doc.id] = 'Không rõ';
            }
          } catch (error) {
            console.error('Failed to fetch file size:', error);
            sizes[doc.id] = 'Không rõ';
          }
        }),
      );

      setFileSizes(sizes);
    };

    fetchFileSizes();
  }, [data]);

  const handleDownload = (url: string, name?: string) => {
    if (url) saveAs(url, name ?? 'download.pdf');
  };

  if (!data || data.length === 0) return null;

  return (
    <>
      <div className={styles.bgDoc}>
        <div className={styles.document}>
          {data.map(item =>
            item.documents.map(doc => (
              <div className={styles.boxDoc} key={doc.id}>
                <div className={styles.docFile}>
                  <div className={styles.boxFile}>
                    <File />
                  </div>

                  <div className={styles.contentFile}>
                    <p className={styles.fileTitle}>{doc.name}</p>
                    <div className={styles.textFile}>
                      <p className={styles.fileMB}>
                        {fileSizes[doc.id] ?? '...'}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={styles.downloadButton}
                  onClick={() => handleDownload(doc.url, doc.name)}
                >
                  <DropDownLoad />
                </div>
              </div>
            )),
          )}
        </div>
      </div>
    </>
  );
}
