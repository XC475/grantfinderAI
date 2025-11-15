"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface HeaderContentContextType {
  headerContent: ReactNode | null;
  setHeaderContent: (content: ReactNode | null) => void;
}

const HeaderContentContext = createContext<HeaderContentContextType>({
  headerContent: null,
  setHeaderContent: () => {},
});

export const useHeaderContent = () => useContext(HeaderContentContext);

export function HeaderContentProvider({ children }: { children: ReactNode }) {
  const [headerContent, setHeaderContent] = useState<ReactNode | null>(null);
  
  return (
    <HeaderContentContext.Provider value={{ headerContent, setHeaderContent }}>
      {children}
    </HeaderContentContext.Provider>
  );
}

