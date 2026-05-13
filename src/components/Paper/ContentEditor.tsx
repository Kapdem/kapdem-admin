"use client";

import ContentEditorDynamicWrapper from "./ContentEditorDynamicWrapper";

interface ContentEditorProps {
  value?: string;
  onChange?: (data: string) => void;
}

const ContentEditor = ({ value = "", onChange }: ContentEditorProps) => {
  return (
    <ContentEditorDynamicWrapper value={value} onChange={onChange as any} />
  );
};

export default ContentEditor;
