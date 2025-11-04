import {
  Extension,
  onLoadDocumentPayload,
  onStoreDocumentPayload,
  afterLoadDocumentPayload,
} from "@hocuspocus/server";
import { TiptapTransformer } from "@hocuspocus/transformer";

/**
 * Database extension for Hocuspocus WebSocket server
 * 
 * Handles loading documents from and saving documents to the PostgreSQL database
 * via the Next.js API. Implements debounced saving to reduce database writes.
 */
export class DatabaseExtension implements Extension {
  private transformer = TiptapTransformer;
  private saveTimers: Map<string, NodeJS.Timeout> = new Map();
  private readonly SAVE_DEBOUNCE_MS = 30000; // Save after 30s of inactivity

  /**
   * Load document content from the database when a user first connects
   */
  async onLoadDocument(data: onLoadDocumentPayload): Promise<void> {
    const { documentName, context } = data;
    const documentId = documentName.replace("doc-", "");

    console.log(`📄 [Database] Loading document: ${documentId}`);

    try {
      const apiUrl = process.env.DATABASE_API_URL || "http://localhost:3000/api";
      const response = await fetch(
        `${apiUrl}/applications/documents/${documentId}/content`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-WS-Server-Secret": process.env.WS_SERVER_SECRET || "",
          },
        }
      );

      if (!response.ok) {
        console.error(`❌ [Database] Failed to load document ${documentId}`);
        // Return empty document - this will create a new one
        return;
      }

      const { content } = await response.json();

      if (content && content.type === "doc") {
        // Convert Tiptap JSON to Yjs document
        const yjsUpdate = this.transformer.toYdoc(content);
        data.document = yjsUpdate;
        console.log(`✅ [Database] Document ${documentId} loaded from database`);
      } else {
        console.log(`📝 [Database] No existing content for document ${documentId}, starting fresh`);
      }
    } catch (error) {
      console.error(`❌ [Database] Error loading document ${documentId}:`, error);
      // Don't throw - allow empty document to be created
    }
  }

  /**
   * Called after the document is loaded - useful for logging
   */
  async afterLoadDocument(data: afterLoadDocumentPayload): Promise<void> {
    const { documentName } = data;
    console.log(`✅ [Database] Document ready for collaboration: ${documentName}`);
  }

  /**
   * Save document content to the database
   * Debounced to prevent excessive writes
   */
  async onStoreDocument(data: onStoreDocumentPayload): Promise<void> {
    const { documentName, document, context } = data;
    const documentId = documentName.replace("doc-", "");

    // Clear existing save timer for this document
    const existingTimer = this.saveTimers.get(documentId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new debounced save timer
    const timer = setTimeout(async () => {
      await this.performSave(documentId, document, context);
      this.saveTimers.delete(documentId);
    }, this.SAVE_DEBOUNCE_MS);

    this.saveTimers.set(documentId, timer);

    console.log(
      `⏱️ [Database] Save scheduled for document ${documentId} (${this.SAVE_DEBOUNCE_MS}ms debounce)`
    );
  }

  /**
   * Perform the actual save operation to the database
   */
  private async performSave(
    documentId: string,
    document: any,
    context: any
  ): Promise<void> {
    console.log(`💾 [Database] Saving document: ${documentId}`);

    try {
      // Convert Yjs document to Tiptap JSON
      const tiptapJson = this.transformer.fromYdoc(document);
      
      const apiUrl = process.env.DATABASE_API_URL || "http://localhost:3000/api";
      const response = await fetch(
        `${apiUrl}/applications/documents/${documentId}/collaboration`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-WS-Server-Secret": process.env.WS_SERVER_SECRET || "",
          },
          body: JSON.stringify({
            content: tiptapJson,
            documentId,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`API returned ${response.status}: ${error}`);
      }

      console.log(`✅ [Database] Document ${documentId} saved successfully`);
    } catch (error) {
      console.error(`❌ [Database] Error saving document ${documentId}:`, error);
      // Don't throw - we don't want to crash the server on save errors
    }
  }

  /**
   * Cleanup when the extension is destroyed
   */
  async onDestroy(): Promise<void> {
    // Clear all pending save timers
    for (const timer of this.saveTimers.values()) {
      clearTimeout(timer);
    }
    this.saveTimers.clear();
    console.log(`🧹 [Database] Cleanup complete`);
  }
}

