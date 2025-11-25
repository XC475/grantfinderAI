"use client";

import * as React from "react";
import type { Editor } from "@tiptap/core";

interface EditorInstanceContextValue {
  editor: Editor | null;
  setEditor: (editor: Editor | null) => void;
}

const EditorInstanceContext = React.createContext<EditorInstanceContextValue>({
  editor: null,
  setEditor: () => {},
});

export function EditorInstanceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [editor, setEditor] = React.useState<Editor | null>(null);

  const value = React.useMemo(
    () => ({
      editor,
      setEditor,
    }),
    [editor]
  );

  return (
    <EditorInstanceContext.Provider value={value}>
      {children}
    </EditorInstanceContext.Provider>
  );
}

export function useEditorInstance() {
  const context = React.useContext(EditorInstanceContext);
  if (!context) {
    throw new Error("useEditorInstance must be used within EditorInstanceProvider");
  }
  return context;
}

