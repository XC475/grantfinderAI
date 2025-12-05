import {
  ChatMessage,
  type ChatMessageProps,
  type Message,
} from "@/components/chat/chat-message";
import { TypingIndicator } from "@/components/ui/typing-indicator";

type AdditionalMessageOptions = Omit<ChatMessageProps, keyof Message>;

interface MessageListProps {
  messages: Message[];
  showTimeStamps?: boolean;
  isTyping?: boolean;
  messageOptions?:
    | AdditionalMessageOptions
    | ((message: Message) => AdditionalMessageOptions);
}

export function MessageList({
  messages,
  showTimeStamps = true,
  isTyping = false,
  messageOptions,
}: MessageListProps) {
  return (
    <div className="w-full flex justify-center px-4">
      <div className="w-full max-w-3xl space-y-6 overflow-visible">
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
    </div>
  );
}
