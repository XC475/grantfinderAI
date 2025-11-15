"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface DocumentContextType {
  documentTitle: string;
  documentContent: string;
  setDocumentTitle: (title: string) => void;
  setDocumentContent: (content: string) => void;
  saveStatus: "saved" | "saving" | "unsaved";
  setSaveStatus: (status: "saved" | "saving" | "unsaved") => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(
  undefined
);

export function DocumentProvider({ children }: { children: ReactNode }) {
  const [documentTitle, setDocumentTitle] = useState("");
  const [documentContent, setDocumentContent] = useState("");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">(
    "saved"
  );

  return (
    <DocumentContext.Provider
      value={{
        documentTitle,
        documentContent,
        setDocumentTitle,
        setDocumentContent,
        saveStatus,
        setSaveStatus,
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

// Optional version that doesn't throw - useful for pages that can work with or without the provider
export function useDocumentOptional() {
  return useContext(DocumentContext);
}
