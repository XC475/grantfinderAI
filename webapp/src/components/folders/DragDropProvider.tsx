"use client";

import { createContext, useContext, ReactNode } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import { useState } from "react";
import { FileText, Folder } from "lucide-react";

interface DragDropContextType {
  activeId: string | null;
  activeType: "document" | "folder" | null;
}

const DragDropContext = createContext<DragDropContextType>({
  activeId: null,
  activeType: null,
});

export const useDragDrop = () => useContext(DragDropContext);

interface DragDropProviderProps {
  children: ReactNode;
  onDragEnd: (event: DragEndEvent) => void;
}

export function DragDropProvider({ children, onDragEnd }: DragDropProviderProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<"document" | "folder" | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setActiveType(event.active.data.current?.type || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    setActiveType(null);
    onDragEnd(event);
  };

  return (
    <DragDropContext.Provider value={{ activeId, activeType }}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {children}
        <DragOverlay>
          {activeId ? (
            <div className="bg-background border border-border rounded-md p-2 shadow-lg flex items-center gap-2">
              {activeType === "folder" ? (
                <Folder className="h-4 w-4" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              <span className="text-sm">
                {activeType === "folder" ? "Folder" : "Document"}
              </span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </DragDropContext.Provider>
  );
}

