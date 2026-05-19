"use client";
import React, { useRef } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import "../../styles/ckeditor.css";

interface NoSSRCKEditorProps {
  data: string;
  onChange: (data: string) => void;
}

const NoSSRCKEditor: React.FC<NoSSRCKEditorProps> = ({ data, onChange }) => {
  const editorRef = useRef<any>(null);

  return (
    <CKEditor
      editor={ClassicEditor as any}
      data={data || ""}
      onReady={(editor: any) => {
        editorRef.current = editor;

        // If editor is ready but empty and we have data, set it manually
        if (data && editor.getData() === "") {
          editor.setData(data);
        }
      }}
      onChange={(event: any, editor: any) => {
        const newData = editor.getData();

        onChange(newData);
      }}
      config={{
        toolbar: [
          "fontSize",
          "|",
          "heading",
          "|",
          "bold",
          "italic",
          "link",
          "bulletedList",
          "numberedList",
          "|",
          "outdent",
          "indent",
          "|",
          "blockQuote",
          "insertTable",
          "mediaEmbed",
          "undo",
          "redo",
        ],
        fontSize: {
          options: [10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 32, 36, 40, 48],
          supportAllValues: true,
        },
        heading: {
          options: [
            {
              model: "paragraph",
              title: "Paragraf",
              class: "ck-heading_paragraph",
            },
            {
              model: "heading1",
              view: "h1",
              title: "Başlık 1",
              class: "ck-heading_heading1",
            },
            {
              model: "heading2",
              view: "h2",
              title: "Başlık 2",
              class: "ck-heading_heading2",
            },
            {
              model: "heading3",
              view: "h3",
              title: "Başlık 3",
              class: "ck-heading_heading3",
            },
            {
              model: "heading4",
              view: "h4",
              title: "Başlık 4",
              class: "ck-heading_heading4",
            },
          ],
        },
      }}
    />
  );
};

export default NoSSRCKEditor;
