"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface HeaderActionsContextType {
  headerActions: ReactNode | null;
  setHeaderActions: (actions: ReactNode | null) => void;
}

const HeaderActionsContext = createContext<HeaderActionsContextType>({
  headerActions: null,
  setHeaderActions: () => {},
});

export const useHeaderActions = () => useContext(HeaderActionsContext);

export function HeaderActionsProvider({ children }: { children: ReactNode }) {
  const [headerActions, setHeaderActions] = useState<ReactNode | null>(null);

  return (
    <HeaderActionsContext.Provider value={{ headerActions, setHeaderActions }}>
      {children}
    </HeaderActionsContext.Provider>
  );
}

