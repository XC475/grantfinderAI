"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface DocumentContextType {
  documentTitle: string;
  documentContent: string;
  setDocumentTitle: (title: string) => void;
  setDocumentContent: (content: string) => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(
  undefined
);

export function DocumentProvider({ children }: { children: ReactNode }) {
  const [documentTitle, setDocumentTitle] = useState("");
  const [documentContent, setDocumentContent] = useState("");

  return (
    <DocumentContext.Provider
      value={{
        documentTitle,
        documentContent,
        setDocumentTitle,
        setDocumentContent,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocument() {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error("useDocument must be used within a DocumentProvider");
  }
  return context;
}

