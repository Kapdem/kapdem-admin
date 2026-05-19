"use client";

import { useState, useEffect, useRef } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import translations from "ckeditor5/translations/tr.js";
import { getSignedURL } from "@/lib/admin/action";

import {
  ClassicEditor,
  Alignment,
  Autoformat,
  AutoImage,
  AutoLink,
  Autosave,
  BlockQuote,
  Bold,
  CloudServices,
  Code,
  Essentials,
  FindAndReplace,
  FontBackgroundColor,
  FontColor,
  FontSize,
  Heading,
  Highlight,
  HorizontalLine,
  ImageBlock,
  ImageCaption,
  ImageInline,
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
  Paragraph,
  PasteFromOffice,
  RemoveFormat,
  SelectAll,
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
} from "ckeditor5";

import "./revert.css";
import "ckeditor5/ckeditor5.css";

function uploadAdapter(loader) {
  return {
    upload: () => {
      return new Promise(async (resolve, reject) => {
        try {
          const file = await loader.file;
          const timestamp = Date.now();
          const extension = file.name.split(".").pop().toLowerCase();
          const filename = `pic${timestamp}.${extension}`;

          // Step 1: Get the signed URL
          const signedURL = await getSignedURL(filename, "image");

          // Step 2: Upload the file to S3 using the signed URL
          const response = await fetch(signedURL, {
            method: "PUT",
            body: file,
            headers: {
              "Content-Type": file.type,
            },
          });

          if (response.ok) {
            // Step 3: Resolve the URL of the uploaded file
            const fileURL = signedURL.split("?")[0];
            resolve({
              default: fileURL,
            });
          } else {
            reject(`Upload failed with status: ${response.status}`);
          }
        } catch (error) {
          reject("Upload failed");
        }
      });
    },
    abort: () => {},
  };
}

function uploadPlugin(editor) {
  editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
    return uploadAdapter(loader);
  };
}

export default function ContentEditorWrapper({ value, onChange = () => {} }) {
  const editorContainerRef = useRef(null);
  const editorRef = useRef(null);
  const [isLayoutReady, setIsLayoutReady] = useState(false);

  useEffect(() => {
    setIsLayoutReady(true);

    return () => setIsLayoutReady(false);
  }, []);

  const editorConfig = {
    toolbar: {
      items: [
        "undo",
        "redo",
        "|",
        "heading",
        "|",
        "fontSize",
        "fontColor",
        "fontBackgroundColor",
        "|",
        "bold",
        "italic",
        "underline",
        "|",
        "link",
        "insertTable",
        "highlight",
        "blockQuote",
        "|",
        "alignment",
        "|",
        "bulletedList",
        "numberedList",
        "todoList",
        "outdent",
        "indent",
      ],
      shouldNotGroupWhenFull: false,
    },
    plugins: [
      Alignment,
      Autoformat,
      AutoImage,
      AutoLink,
      Autosave,
      BlockQuote,
      Bold,
      CloudServices,
      Code,
      Essentials,
      FindAndReplace,
      FontBackgroundColor,
      FontColor,
      FontSize,
      Heading,
      Highlight,
      HorizontalLine,
      ImageBlock,
      ImageCaption,
      ImageInline,
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
      Paragraph,
      PasteFromOffice,
      RemoveFormat,
      SelectAll,
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
    ],
    extraPlugins: [uploadPlugin],
    fontSize: {
      options: [10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 32, 36, 40, 48],
      supportAllValues: true,
    },
    heading: {
      options: [
        {
          model: "paragraph",
          title: "Paragraph",
          class: "ck-heading_paragraph",
        },
        {
          model: "heading1",
          view: "h1",
          title: "Heading 1",
          class: "ck-heading_heading1",
        },
        {
          model: "heading2",
          view: "h2",
          title: "Heading 2",
          class: "ck-heading_heading2",
        },
        {
          model: "heading3",
          view: "h3",
          title: "Heading 3",
          class: "ck-heading_heading3",
        },
        {
          model: "heading4",
          view: "h4",
          title: "Heading 4",
          class: "ck-heading_heading4",
        },
        {
          model: "heading5",
          view: "h5",
          title: "Heading 5",
          class: "ck-heading_heading5",
        },
        {
          model: "heading6",
          view: "h6",
          title: "Heading 6",
          class: "ck-heading_heading6",
        },
      ],
    },
    image: {
      toolbar: [
        "toggleImageCaption",
        "imageTextAlternative",
        "|",
        "imageStyle:inline",
        "imageStyle:wrapText",
        "imageStyle:breakText",
        "|",
        "resizeImage",
      ],
    },
    language: "tr",
    link: {
      addTargetToExternalLinks: true,
      defaultProtocol: "https://",
      decorators: {
        toggleDownloadable: {
          mode: "manual",
          label: "Downloadable",
          attributes: {
            download: "file",
          },
        },
      },
    },
    list: {
      properties: {
        styles: true,
        startIndex: true,
        reversed: true,
      },
    },
    menuBar: {
      isVisible: true,
    },
    placeholder: "İçeriği buraya yazınız...",
    table: {
      contentToolbar: [
        "tableColumn",
        "tableRow",
        "mergeTableCells",
        "tableProperties",
        "tableCellProperties",
      ],
    },
    translations: [translations],
  };

  return (
    <div>
      <div className="main-container">
        <div
          className="editor-container editor-container_classic-editor"
          ref={editorContainerRef}
        >
          <div className="editor-container__editor">
            <div ref={editorRef}>
              {isLayoutReady && (
                <CKEditor
                  data={value}
                  onChange={(event, editor) => {
                    const data = editor.getData();

                    onChange(data);
                  }}
                  editor={ClassicEditor}
                  config={editorConfig}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
