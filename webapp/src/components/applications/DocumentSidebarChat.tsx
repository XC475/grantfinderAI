"use client";

import { forwardRef, useCallback, useRef, useState } from "react";
import {
  ArrowDown,
  Square,
  ArrowUp,
  Plus,
  Paperclip,
  FileText,
} from "lucide-react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { Button } from "@/components/ui/button";
import {
  ChatMessage,
  type ChatMessageProps,
  type Message,
} from "@/components/chat/chat-message";
import { CopyButton } from "@/components/ui/copy-button";
import { TypingIndicator } from "@/components/ui/typing-indicator";
import { useAutosizeTextArea } from "@/hooks/use-autosize-textarea";
import { ChatForm as BaseChatForm } from "@/components/chat/chat-container";
import { AttachmentChip } from "@/components/ui/attachment-chip";
import { type TextSelectionAttachment } from "@/components/ui/text-attachment-card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SourcesModal,
  type SourceDocument,
} from "@/components/chat/SourcesModal";
import { GoogleDriveImportPicker } from "@/components/google-drive/ImportPicker";
import { AISettingsDropdown } from "@/components/chat/ai-settings-dropdown";
import { ModelSelector } from "@/components/chat/model-selector";
import { TextAnimate } from "@/components/ui/text-animate";
import type { SubscriptionTier } from "@/types/subscriptions";

interface DocumentSidebarChatProps {
  handleSubmit: (
    event?: { preventDefault?: () => void },
    options?: { experimental_attachments?: FileList }
  ) => void;
  messages: Array<Message>;
  input: string;
  className?: string;
  handleInputChange: React.ChangeEventHandler<HTMLTextAreaElement>;
  isGenerating: boolean;
  stop?: () => void;
  setMessages?: (messages: Message[]) => void;
  isEmpty?: boolean;
  placeholder?: string;
  sourceDocuments?: SourceDocument[];
  onSourceDocumentsChange?: (docs: SourceDocument[]) => void;
  textAttachments?: TextSelectionAttachment[];
  onRemoveTextAttachment?: (index: number) => void;
  sourcesModalOpen?: boolean;
  setSourcesModalOpen?: (open: boolean) => void;
  /** Show centered hero branding when chat is empty (editor assistant only) */
  showEmptyHero?: boolean;
  /** Model selector props */
  selectedModel?: string;
  onModelChange?: (modelId: string) => void;
  userTier?: SubscriptionTier;
  enabledModelIds?: string[] | null;
  loadingModelSettings?: boolean;
}

export function DocumentSidebarChat({
  messages,
  handleSubmit,
  input,
  handleInputChange,
  stop,
  isGenerating,
  className,
  setMessages,
  placeholder,
  sourceDocuments,
  onSourceDocumentsChange,
  textAttachments,
  onRemoveTextAttachment,
  sourcesModalOpen,
  setSourcesModalOpen,
  showEmptyHero = false,
  selectedModel,
  onModelChange,
  userTier,
  enabledModelIds,
  loadingModelSettings,
}: DocumentSidebarChatProps) {
  const lastMessage = messages.at(-1);
  const isTyping = lastMessage?.role === "user";

  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  // Enhanced stop function that marks pending tool calls as cancelled
  const handleStop = useCallback(() => {
    stop?.();

    if (!setMessages) return;

    const latestMessages = [...messagesRef.current];
    const lastAssistantMessage = latestMessages.findLast(
      (m) => m.role === "assistant"
    );

    if (!lastAssistantMessage) return;

    let needsUpdate = false;
    let updatedMessage = { ...lastAssistantMessage };

    if (lastAssistantMessage.toolInvocations) {
      const updatedToolInvocations = lastAssistantMessage.toolInvocations.map(
        (toolInvocation) => {
          if (toolInvocation.state === "call") {
            needsUpdate = true;
            return {
              ...toolInvocation,
              state: "result",
              result: {
                content: "Tool execution was cancelled",
                __cancelled: true,
              },
            } as const;
          }
          return toolInvocation;
        }
      );

      if (needsUpdate) {
        updatedMessage = {
          ...updatedMessage,
          toolInvocations: updatedToolInvocations,
        };
      }
    }

    if (lastAssistantMessage.parts && lastAssistantMessage.parts.length > 0) {
      const updatedParts = lastAssistantMessage.parts.map((part) => {
        if (
          part.type === "tool-invocation" &&
          part.toolInvocation &&
          part.toolInvocation.state === "call"
        ) {
          needsUpdate = true;
          return {
            ...part,
            toolInvocation: {
              ...part.toolInvocation,
              state: "result" as const,
              result: {
                content: "Tool execution was cancelled",
                __cancelled: true,
              },
            },
          };
        }
        return part;
      });

      if (needsUpdate) {
        updatedMessage = {
          ...updatedMessage,
          parts: updatedParts,
        };
      }
    }

    if (needsUpdate) {
      const messageIndex = latestMessages.findIndex(
        (m) => m.id === lastAssistantMessage.id
      );
      if (messageIndex !== -1) {
        latestMessages[messageIndex] = updatedMessage;
        setMessages(latestMessages);
      }
    }
  }, [stop, setMessages, messagesRef]);

  const messageOptions = useCallback(
    (message: Message) => ({
      actions: (
        <CopyButton
          content={message.content}
          copyMessage="Copied response to clipboard!"
        />
      ),
    }),
    []
  );

  return (
    <ChatContainer className={className}>
      <div className="flex-1 overflow-y-auto min-h-0">
        {messages.length > 0 ? (
          <ChatMessages messages={messages}>
            <SidebarMessageList
              messages={messages}
              isTyping={isTyping}
              messageOptions={messageOptions}
            />
          </ChatMessages>
        ) : showEmptyHero ? (
          <div className="flex flex-col items-center text-center px-4 pt-6">
            <TextAnimate
              animation="blurInUp"
              by="character"
              once
              className="text-2xl md:text-3xl font-normal text-foreground font-sans"
              as="h1"
            >
              GrantWare AI
            </TextAnimate>
            <TextAnimate
              animation="blurInUp"
              by="character"
              once
              className="text-xl md:text-2xl font-normal text-muted-foreground font-sans mt-1"
              as="h2"
              delay={0.2}
            >
              Co‑Pilot
            </TextAnimate>
          </div>
        ) : null}
      </div>

      <div className="shrink-0">
        <BaseChatForm
          isPending={isGenerating || isTyping}
          handleSubmit={handleSubmit}
        >
          {({ files, setFiles }) => (
            <SidebarMessageInput
              value={input}
              onChange={handleInputChange}
              stop={handleStop}
              isGenerating={isGenerating}
              placeholder={placeholder}
              files={files}
              setFiles={setFiles}
              sourceDocuments={sourceDocuments}
              onSourceDocumentsChange={onSourceDocumentsChange}
              textAttachments={textAttachments}
              onRemoveTextAttachment={onRemoveTextAttachment}
              sourcesModalOpen={sourcesModalOpen}
              setSourcesModalOpen={setSourcesModalOpen}
              selectedModel={selectedModel}
              onModelChange={onModelChange}
              userTier={userTier}
              enabledModelIds={enabledModelIds}
              loadingModelSettings={loadingModelSettings}
            />
          )}
        </BaseChatForm>
      </div>
    </ChatContainer>
  );
}
DocumentSidebarChat.displayName = "DocumentSidebarChat";

export function ChatMessages({
  messages,
  children,
}: React.PropsWithChildren<{
  messages: Message[];
}>) {
  const {
    containerRef,
    scrollToBottom,
    handleScroll,
    shouldAutoScroll,
    handleTouchStart,
  } = useAutoScroll([messages]);

  return (
    <div className="relative h-full">
      <div
        className="h-full overflow-y-auto pb-4 px-3"
        ref={containerRef}
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
      >
        {children}
      </div>

      {!shouldAutoScroll && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none">
          <Button
            onClick={() => scrollToBottom("smooth")}
            className="pointer-events-auto h-8 w-8 rounded-full bg-background border border-border shadow-md hover:shadow-lg hover:bg-accent ease-in-out animate-in fade-in-0 slide-in-from-bottom-1"
            size="icon"
            variant="ghost"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export const ChatContainer = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex flex-col h-full w-full overflow-hidden", className)}
      {...props}
    />
  );
});
ChatContainer.displayName = "ChatContainer";

// Removed local ChatForm and ChatFormProps - now using BaseChatForm from @/components/chat/chat-container
// which properly manages file state and clears files after submission

type AdditionalMessageOptions = Omit<ChatMessageProps, keyof Message>;

interface SidebarMessageListProps {
  messages: Message[];
  showTimeStamps?: boolean;
  isTyping?: boolean;
  messageOptions?:
    | AdditionalMessageOptions
    | ((message: Message) => AdditionalMessageOptions);
}

function SidebarMessageList({
  messages,
  showTimeStamps = true,
  isTyping = false,
  messageOptions,
}: SidebarMessageListProps) {
  return (
    <div className="space-y-6 overflow-visible">
      {messages.map((message, index) => {
        const additionalOptions =
          typeof messageOptions === "function"
            ? messageOptions(message)
            : messageOptions;

        return (
          <ChatMessage
            key={index}
            showTimeStamp={showTimeStamps}
            {...message}
            {...additionalOptions}
          />
        );
      })}
      {isTyping && <TypingIndicator />}
    </div>
  );
}

interface SidebarMessageInputProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  submitOnEnter?: boolean;
  stop?: () => void;
  isGenerating: boolean;
  files?: File[] | null;
  setFiles?: React.Dispatch<React.SetStateAction<File[] | null>>;
  sourceDocuments?: SourceDocument[];
  onSourceDocumentsChange?: (docs: SourceDocument[]) => void;
  textAttachments?: TextSelectionAttachment[];
  onRemoveTextAttachment?: (index: number) => void;
  sourcesModalOpen?: boolean;
  setSourcesModalOpen?: (open: boolean) => void;
  selectedModel?: string;
  onModelChange?: (modelId: string) => void;
  userTier?: SubscriptionTier;
  enabledModelIds?: string[] | null;
  loadingModelSettings?: boolean;
}

function SidebarMessageInput({
  placeholder,
  className,
  onKeyDown: onKeyDownProp,
  submitOnEnter = true,
  stop,
  isGenerating,
  files,
  setFiles,
  sourceDocuments,
  onSourceDocumentsChange,
  textAttachments,
  onRemoveTextAttachment,
  sourcesModalOpen: sourcesModalOpenProp,
  setSourcesModalOpen: setSourcesModalOpenProp,
  selectedModel,
  onModelChange,
  userTier,
  enabledModelIds,
  loadingModelSettings,
  ...textareaProps
}: SidebarMessageInputProps) {
  const [isDragging, setIsDragging] = useState(false);
  // Use local state as fallback if props not provided
  const [localSourcesModalOpen, setLocalSourcesModalOpen] = useState(false);
  const sourcesModalOpen = sourcesModalOpenProp ?? localSourcesModalOpen;
  const setSourcesModalOpen = setSourcesModalOpenProp ?? setLocalSourcesModalOpen;

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (submitOnEnter && event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }

    onKeyDownProp?.(event);
  };

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useAutosizeTextArea({
    ref: textAreaRef,
    maxHeight: 240, // Keep current sizing
    borderWidth: 1,
    dependencies: [textareaProps.value, files],
  });

  // Handle file selection
  const showFileUploadDialog = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept =
      ".pdf,.docx,.txt,.csv,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/csv";
    input.click();

    return new Promise<File[] | null>((resolve) => {
      input.onchange = (e) => {
        const selectedFiles = (e.currentTarget as HTMLInputElement).files;
        if (selectedFiles) {
          resolve(Array.from(selectedFiles));
        } else {
          resolve(null);
        }
      };
    });
  };

  const addFiles = async (newFiles: File[] | null) => {
    if (!setFiles || !newFiles) return;
    setFiles((prevFiles) => {
      if (!prevFiles) return newFiles;
      return [...prevFiles, ...newFiles];
    });
  };

  const handleDriveFilesSelected = (driveFiles: File[]) => {
    addFiles(driveFiles);
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    if (!setFiles) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!setFiles) return;
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      addFiles(droppedFiles);
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    if (!setFiles) return;
    const items = e.clipboardData?.items;
    if (!items) return;

    const text = e.clipboardData.getData("text");
    if (text && text.length > 500) {
      e.preventDefault();
      const blob = new Blob([text], { type: "text/plain" });
      // Create File object from blob using window.File to avoid conflict with lucide-react File icon
      const file = new window.File([blob], "Pasted text.txt", {
        type: "text/plain",
      });
      addFiles([file]);
      return;
    }

    const pastedFiles = Array.from(items)
      .map((item) => item.getAsFile())
      .filter((file) => file !== null) as File[];

    if (pastedFiles.length > 0) {
      addFiles(pastedFiles);
    }
  };

  const removeFile = (index: number) => {
    if (setFiles) {
      setFiles((prevFiles) => {
        if (!prevFiles) return null;
        const filtered = prevFiles.filter((_, i) => i !== index);
        return filtered.length > 0 ? filtered : null;
      });
    }
  };

  const showFileList = files && files.length > 0;
  const showSourceList = sourceDocuments && sourceDocuments.length > 0;
  const showTextAttachments = textAttachments && textAttachments.length > 0;
  const showAnyAttachments = showFileList || showSourceList || showTextAttachments;
  const hasContent = textareaProps.value !== "" || showFileList || showTextAttachments;

  return (
    <div className="w-full px-3 py-3">
      {/* Unified Attachments Section */}
      {showAnyAttachments && (
        <div className="mb-3 flex flex-wrap gap-2">
          <AnimatePresence mode="popLayout">
            {/* Text Selection Attachments */}
            {textAttachments?.map((attachment, index) => (
              <AttachmentChip
                key={attachment.id}
                type="text"
                title={attachment.name}
                preview={attachment.preview}
                onRemove={() => onRemoveTextAttachment?.(index)}
              />
            ))}
            {/* File Attachments */}
            {files?.map((file, index) => (
              <AttachmentChip
                key={file.name + String(file.lastModified)}
                type="file"
                title={file.name}
                fileType={file.type}
                onRemove={() => removeFile(index)}
              />
            ))}
            {/* Source Documents */}
            {sourceDocuments?.map((doc) => (
              <AttachmentChip
                key={doc.id}
                type="source"
                title={doc.title}
                fileType={doc.fileType}
                onRemove={
                  onSourceDocumentsChange
                    ? () => onSourceDocumentsChange(sourceDocuments.filter((d) => d.id !== doc.id))
                    : undefined
                }
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Main Input Container */}
      <div
        className={cn(
          "relative flex flex-col rounded-xl border border-input bg-white dark:bg-zinc-900 transition-all",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border focus-within:border-primary"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Drag & Drop Overlay */}
        {isDragging && setFiles && (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center space-x-2 rounded-xl border border-dashed border-border bg-background text-sm text-muted-foreground">
            <Paperclip className="h-4 w-4" />
            <span>Drop your files here to attach them.</span>
          </div>
        )}

        {/* Textarea */}
        <div className="w-full">
          <textarea
            aria-label="Write your prompt here"
            placeholder={placeholder || "How can I help you with this document?"}
            ref={textAreaRef}
            onKeyDown={onKeyDown}
            onPaste={handlePaste}
            className={cn(
              "z-10 w-full grow resize-none rounded-t-xl bg-transparent border-0 text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
              "p-3",
              className
            )}
            {...textareaProps}
          />
        </div>

        {/* Bottom Control Bar */}
        <div className="flex items-center justify-between flex-wrap gap-1 px-2 pb-2">
          {/* Left group: + and AI settings */}
          <div className="flex items-center gap-1">
            {setFiles && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    aria-label="Add content"
                    disabled={isGenerating}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem
                    onClick={async () => {
                      const selectedFiles = await showFileUploadDialog();
                      if (selectedFiles) {
                        addFiles(selectedFiles);
                      }
                    }}
                    className="cursor-pointer"
                  >
                    <Paperclip className="mr-2 h-4 w-4" />
                    <span>Attach files</span>
                  </DropdownMenuItem>
                  {onSourceDocumentsChange && (
                    <DropdownMenuItem
                      onClick={() => setSourcesModalOpen(true)}
                      className="cursor-pointer"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      <span>Add sources</span>
                    </DropdownMenuItem>
                  )}
                  <GoogleDriveImportPicker
                    mode="attach"
                    onFilesSelected={handleDriveFilesSelected}
                  >
                    {({ onClick }) => (
                      <DropdownMenuItem
                        onClick={onClick}
                        className="cursor-pointer"
                      >
                        <Image
                          src="/logos/google-drive.svg"
                          alt="Google Drive"
                          width={16}
                          height={16}
                          className="mr-2"
                        />
                        <span>Google Drive</span>
                      </DropdownMenuItem>
                    )}
                  </GoogleDriveImportPicker>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* AI Settings Button */}
            <AISettingsDropdown
              assistantType="editor"
              size="small"
              align="start"
              disabled={isGenerating}
            />

            {/* Model Selector */}
            {selectedModel && onModelChange && (
              <ModelSelector
                selectedModel={selectedModel}
                onModelChange={onModelChange}
                assistantType="editor"
                userTier={userTier}
                enabledModelIds={enabledModelIds}
                disabled={isGenerating || loadingModelSettings}
              />
            )}
          </div>

          {/* Right: Send / Stop button */}
          {isGenerating && stop ? (
            <Button
              type="button"
              size="icon"
              className={cn(
                "h-8 w-8 bg-[#5a8bf2] hover:bg-[#4a7bd9] transition-colors",
                "dark:bg-[#d4917c] dark:hover:bg-[#c27d68]"
              )}
              aria-label="Stop generating"
              onClick={stop}
            >
              <Square
                className="h-3 w-3 animate-pulse text-white"
                fill="currentColor"
              />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              className={cn(
                "h-8 w-8 bg-[#5a8bf2] hover:bg-[#4a7bd9] disabled:opacity-50 disabled:cursor-not-allowed transition-opacity",
                "dark:bg-[#d4917c] dark:hover:bg-[#c27d68]"
              )}
              aria-label="Send message"
              disabled={!hasContent || isGenerating}
            >
              <ArrowUp className="h-5 w-5 text-white" />
            </Button>
          )}
        </div>
      </div>

      {/* Sources Modal */}
      {onSourceDocumentsChange && (
        <SourcesModal
          open={sourcesModalOpen}
          onOpenChange={setSourcesModalOpen}
          onSelectDocuments={(docs) => {
            onSourceDocumentsChange(docs);
          }}
          selectedDocumentIds={sourceDocuments?.map((d) => d.id) || []}
        />
      )}
    </div>
  );
}
