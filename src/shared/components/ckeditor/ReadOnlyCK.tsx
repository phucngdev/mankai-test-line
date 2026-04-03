import { memo } from 'react';
import './readOnlyCK.scss';

interface ReadOnlyCKProps {
  value: string;
}

function ReadOnlyCK({ value }: ReadOnlyCKProps) {
  return (
    <div className="readonly-ck-custom">
      <div className="editor-container editor-container_classic-editor editor-container_include-style">
        <div className="editor-container__editor">
          <div
            className="ck-content"
            dangerouslySetInnerHTML={{ __html: value || '' }}
          />
        </div>
      </div>
    </div>
  );
}

export default memo(ReadOnlyCK);
