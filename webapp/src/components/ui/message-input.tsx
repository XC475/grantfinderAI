"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Paperclip, Square, Plus, FolderOpen } from "lucide-react";
import { omit } from "remeda";

import { cn } from "@/lib/utils";
import { useAutosizeTextArea } from "@/hooks/use-autosize-textarea";
import { Button } from "@/components/ui/button";
import { FilePreview } from "@/components/ui/file-preview";
import { InterruptPrompt } from "@/components/ui/interrupt-prompt";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MessageInputBaseProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  submitOnEnter?: boolean;
  stop?: () => void;
  isGenerating: boolean;
  enableInterrupt?: boolean;
  isEmpty?: boolean;
}

interface MessageInputWithoutAttachmentProps extends MessageInputBaseProps {
  allowAttachments?: false;
}

interface MessageInputWithAttachmentsProps extends MessageInputBaseProps {
  allowAttachments: true;
  files: File[] | null;
  setFiles: React.Dispatch<React.SetStateAction<File[] | null>>;
}

type MessageInputProps =
  | MessageInputWithoutAttachmentProps
  | MessageInputWithAttachmentsProps;

const placeholderTexts = [
  "Ask anything...",
  "Help with search...",
  "Help with writing...",
  "Find grants...",
  "Get recommendations...",
];

export function MessageInput({
  placeholder,
  className,
  onKeyDown: onKeyDownProp,
  submitOnEnter = true,
  stop,
  isGenerating,
  enableInterrupt = true,
  isEmpty = false,
  ...props
}: MessageInputProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showInterruptPrompt, setShowInterruptPrompt] = useState(false);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(
    placeholder || placeholderTexts[0]
  );

  useEffect(() => {
    if (!isGenerating) {
      setShowInterruptPrompt(false);
    }
  }, [isGenerating]);

  // Typing animation for placeholder text only when chat is empty
  useEffect(() => {
    if (placeholder || !isEmpty) {
      // Use custom placeholder or default if chat has messages
      setCurrentPlaceholder(placeholder || "Ask AI...");
      return;
    }

    let currentIndex = 0;
    let currentCharIndex = 0;
    let isPaused = false;
    let timeoutId: NodeJS.Timeout | null = null;

    const typingInterval = setInterval(() => {
      if (isPaused) return;

      const fullText = placeholderTexts[currentIndex];

      // Typing phase - add one character at a time
      currentCharIndex++;
      setCurrentPlaceholder(fullText.slice(0, currentCharIndex));

      if (currentCharIndex >= fullText.length) {
        // Finished typing, pause before changing to next phrase
        isPaused = true;
        timeoutId = setTimeout(() => {
          // Move to next phrase after pause
          currentIndex = (currentIndex + 1) % placeholderTexts.length;
          currentCharIndex = 0;
          isPaused = false;
        }, 2000); // Pause for 2 seconds before changing
      }
    }, 100); // Type one character every 100ms

    return () => {
      clearInterval(typingInterval);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [placeholder, isEmpty]);

  const addFiles = (files: File[] | null) => {
    if (props.allowAttachments) {
      props.setFiles((currentFiles) => {
        if (currentFiles === null) {
          return files;
        }

        if (files === null) {
          return currentFiles;
        }

        return [...currentFiles, ...files];
      });
    }
  };

  const onDragOver = (event: React.DragEvent) => {
    if (props.allowAttachments !== true) return;
    event.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (event: React.DragEvent) => {
    if (props.allowAttachments !== true) return;
    event.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (event: React.DragEvent) => {
    setIsDragging(false);
    if (props.allowAttachments !== true) return;
    event.preventDefault();
    const dataTransfer = event.dataTransfer;
    if (dataTransfer.files.length) {
      addFiles(Array.from(dataTransfer.files));
    }
  };

  const onPaste = (event: React.ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    const text = event.clipboardData.getData("text");
    if (text && text.length > 500 && props.allowAttachments) {
      event.preventDefault();
      const blob = new Blob([text], { type: "text/plain" });
      const file = new File([blob], "Pasted text", {
        type: "text/plain",
        lastModified: Date.now(),
      });
      addFiles([file]);
      return;
    }

    const files = Array.from(items)
      .map((item) => item.getAsFile())
      .filter((file) => file !== null);

    if (props.allowAttachments && files.length > 0) {
      addFiles(files);
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (submitOnEnter && event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      if (isGenerating && stop && enableInterrupt) {
        if (showInterruptPrompt) {
          stop();
          setShowInterruptPrompt(false);
          event.currentTarget.form?.requestSubmit();
        } else if (
          props.value ||
          (props.allowAttachments && props.files?.length)
        ) {
          setShowInterruptPrompt(true);
          return;
        }
      }

      event.currentTarget.form?.requestSubmit();
    }

    onKeyDownProp?.(event);
  };

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [textAreaHeight, setTextAreaHeight] = useState<number>(0);
  const [manualHeight, setManualHeight] = useState<number | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartY = useRef<number>(0);
  const resizeStartHeight = useRef<number>(0);

  useEffect(() => {
    if (textAreaRef.current) {
      setTextAreaHeight(textAreaRef.current.offsetHeight);
    }
  }, [props.value]);

  const showFileList =
    props.allowAttachments && props.files && props.files.length > 0;

  useAutosizeTextArea({
    ref: textAreaRef,
    maxHeight: manualHeight || 180,
    borderWidth: 1,
    dependencies: [props.value, showFileList],
  });

  // Handle resize start
  const handleResizeStart = useCallback(
    (clientY: number) => {
      if (isEmpty) return; // Don't allow resize in empty state
      setIsResizing(true);
      resizeStartY.current = clientY;
      resizeStartHeight.current = textAreaRef.current?.offsetHeight || 48;
    },
    [isEmpty]
  );

  // Handle resize move
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = resizeStartY.current - e.clientY;
      const newHeight = Math.max(
        48,
        Math.min(600, resizeStartHeight.current + deltaY)
      );
      setManualHeight(newHeight);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const deltaY = resizeStartY.current - e.touches[0].clientY;
      const newHeight = Math.max(
        48,
        Math.min(600, resizeStartHeight.current + deltaY)
      );
      setManualHeight(newHeight);
    };

    const handleEnd = () => {
      setIsResizing(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleEnd);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleEnd);
    };
  }, [isResizing]);

  return (
    <div className="w-full flex justify-center px-4">
      {enableInterrupt && (
        <InterruptPrompt
          isOpen={showInterruptPrompt}
          close={() => setShowInterruptPrompt(false)}
        />
      )}
      
      <div className="w-full max-w-2xl">
        {/* File Attachments Preview */}
        {props.allowAttachments && props.files && props.files.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            <AnimatePresence mode="popLayout">
              {props.files.map((file) => (
                <FilePreview
                  key={file.name + String(file.lastModified)}
                  file={file}
                  onRemove={() => {
                    props.setFiles((files) => {
                      if (!files) return null;
                      const filtered = Array.from(files).filter((f) => f !== file);
                      if (filtered.length === 0) return null;
                      return filtered;
                    });
                  }}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Main Input Container */}
        <div
          className={cn(
            "relative flex flex-col rounded-3xl border-2 bg-white dark:bg-zinc-900 transition-all min-h-[100px]",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border focus-within:border-primary/50"
          )}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          {/* Resize handle - only show when not empty */}
          {!isEmpty && (
            <div
              className="absolute left-0 right-0 top-0 z-30 flex h-3 cursor-ns-resize items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
              onMouseDown={(e) => handleResizeStart(e.clientY)}
              onTouchStart={(e) => handleResizeStart(e.touches[0].clientY)}
            >
              <div className="h-1 w-12 rounded-full bg-border" />
            </div>
          )}

          {/* Textarea - Top section */}
          <textarea
            aria-label="Write your prompt here"
            placeholder={currentPlaceholder}
            ref={textAreaRef}
            onPaste={onPaste}
            onKeyDown={onKeyDown}
            className="flex-1 resize-none border-0 bg-transparent px-4 pt-4 pb-2 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 min-h-[60px]"
            style={{ maxHeight: manualHeight || 180 }}
            {...(props.allowAttachments
              ? omit(props, ["allowAttachments", "files", "setFiles"])
              : omit(props, ["allowAttachments"]))}
          />

          {/* Buttons Row - Bottom section */}
          <div className="flex items-center justify-between px-4 pb-3 pt-1">
            {/* Plus Button - Bottom left */}
            {props.allowAttachments ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem
                    onClick={async () => {
                      const files = await showFileUploadDialog();
                      addFiles(files);
                    }}
                    className="cursor-pointer"
                  >
                    <Paperclip className="mr-2 h-4 w-4" />
                    <span>Attach files</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled className="cursor-not-allowed opacity-50">
                    <FolderOpen className="mr-2 h-4 w-4" />
                    <span>Google Drive (Coming Soon)</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="h-9 w-9" />
            )}

            {/* Send/Stop Button - Bottom right */}
            {isGenerating && stop ? (
              <Button
                type="button"
                size="icon"
                className="h-9 w-9 rounded-full"
                aria-label="Stop generating"
                onClick={stop}
              >
                <Square className="h-4 w-4 animate-pulse" fill="currentColor" />
              </Button>
            ) : (
              <Button
                type="submit"
                className={cn(
                  "h-9 w-9 rounded-lg bg-[#5a8bf2] hover:bg-[#4a7bd9] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0 flex items-center justify-center",
                  "dark:bg-[#d4917c] dark:hover:bg-[#c27d68]"
                )}
                aria-label="Send message"
                disabled={
                  (props.value === "" &&
                    !(
                      props.allowAttachments &&
                      props.files &&
                      props.files.length > 0
                    )) ||
                  isGenerating
                }
              >
                <ArrowUp className="h-5 w-5 text-white" />
              </Button>
            )}
          </div>

          {/* Drag & Drop Overlay */}
          {props.allowAttachments && (
            <FileUploadOverlay isDragging={isDragging} />
          )}
        </div>
      </div>
    </div>
  );
}
MessageInput.displayName = "MessageInput";

interface FileUploadOverlayProps {
  isDragging: boolean;
}

function FileUploadOverlay({ isDragging }: FileUploadOverlayProps) {
  return (
    <AnimatePresence>
      {isDragging && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center space-x-2 rounded-xl border border-dashed border-border bg-background text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          aria-hidden
        >
          <Paperclip className="h-4 w-4" />
          <span>Drop your files here to attach them.</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function showFileUploadDialog() {
  const input = document.createElement("input");

  input.type = "file";
  input.multiple = true;
  // Accept only supported file types: PDF, Word, Text, CSV
  input.accept =
    ".pdf,.docx,.txt,.csv,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/csv";
  input.click();

  return new Promise<File[] | null>((resolve) => {
    input.onchange = (e) => {
      const files = (e.currentTarget as HTMLInputElement).files;

      if (files) {
        resolve(Array.from(files));
        return;
      }

      resolve(null);
    };
  });
}
