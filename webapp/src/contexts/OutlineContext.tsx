"use client";

import * as React from "react";

interface OutlineContextValue {
  isOpen: boolean;
  toggleOutline: () => void;
  setIsOpen: (isOpen: boolean) => void;
}

const OutlineContext = React.createContext<OutlineContextValue | undefined>(undefined);

export function OutlineProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Load state from localStorage on mount
  React.useEffect(() => {
    const savedState = localStorage.getItem("outline-open");
    if (savedState !== null) {
      setIsOpen(savedState === "true");
    }
  }, []);

  // Save state to localStorage on change
  React.useEffect(() => {
    localStorage.setItem("outline-open", String(isOpen));
  }, [isOpen]);

  const toggleOutline = React.useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const value = React.useMemo(
    () => ({
      isOpen,
      toggleOutline,
      setIsOpen,
    }),
    [isOpen, toggleOutline]
  );

  return (
    <OutlineContext.Provider value={value}>{children}</OutlineContext.Provider>
  );
}

export function useOutline() {
  const context = React.useContext(OutlineContext);
  if (!context) {
    throw new Error("useOutline must be used within an OutlineProvider");
  }
  return context;
}

// Optional version that doesn't throw - useful for components that can work without the provider
export function useOutlineOptional() {
  return React.useContext(OutlineContext);
}

