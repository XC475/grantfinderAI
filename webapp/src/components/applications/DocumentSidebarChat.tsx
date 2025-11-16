"use client";

import { forwardRef, useCallback, useRef, useState } from "react";
import {
  ArrowDown,
  Square,
  ArrowUp,
  Plus,
  Paperclip,
  FileText,
  FolderOpen,
  X,
  File,
  Table,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { Button } from "@/components/ui/button";
import {
  ChatMessage,
  type ChatMessageProps,
  type Message,
} from "@/components/ui/chat-message";
import { CopyButton } from "@/components/ui/copy-button";
import { TypingIndicator } from "@/components/ui/typing-indicator";
import { useAutosizeTextArea } from "@/hooks/use-autosize-textarea";
import { ChatForm as BaseChatForm } from "@/components/ui/chat";
import { FilePreview } from "@/components/ui/file-preview";
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
  isEmpty: isEmptyProp,
  placeholder,
  sourceDocuments,
  onSourceDocumentsChange,
}: DocumentSidebarChatProps) {
  const lastMessage = messages.at(-1);
  const isEmpty = isEmptyProp ?? messages.length === 0;
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
        ) : null}
      </div>

      <div className="flex-shrink-0">
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
              isEmpty={isEmpty}
              placeholder={placeholder}
              files={files}
              setFiles={setFiles}
              sourceDocuments={sourceDocuments}
              onSourceDocumentsChange={onSourceDocumentsChange}
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

// Removed local ChatForm and ChatFormProps - now using BaseChatForm from @/components/ui/chat
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

// Helper function to get document icon based on file type
function getDocumentIcon(doc: SourceDocument) {
  if (!doc.fileType) {
    return <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />;
  }
  if (doc.fileType === "application/pdf") {
    return <FileText className="h-4 w-4 text-red-500 flex-shrink-0" />;
  }
  if (
    doc.fileType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />;
  }
  if (doc.fileType === "text/csv") {
    return <Table className="h-4 w-4 text-green-600 flex-shrink-0" />;
  }
  if (doc.fileType === "text/plain") {
    return <File className="h-4 w-4 text-gray-600 flex-shrink-0" />;
  }
  return <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />;
}

interface SidebarMessageInputProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  submitOnEnter?: boolean;
  stop?: () => void;
  isGenerating: boolean;
  isEmpty?: boolean;
  files?: File[] | null;
  setFiles?: React.Dispatch<React.SetStateAction<File[] | null>>;
  sourceDocuments?: SourceDocument[];
  onSourceDocumentsChange?: (docs: SourceDocument[]) => void;
}

function SidebarMessageInput({
  placeholder,
  className,
  onKeyDown: onKeyDownProp,
  submitOnEnter = true,
  stop,
  isGenerating,
  isEmpty = false,
  files,
  setFiles,
  sourceDocuments,
  onSourceDocumentsChange,
  ...textareaProps
}: SidebarMessageInputProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [sourcesModalOpen, setSourcesModalOpen] = useState(false);

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
    maxHeight: 240,
    borderWidth: 1,
    dependencies: [textareaProps.value],
  });

  // Handle file selection - create new input each time (same as MessageInput)
  const handleFileButtonClick = () => {
    if (!setFiles) return;

    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = ".pdf,.docx,.txt,.csv";

    input.onchange = (e) => {
      const selectedFiles = (e.currentTarget as HTMLInputElement).files;
      if (selectedFiles && selectedFiles.length > 0) {
        setFiles((prevFiles) => [
          ...(prevFiles || []),
          ...Array.from(selectedFiles),
        ]);
      }
    };

    input.click();
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
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

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0 && setFiles) {
      setFiles((prevFiles) => [...(prevFiles || []), ...droppedFiles]);
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedFiles = Array.from(e.clipboardData.files);
    if (pastedFiles.length > 0 && setFiles) {
      e.preventDefault();
      setFiles((prevFiles) => [...(prevFiles || []), ...pastedFiles]);
    }
  };

  const removeFile = (index: number) => {
    if (setFiles) {
      setFiles((prevFiles) => prevFiles?.filter((_, i) => i !== index) || null);
    }
  };

  const showFileList = files && files.length > 0;
  const showSourceList = sourceDocuments && sourceDocuments.length > 0;
  const hasContent = textareaProps.value !== "" || showFileList;

  return (
    <div className="w-full px-3 py-3">
      <div
        className="relative flex w-full"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="absolute inset-0 z-50 flex items-center justify-center rounded-xl border-2 border-dashed border-primary bg-primary/5">
            <p className="text-sm font-medium text-primary">Drop files here</p>
          </div>
        )}

        <div className="relative flex w-full items-center">
          <div className="relative w-full">
            {/* Source Documents Preview */}
            {showSourceList && (
              <div className="mb-2 flex flex-wrap gap-2">
                <AnimatePresence mode="popLayout">
                  {sourceDocuments?.map((doc) => (
                    <motion.div
                      key={doc.id}
                      className="relative flex max-w-[180px] rounded-md border border-primary/30 bg-primary/5 p-1.5 pr-2 text-xs"
                      layout
                      initial={{ opacity: 0, y: "100%" }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: "100%" }}
                    >
                      <div className="flex w-full items-center space-x-2">
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-sm border bg-muted">
                          {getDocumentIcon(doc)}
                        </div>
                        <span className="w-full truncate text-muted-foreground text-xs">
                          {doc.title}
                        </span>
                      </div>
                      {onSourceDocumentsChange && (
                        <button
                          className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border bg-background"
                          type="button"
                          onClick={() => {
                            onSourceDocumentsChange(
                              sourceDocuments.filter((d) => d.id !== doc.id)
                            );
                          }}
                          aria-label="Remove source"
                        >
                          <X className="h-2 w-2" />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {showFileList && (
              <div className="mb-2 flex flex-wrap gap-2">
                {files?.map((file, index) => (
                  <FilePreview
                    key={index}
                    file={file}
                    onRemove={() => removeFile(index)}
                  />
                ))}
              </div>
            )}
            <textarea
              aria-label="Write your prompt here"
              placeholder={placeholder || "Ask anything..."}
              ref={textAreaRef}
              onKeyDown={onKeyDown}
              onPaste={handlePaste}
              className={cn(
                "z-10 w-full grow resize-none rounded-xl border border-input bg-background text-sm ring-offset-background transition-[border] placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                "p-3 pr-20",
                className
              )}
              {...textareaProps}
            />
          </div>
        </div>

        <div className="absolute right-3 top-3 z-20 flex gap-1">
          {setFiles && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  aria-label="Add content"
                  disabled={isGenerating}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={handleFileButtonClick}
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
                <DropdownMenuItem
                  disabled
                  className="cursor-not-allowed opacity-50"
                >
                  <FolderOpen className="mr-2 h-4 w-4" />
                  <span>Google Drive (Coming Soon)</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {isGenerating && stop ? (
            <Button
              type="button"
              size="icon"
              className="h-8 w-8"
              aria-label="Stop generating"
              onClick={stop}
            >
              <Square className="h-3 w-3 animate-pulse" fill="currentColor" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              className="h-8 w-8 transition-opacity"
              aria-label="Send message"
              disabled={!hasContent || isGenerating}
            >
              <ArrowUp className="h-5 w-5" />
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
