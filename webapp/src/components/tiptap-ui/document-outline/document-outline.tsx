"use client";

import * as React from "react";
import { Editor } from "@tiptap/core";
import { cn } from "@/lib/utils";
import { useEditorInstance } from "@/contexts/EditorInstanceContext";
import { useOutline } from "@/contexts/OutlineContext";
import { AlignLeft, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

interface HeadingItem {
  id: string;
  text: string;
  level: number;
  pos: number;
}

export function DocumentOutline() {
  const { editor } = useEditorInstance();
  const { isOpen, toggleOutline } = useOutline();
  const [headings, setHeadings] = React.useState<HeadingItem[]>([]);
  const [activeId, setActiveId] = React.useState<string | null>(null);

  // Extract headings from the editor
  const updateHeadings = React.useCallback(() => {
    if (!editor) return;

    const newHeadings: HeadingItem[] = [];
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === "heading") {
        newHeadings.push({
          id: node.attrs.id,
          text: node.textContent,
          level: node.attrs.level,
          pos,
        });
      }
    });

    // Only update if changed (simple check)
    setHeadings((prev) => {
      if (JSON.stringify(prev) === JSON.stringify(newHeadings)) {
        return prev;
      }
      return newHeadings;
    });
  }, [editor]);

  // Subscribe to editor updates
  React.useEffect(() => {
    if (!editor) return;

    updateHeadings();

    const handleUpdate = () => {
      updateHeadings();
    };

    editor.on("update", handleUpdate);
    editor.on("selectionUpdate", handleUpdate); // In case headings are modified

    return () => {
      editor.off("update", handleUpdate);
      editor.off("selectionUpdate", handleUpdate);
    };
  }, [editor, updateHeadings]);

  // Scroll to heading
  const handleHeadingClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      // update active id immediately for better UX
      setActiveId(id);
    }
  };

  // Track active heading on scroll
  React.useEffect(() => {
    if (!headings.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-10% 0px -80% 0px", // Trigger when heading is near top
        threshold: 0,
      }
    );

    headings.forEach((heading) => {
      if (heading.id) {
        const element = document.getElementById(heading.id);
        if (element) observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [headings]);

  // Determine indentation based on level
  const getIndent = (level: number) => {
    // Base indent is 0 for H1, 12px for H2, etc.
    // We can clamp it if levels go deep
    return Math.max(0, level - 1) * 12;
  };

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 280, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="h-full border-l bg-background flex flex-col flex-shrink-0 overflow-hidden"
        >
          <div className="flex items-center justify-between p-4 border-b shrink-0 h-14">
            <span className="text-sm font-medium text-foreground flex items-center gap-2">
              <AlignLeft className="h-4 w-4" />
              Outline
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={toggleOutline}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 pb-10 space-y-1">
              {headings.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-8">
                  No headings found.
                  <br />
                  Add headings to see content here.
                </div>
              ) : (
                headings.map((heading, index) => (
                  <button
                    key={`${heading.id}-${index}`}
                    onClick={() => handleHeadingClick(heading.id)}
                    className={cn(
                      "w-full text-left text-sm py-1.5 px-2 rounded-sm transition-colors truncate block",
                      "hover:bg-accent hover:text-accent-foreground",
                      activeId === heading.id
                        ? "text-primary font-medium bg-primary/5"
                        : "text-muted-foreground"
                    )}
                    style={{ paddingLeft: `${getIndent(heading.level) + 8}px` }}
                  >
                    {heading.text || "Untitled"}
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

