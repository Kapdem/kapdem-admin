import dynamic from "next/dynamic";
import React from "react";

interface ContentEditorWrapperProps {
  value?: string;
  onChange?: (data: string) => void;
}

const ContentEditorDynamicWrapper = dynamic(
  () => import("./ContentEditorWrapper"),
  {
    ssr: false,
  }
) as any;

export default ContentEditorDynamicWrapper;
