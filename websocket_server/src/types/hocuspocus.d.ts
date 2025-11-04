import "@hocuspocus/server";

/**
 * Type augmentation for Hocuspocus to include custom context data
 */
declare module "@hocuspocus/server" {
  interface ConnectionConfiguration {
    context?: {
      user?: {
        id: string;
        email: string;
        name: string;
        avatar: string | null;
      };
      documentId?: string;
      organizationId?: string;
    };
  }
}
