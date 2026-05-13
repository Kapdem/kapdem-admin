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
          options: [10, 12, 14, 18, 20, 22],
          supportAllValues: true,
        },
      }}
    />
  );
};

export default NoSSRCKEditor;
