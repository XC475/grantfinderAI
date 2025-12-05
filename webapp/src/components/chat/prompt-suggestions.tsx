"use client";

import { cn } from "@/lib/utils";
import { Search, Edit, FileText, BarChart, Sparkles } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface PromptSuggestionsProps {
  onCategorySelect: (category: string, starterPrompt: string) => void;
  className?: string;
}

const categories = [
  {
    id: "search",
    label: "Search",
    icon: Search,
    samplePrompts: [
      "Search for grants related to STEM education programs",
      "Find grants for improving student achievement in our district",
      "Search for funding opportunities for technology upgrades",
      "Look for grants supporting after-school programs",
    ],
  },
  {
    id: "write",
    label: "Write",
    icon: Edit,
    samplePrompts: [
      "Help me write a grant proposal for a library renovation project",
      "Draft a compelling narrative for our early childhood education program",
      "Write a needs statement for special education resources",
      "Create a budget justification for STEM equipment",
    ],
  },
  {
    id: "summarize",
    label: "Summarize",
    icon: FileText,
    samplePrompts: [
      "Summarize this 50-page grant application guidelines document",
      "Provide a brief overview of this grant opportunity",
      "Summarize the key eligibility requirements from this RFP",
      "Give me the main points from this federal grant notice",
    ],
  },
  {
    id: "analyze",
    label: "Analyze",
    icon: BarChart,
    samplePrompts: [
      "Analyze the eligibility requirements for this grant opportunity",
      "Evaluate our chances of winning this competitive grant",
      "Compare the requirements of these three grant opportunities",
      "Assess the alignment between this grant and our needs",
    ],
  },
  {
    id: "recommend",
    label: "Recommend",
    icon: Sparkles,
    samplePrompts: [
      "Recommend grants for teacher professional development",
      "Suggest funding opportunities for our music program",
      "Find grants that would support our special education services",
      "Recommend grants for mental health and counseling services",
    ],
  },
];

export function PromptSuggestions({
  onCategorySelect,
  className,
}: PromptSuggestionsProps) {
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const containerRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const handleCategoryClick = (categoryId: string) => {
    setOpenCategory(openCategory === categoryId ? null : categoryId);
  };

  const handlePromptHover = (prompt: string) => {
    onCategorySelect("hover", prompt);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!openCategory) return;

      const clickedOutside = Array.from(containerRefs.current.values()).every(
        (ref) => ref && !ref.contains(event.target as Node)
      );

      if (clickedOutside) {
        setOpenCategory(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openCategory]);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-3 mt-4",
        className
      )}
    >
      {categories.map((category) => {
        const Icon = category.icon;
        const isOpen = openCategory === category.id;

        return (
          <div
            key={category.id}
            className="relative"
            ref={(el) => {
              if (el) {
                containerRefs.current.set(category.id, el);
              } else {
                containerRefs.current.delete(category.id);
              }
            }}
          >
            <button
              onClick={() => handleCategoryClick(category.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2 text-sm font-medium text-foreground transition-all duration-200",
                "hover:bg-foreground/5 hover:border-foreground/10",
                "focus:outline-none",
                isOpen && "bg-foreground/5 border-foreground/10"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{category.label}</span>
            </button>

            {/* Dropdown with sample prompts */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 w-[320px] sm:w-[400px] rounded-xl border border-border bg-background shadow-lg p-2"
                >
                  <div className="space-y-1">
                    {category.samplePrompts.map((prompt, index) => (
                      <button
                        key={index}
                        onMouseEnter={() => handlePromptHover(prompt)}
                        onClick={() => {
                          onCategorySelect(category.id, prompt);
                          setOpenCategory(null);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2.5 rounded-lg text-sm text-foreground transition-colors",
                          "hover:bg-foreground/5 hover:text-foreground",
                          "focus:outline-none"
                        )}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
