import { Extension, onAuthenticatePayload } from "@hocuspocus/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Response structure from the document access verification API
 */
interface DocumentAccessResponse {
  organizationId: string;
  hasAccess: boolean;
}

/**
 * Authentication extension for Hocuspocus WebSocket server
 *
 * Verifies that users are authenticated via Supabase and have access
 * to the document they're trying to collaborate on.
 */
export class AuthExtension implements Extension {
  private supabase;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase credentials in environment variables");
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async onAuthenticate(data: onAuthenticatePayload): Promise<void> {
    const { documentName, requestParameters } = data;

    console.log(
      `🔐 [Auth] Authenticating connection for document: ${documentName}`
    );
    console.log(`🔑 [Auth] Request parameters:`, requestParameters);

    // Extract token from URL parameters (sent by y-websocket provider)
    const token = requestParameters.get("token");

    // Extract document ID from document name (format: "doc-{documentId}")
    const documentId = documentName.replace("doc-", "");

    if (!documentId) {
      console.error(`❌ [Auth] Invalid document name format: ${documentName}`);
      throw new Error("Invalid document name");
    }

    // Verify token with Supabase
    if (!token) {
      console.error(`❌ [Auth] No authentication token provided`);
      console.error(
        `❌ [Auth] Available parameters:`,
        Object.keys(requestParameters)
      );
      throw new Error("Authentication required");
    }

    try {
      const {
        data: { user },
        error: authError,
      } = await this.supabase.auth.getUser(token);

      if (authError || !user) {
        console.error(`❌ [Auth] Invalid token or user not found:`, authError);
        throw new Error("Invalid authentication token");
      }

      console.log(`✅ [Auth] User authenticated: ${user.email} (${user.id})`);

      // Verify user has access to the document
      // Call Next.js API to check if user's organization owns this document
      const apiUrl =
        process.env.DATABASE_API_URL || "http://localhost:3000/api";
      const response = await fetch(
        `${apiUrl}/applications/verify-document-access`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "X-WS-Server-Secret": process.env.WS_SERVER_SECRET || "",
          },
          body: JSON.stringify({
            documentId,
            userId: user.id,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error(
          `❌ [Auth] Access denied for document ${documentId}:`,
          error
        );
        throw new Error("Access denied to document");
      }

      const accessData = (await response.json()) as DocumentAccessResponse;
      console.log(`✅ [Auth] Access verified for document ${documentId}`);

      // Store user metadata in the connection context for presence features
      data.connection.readOnly = false;
      (data.connection as any).context = {
        user: {
          id: user.id,
          email: user.email ?? "unknown@example.com",
          name: user.user_metadata?.name ?? user.email ?? "Unknown User",
          avatar: user.user_metadata?.avatar_url ?? null,
        },
        documentId,
        organizationId: accessData.organizationId,
      };
    } catch (error) {
      console.error(`❌ [Auth] Authentication failed:`, error);
      throw new Error(
        error instanceof Error ? error.message : "Authentication failed"
      );
    }
  }
}
