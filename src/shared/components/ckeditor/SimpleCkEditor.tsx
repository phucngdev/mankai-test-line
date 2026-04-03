import React, { memo, useEffect, useRef, useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import axios from 'axios';
import type { HeadingOption } from 'ckeditor5';
import {
  AccessibilityHelp,
  Alignment,
  AutoImage,
  AutoLink,
  Autoformat,
  Autosave,
  BalloonToolbar,
  BlockQuote,
  Bold,
  ClassicEditor,
  CloudServices,
  Code,
  CodeBlock,
  Essentials,
  FindAndReplace,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  FullPage,
  GeneralHtmlSupport,
  Heading,
  Highlight,
  HorizontalLine,
  HtmlComment,
  HtmlEmbed,
  ImageBlock,
  ImageCaption,
  ImageInline,
  ImageInsert,
  ImageInsertViaUrl,
  ImageResize,
  ImageStyle,
  ImageTextAlternative,
  ImageToolbar,
  ImageUpload,
  Indent,
  IndentBlock,
  Italic,
  Link,
  LinkImage,
  List,
  ListProperties,
  Markdown,
  MediaEmbed,
  Mention,
  PageBreak,
  Paragraph,
  PasteFromMarkdownExperimental,
  PasteFromOffice,
  RemoveFormat,
  SelectAll,
  ShowBlocks,
  SimpleUploadAdapter,
  SourceEditing,
  SpecialCharacters,
  SpecialCharactersArrows,
  SpecialCharactersCurrency,
  SpecialCharactersEssentials,
  SpecialCharactersLatin,
  SpecialCharactersMathematical,
  SpecialCharactersText,
  Strikethrough,
  Subscript,
  Superscript,
  Table,
  TableCaption,
  TableCellProperties,
  TableColumnResize,
  TableProperties,
  TableToolbar,
  TextTransformation,
  TodoList,
  Underline,
  Undo,
} from 'ckeditor5';

import translations from 'ckeditor5/translations/vi.js';
import 'ckeditor5/ckeditor5.css';
import './SimpleCkEditor.scss';
// import { uploadFileToS3 } from '#/api/services/upload.service';
// import '@ckeditor/ckeditor5-build-classic/build/ckeditor.css';

interface SimpleCkEditorProps {
  changeData: (data: string) => void;
  value: string;
  onReadyRef?: any;
}

function SimpleCkEditor({
  changeData,
  value,
  onReadyRef,
}: SimpleCkEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isLayoutReady, setIsLayoutReady] = useState(false);

  useEffect(() => {
    setIsLayoutReady(true);

    return () => setIsLayoutReady(false);
  }, []);

  function uploadAdapter(loader: any) {
    return {
      upload: () =>
        new Promise((resolve, reject) => {
          loader.file.then(async (file: File) => {
            // const { publicUrl } = await uploadFileToS3(file as File);
            resolve({
              default: '',
            });
          });
        }),
    };
  }

  function uploadPlugins(editor: any) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) =>
      uploadAdapter(loader);
  }

  const editorConfig = {
    balloonToolbar: [
      'bold',
      'italic',
      '|',
      'link',
      '|',
      'bulletedList',
      'numberedList',
    ],

    fontSize: {
      options: [10, 12, 14, 16, 'default', 18, 20, 22],
      supportAllValues: true,
    },

    initialData: value,

    language: 'vi',
    plugins: [
      AccessibilityHelp,
      Alignment,
      Autoformat,
      AutoImage,
      AutoLink,
      Autosave,
      BalloonToolbar,
      BlockQuote,
      Bold,
      CloudServices,
      Code,
      CodeBlock,
      Essentials,
      FindAndReplace,
      FontBackgroundColor,
      FontColor,
      FontFamily,
      FontSize,
      FullPage,
      GeneralHtmlSupport,
      Heading,
      Highlight,
      HorizontalLine,
      HtmlComment,
      HtmlEmbed,
      ImageBlock,
      ImageCaption,
      ImageInline,
      ImageInsert,
      ImageInsertViaUrl,
      ImageResize,
      ImageStyle,
      ImageTextAlternative,
      ImageToolbar,
      ImageUpload,
      Indent,
      IndentBlock,
      Italic,
      Link,
      LinkImage,
      List,
      ListProperties,
      Markdown,
      MediaEmbed,
      Mention,
      PageBreak,
      Paragraph,
      PasteFromMarkdownExperimental,
      PasteFromOffice,
      RemoveFormat,
      SelectAll,
      ShowBlocks,
      SourceEditing,
      SpecialCharacters,
      SpecialCharactersArrows,
      SpecialCharactersCurrency,
      SpecialCharactersEssentials,
      SpecialCharactersLatin,
      SpecialCharactersMathematical,
      SpecialCharactersText,
      Strikethrough,
      Subscript,
      Superscript,
      Table,
      TableCaption,
      TableCellProperties,
      TableColumnResize,
      TableProperties,
      TableToolbar,
      TextTransformation,
      TodoList,
      Underline,
      Undo,
      SimpleUploadAdapter,
    ],
    link: {
      addTargetToExternalLinks: true,
      decorators: {
        toggleDownloadable: {
          attributes: {
            download: 'file',
          },
          label: 'Downloadable',
          mode: 'manual' as const,
        },
      },
      defaultProtocol: 'https://',
    },
    toolbar: {
      items: [
        'undo',
        'redo',
        '|',
        // 'sourceEditing',
        // 'showBlocks',
        // 'findAndReplace',
        // '|',
        // 'heading',
        // '|',
        'fontSize',
        // 'fontFamily',
        'fontColor',
        'fontBackgroundColor',
        '|',
        'bold',
        'italic',
        'underline',
        // 'strikethrough',
        // 'subscript',
        // 'superscript',
        // 'code',
        // 'removeFormat',
        '|',
        // 'specialCharacters',
        // 'horizontalLine',
        // 'pageBreak',
        // 'link',
        // 'mediaEmbed',
        // 'insertImage',
        'insertTable',
        // 'highlight',
        // 'blockQuote',
        // 'codeBlock',
        // 'htmlEmbed',
        '|',
        'alignment',
        '|',
        // 'bulletedList',
        // 'numberedList',
        // 'todoList',
        // 'outdent',
        // 'indent',
        // '|',
        // 'insertBlank',
      ],
      shouldNotGroupWhenFull: false,
    },

    list: {
      properties: {
        reversed: true,
        startIndex: true,
        styles: true,
      },
    },

    placeholder: 'Nội dung...',

    table: {
      contentToolbar: [
        'tableColumn',
        'tableRow',
        'mergeTableCells',
        'tableProperties',
        'tableCellProperties',
      ],
    },
    translations: [translations],
  };

  const handleGetValue = (_: any, editor: any) => {
    const data = editor.getData();
    changeData(data ?? '');
  };

  return (
    <div className="base-ck-custom">
      <div className="editor-container editor-container_classic-editor editor-container_include-style">
        <div className="editor-container__editor">
          <div ref={editorRef}>
            {isLayoutReady ? (
              <CKEditor
                config={{
                  ...editorConfig,
                  extraPlugins: [uploadPlugins],
                }}
                data={value ?? ''}
                editor={ClassicEditor}
                onChange={handleGetValue}
                onReady={editor => {
                  if (onReadyRef) onReadyRef(editor);
                }}
              />
            ) : (
              <div style={{ textAlign: 'center' }}>Nội dung</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(SimpleCkEditor);
