import { createClient } from "@/utils/supabase/server";
import type { PrismaClient } from "@/generated/prisma";

/**
 * Delete a chat attachment file from Supabase Storage
 * @param fileUrl Full URL like "https://.../chat-attachments/userId/file.pdf"
 * @returns true if deleted, false if failed
 */
export async function deleteChatAttachmentFromStorage(
  fileUrl: string
): Promise<boolean> {
  try {
    const supabase = await createClient();

    // Extract path from URL
    // URL format: https://.../storage/v1/object/public/chat-attachments/{path}
    const parts = fileUrl.split("/chat-attachments/");
    if (parts.length < 2) {
      console.error("Invalid fileUrl format for chat attachment:", fileUrl);
      return false;
    }

    const filePath = parts[1]; // e.g., "userId/abc123.pdf"

    const { error } = await supabase.storage
      .from("chat-attachments")
      .remove([filePath]);

    if (error) {
      console.error("Chat attachment deletion failed:", {
        filePath,
        error,
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error("Chat attachment storage cleanup error:", error);
    return false;
  }
}

/**
 * Get all attachment URLs for a specific chat
 * @param chatId The chat ID
 * @param prisma Prisma client
 * @returns Array of attachment file URLs
 */
export async function getChatAttachments(
  chatId: string,
  prisma: PrismaClient
): Promise<string[]> {
  const attachmentUrls: string[] = [];

  try {
    // Get all messages for this chat
    const messages = await prisma.aiChatMessage.findMany({
      where: { chatId },
      select: { metadata: true },
    });

    // Extract attachment URLs from metadata
    for (const message of messages) {
      if (message.metadata && typeof message.metadata === "object") {
        const metadata = message.metadata as {
          attachments?: Array<{ url?: string }>;
        };
        if (Array.isArray(metadata.attachments)) {
          for (const attachment of metadata.attachments) {
            if (attachment.url) {
              attachmentUrls.push(attachment.url);
            }
          }
        }
      }
    }

    return attachmentUrls;
  } catch (error) {
    console.error(`Error fetching attachments for chat ${chatId}:`, error);
    return [];
  }
}

/**
 * Delete all attachments for a specific chat
 * @param chatId The chat ID
 * @param prisma Prisma client
 * @returns Number of successfully deleted files
 */
export async function deleteAllChatAttachments(
  chatId: string,
  prisma: PrismaClient
): Promise<number> {
  try {
    // Get all attachment URLs for this chat
    const attachmentUrls = await getChatAttachments(chatId, prisma);

    if (attachmentUrls.length === 0) {
      return 0;
    }

    // Delete each attachment from storage
    let successCount = 0;

    for (const url of attachmentUrls) {
      const success = await deleteChatAttachmentFromStorage(url);
      if (success) {
        successCount++;
      }
    }

    return successCount;
  } catch (error) {
    console.error(`Error deleting attachments for chat ${chatId}:`, error);
    return 0;
  }
}

/**
 * Delete all chat attachments for a specific user (all their chats)
 * @param userId The user ID
 * @param prisma Prisma client
 * @returns Total number of successfully deleted files across all chats
 */
export async function deleteAllUserChatAttachments(
  userId: string,
  prisma: PrismaClient
): Promise<number> {
  try {
    // Get all chats for this user
    const userChats = await prisma.aiChat.findMany({
      where: { userId },
      select: { id: true },
    });

    if (userChats.length === 0) {
      return 0;
    }

    // Delete attachments for each chat
    let totalDeleted = 0;

    for (const chat of userChats) {
      const deletedCount = await deleteAllChatAttachments(chat.id, prisma);
      totalDeleted += deletedCount;
    }

    return totalDeleted;
  } catch (error) {
    console.error(`Error deleting attachments for user ${userId}:`, error);
    return 0;
  }
}
