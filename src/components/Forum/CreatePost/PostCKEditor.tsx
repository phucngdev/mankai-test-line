import { memo, useEffect, useRef, useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  Bold,
  ClassicEditor,
  Essentials,
  Italic,
  Paragraph,
  PasteFromOffice,
  TextTransformation,
  Underline,
  Undo,
} from 'ckeditor5';

import translations from 'ckeditor5/translations/vi.js';
import 'ckeditor5/ckeditor5.css';
import './PostCKEditor.scss';
import type { PostCKEditorProps } from './PostCKEditor.types';

function PostCKEditor({
  value,
  changeData,
  placeholder = 'Bạn đang nghĩ gì?',
}: PostCKEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isLayoutReady, setIsLayoutReady] = useState(false);

  useEffect(() => {
    setIsLayoutReady(true);
    return () => setIsLayoutReady(false);
  }, []);

  const handleChange = (
    _event: unknown,
    editorInstance: { getData: () => unknown },
  ) => {
    const data = editorInstance.getData();
    changeData(typeof data === 'string' ? data : '');
  };

  return (
    <div className="post-ck-editor">
      <div ref={editorRef}>
        {isLayoutReady ? (
          <CKEditor
            config={{
              initialData: value,
              language: 'vi',
              placeholder,
              plugins: [
                Essentials,
                Bold,
                Italic,
                Underline,
                Paragraph,
                Undo,
                TextTransformation,
                PasteFromOffice,
              ],
              toolbar: [],
              translations: [translations],
            }}
            data={value ?? ''}
            editor={ClassicEditor}
            onChange={handleChange}
          />
        ) : (
          <div style={{ textAlign: 'center' }}>Nội dung</div>
        )}
      </div>
    </div>
  );
}

export default memo(PostCKEditor);
