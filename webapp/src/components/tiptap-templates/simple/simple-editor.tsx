"use client";

import * as React from "react";
import { EditorContent, EditorContext, useEditor } from "@tiptap/react";

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Selection } from "@tiptap/extensions";

// --- Collaboration Extensions ---
import { Collaboration } from "@tiptap/extension-collaboration";
import { CollaborationCursor } from "@tiptap/extension-collaboration-cursor";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button";
import { Spacer } from "@/components/tiptap-ui-primitive/spacer";
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar";

// --- Tiptap Node ---
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension";
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension";
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss";
import "@/components/tiptap-node/code-block-node/code-block-node.scss";
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss";
import "@/components/tiptap-node/list-node/list-node.scss";
import "@/components/tiptap-node/image-node/image-node.scss";
import "@/components/tiptap-node/heading-node/heading-node.scss";
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss";

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu";
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button";
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu";
import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button";
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button";
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from "@/components/tiptap-ui/color-highlight-popover";
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from "@/components/tiptap-ui/link-popover";
import { MarkButton } from "@/components/tiptap-ui/mark-button";
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button";
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button";

// --- Icons ---
import { ArrowLeftIcon } from "@/components/tiptap-icons/arrow-left-icon";
import { HighlighterIcon } from "@/components/tiptap-icons/highlighter-icon";
import { LinkIcon } from "@/components/tiptap-icons/link-icon";

// --- Hooks ---
import { useIsMobile } from "@/hooks/use-mobile";
import { useWindowSize } from "@/hooks/use-window-size";
import { useCursorVisibility } from "@/hooks/use-cursor-visibility";

// --- Components ---

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils";

// --- Styles ---
import "@/components/tiptap-templates/simple/simple-editor.scss";

import content from "@/components/tiptap-templates/simple/data/content.json";

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  isMobile,
}: {
  onHighlighterClick: () => void;
  onLinkClick: () => void;
  isMobile: boolean;
}) => {
  return (
    <>
      <Spacer />

      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu levels={[1, 2, 3, 4]} portal={isMobile} />
        <ListDropdownMenu
          types={["bulletList", "orderedList", "taskList"]}
          portal={isMobile}
        />
        <BlockquoteButton />
        <CodeBlockButton />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ImageUploadButton text="Add" />
      </ToolbarGroup>

      <Spacer />
    </>
  );
};

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: "highlighter" | "link";
  onBack: () => void;
}) => (
  <>
    <ToolbarGroup>
      <Button data-style="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? (
      <ColorHighlightPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
);

interface CollaborationConfig {
  documentId: string;
  user: {
    id: string;
    name: string;
    color: string;
    avatar?: string | null;
  };
  websocketUrl: string;
  authToken: string;
  onConnectionStatusChange?: (isConnected: boolean) => void;
  onActiveUsersChange?: (users: any[]) => void;
}

interface SimpleEditorProps {
  initialContent?: string;
  onContentChange?: (content: string) => void;
  collaborationConfig?: CollaborationConfig;
}

export function SimpleEditor({
  initialContent,
  onContentChange,
  collaborationConfig,
}: SimpleEditorProps = {}) {
  const isMobile = useIsMobile();
  const { height } = useWindowSize();
  const [mobileView, setMobileView] = React.useState<
    "main" | "highlighter" | "link"
  >("main");
  const toolbarRef = React.useRef<HTMLDivElement>(null);

  // Collaboration state
  const [isConnected, setIsConnected] = React.useState(false);
  const [activeUsers, setActiveUsers] = React.useState<any[]>([]);

  // Debounce timer for content changes in collaboration mode
  const contentChangeTimerRef = React.useRef<
    ReturnType<typeof setTimeout> | undefined
  >(undefined);

  // Store onContentChange in a ref to avoid recreating editor on every render
  const onContentChangeRef = React.useRef(onContentChange);
  React.useEffect(() => {
    onContentChangeRef.current = onContentChange;
  }, [onContentChange]);

  // Extract stable values from config to prevent infinite loops
  const documentId = collaborationConfig?.documentId;
  const websocketUrl = collaborationConfig?.websocketUrl;
  const authToken = collaborationConfig?.authToken;
  const userName = collaborationConfig?.user?.name;
  const userColor = collaborationConfig?.user?.color;
  const isCollaborationEnabled = !!collaborationConfig;

  // Debug logging
  React.useEffect(() => {
    console.log("🔍 [SimpleEditor] Extracted values:", {
      documentId,
      websocketUrl,
      hasAuthToken: !!authToken,
      userName,
      userColor,
    });
  }, [documentId, websocketUrl, authToken, userName, userColor]);

  // Use refs for callbacks to avoid infinite re-renders
  const onConnectionStatusChangeRef = React.useRef(
    collaborationConfig?.onConnectionStatusChange
  );
  const onActiveUsersChangeRef = React.useRef(
    collaborationConfig?.onActiveUsersChange
  );

  // Update refs when callbacks change
  React.useEffect(() => {
    onConnectionStatusChangeRef.current =
      collaborationConfig?.onConnectionStatusChange;
    onActiveUsersChangeRef.current = collaborationConfig?.onActiveUsersChange;
  }, [
    collaborationConfig?.onConnectionStatusChange,
    collaborationConfig?.onActiveUsersChange,
  ]);

  // Initialize Yjs and WebSocket provider BEFORE editor creation
  // This is critical - we need these objects to exist when useEditor runs
  const { ydoc, provider } = React.useMemo(() => {
    // Validate all required values are present
    if (!collaborationConfig) {
      console.log("⚠️ [SimpleEditor] No collaboration config");
      return { ydoc: null, provider: null };
    }

    if (!documentId) {
      console.error("❌ [SimpleEditor] Missing documentId!");
      return { ydoc: null, provider: null };
    }

    if (!websocketUrl) {
      console.error("❌ [SimpleEditor] Missing websocketUrl!");
      return { ydoc: null, provider: null };
    }

    if (!authToken) {
      console.error("❌ [SimpleEditor] Missing authToken!");
      return { ydoc: null, provider: null };
    }

    const roomName = `doc-${documentId}`;
    console.log("🔌 [SimpleEditor] Setting up WebSocket connection:", {
      documentId,
      roomName,
      websocketUrl,
      userName,
    });

    // Create Yjs document
    const ydoc = new Y.Doc();

    // If there's initial content and the Yjs document is empty, populate it
    // This ensures existing database content is loaded into the collaborative document
    if (initialContent) {
      console.log(
        "📝 [SimpleEditor] Populating Yjs document with initial content"
      );
      const yXmlFragment = ydoc.getXmlFragment("default");
      // Only populate if the fragment is empty (new document)
      if (yXmlFragment.length === 0) {
        // We'll let the editor handle this after it's created
        // Store initial content in a temporary variable
        (ydoc as any)._initialContent = initialContent;
      }
    }

    // Create WebSocket provider with authentication
    const provider = new WebsocketProvider(websocketUrl, roomName, ydoc, {
      // Pass authentication token as URL parameter
      params: { token: authToken },
      // Don't connect immediately - connect after editor is set up
      connect: false,
    });

    // IMPORTANT: CollaborationCursor expects provider.doc to exist
    // y-websocket doesn't expose it by default, so we add it manually
    (provider as any).doc = ydoc;

    // Set local user awareness immediately (before editor is created)
    if (collaborationConfig?.user) {
      console.log(
        "👤 [SimpleEditor] Setting initial user awareness:",
        collaborationConfig.user
      );
      provider.awareness.setLocalStateField("user", {
        name: collaborationConfig.user.name,
        color: collaborationConfig.user.color,
        avatar: collaborationConfig.user.avatar,
      });
    }

    console.log(
      "✅ [SimpleEditor] WebSocket provider created, ready to connect"
    );

    return { ydoc, provider };
  }, [documentId, websocketUrl, authToken, userName, userColor]);
  // Note: initialContent and collaborationConfig?.user object are intentionally NOT in dependencies
  // They should only be used on initial mount, not on every document update

  // Setup event listeners for provider
  React.useEffect(() => {
    if (!provider) return;

    console.log("🔌 [SimpleEditor] Setting up provider event listeners");

    // Handle connection status
    const handleStatus = (event: { status: string }) => {
      console.log(`📡 [SimpleEditor] WebSocket Status: ${event.status}`);
      const connected = event.status === "connected";
      setIsConnected(connected);
      // Notify parent component via ref
      onConnectionStatusChangeRef.current?.(connected);
    };

    const handleSync = (isSynced: boolean) => {
      console.log(`🔄 [SimpleEditor] Document Synced: ${isSynced}`);
    };

    const handleConnectionError = (error: any) => {
      console.error("❌ [SimpleEditor] Connection error:", error);
    };

    // Handle awareness changes (active users)
    const handleAwarenessChange = () => {
      if (!provider.awareness) return;

      const states = Array.from(provider.awareness.getStates().entries());
      const users = states
        .map(([clientId, state]: [number, any]) => {
          if (!state.user) return null;
          return {
            clientId,
            ...state.user,
          };
        })
        .filter(Boolean);

      console.log(`👥 [SimpleEditor] Active users updated:`, users.length);
      setActiveUsers(users);

      // Notify parent component via ref
      onActiveUsersChangeRef.current?.(users);
    };

    provider.on("status", handleStatus);
    provider.on("sync", handleSync);
    provider.on("connection-error", handleConnectionError);
    provider.awareness.on("change", handleAwarenessChange);

    // Initial awareness update
    handleAwarenessChange();

    // Connect the provider NOW (after editor is set up)
    console.log("🔗 [SimpleEditor] Connecting WebSocket provider...");
    provider.connect();

    // Cleanup on unmount
    return () => {
      console.log("🧹 [SimpleEditor] Cleaning up provider listeners");
      provider.off("status", handleStatus);
      provider.off("sync", handleSync);
      provider.off("connection-error", handleConnectionError);
      provider.awareness.off("change", handleAwarenessChange);
      provider.disconnect();
      provider.destroy();
      ydoc?.destroy();
    };
  }, [provider, ydoc, collaborationConfig]);

  const editor = useEditor(
    {
      immediatelyRender: false,
      shouldRerenderOnTransaction: false,
      editorProps: {
        attributes: {
          autocomplete: "off",
          autocorrect: "off",
          autocapitalize: "off",
          "aria-label": "Main content area, start typing to enter text.",
          class: "simple-editor",
        },
      },
      extensions: [
        StarterKit.configure({
          horizontalRule: false,
        }),
        HorizontalRule,
        TextAlign.configure({ types: ["heading", "paragraph"] }),
        TaskList,
        TaskItem.configure({ nested: true }),
        Highlight.configure({ multicolor: true }),
        Image,
        Typography,
        Superscript,
        Subscript,
        Selection,
        ImageUploadNode.configure({
          accept: "image/*",
          maxSize: MAX_FILE_SIZE,
          limit: 3,
          upload: handleImageUpload,
          onError: (error) => console.error("Upload failed:", error),
        }),
        // Add collaboration extensions if ydoc and provider exist
        ...(ydoc && provider
          ? [
              Collaboration.configure({
                document: ydoc,
              }),
              // TODO: Re-enable CollaborationCursor once basic sync is working
              // For now, we track users via awareness but don't show cursors
              // CollaborationCursor.configure({
              //   provider: provider,
              //   user: collaborationConfig?.user || {
              //     name: "Anonymous",
              //     color: "#000000",
              //   },
              // }),
            ]
          : []),
      ],
      // CRITICAL: Don't set initial content when using collaboration
      // Yjs will load the content from the shared document
      content: ydoc ? undefined : initialContent || "",
      onUpdate: ({ editor }) => {
        const callback = onContentChangeRef.current;
        console.log("📝 [SimpleEditor] onUpdate triggered", {
          hasCallback: !!callback,
          isCollaborationEnabled,
        });
        if (callback) {
          if (isCollaborationEnabled) {
            // In collaboration mode:
            // - Content changes are synced in real-time via Yjs
            // - Debounce onContentChange to update parent state
            // - DB saves only happen when users leave (handled by DocumentEditor)
            if (contentChangeTimerRef.current) {
              clearTimeout(contentChangeTimerRef.current);
            }
            contentChangeTimerRef.current = setTimeout(() => {
              console.log(
                "💾 [SimpleEditor] Calling onContentChange (debounced)"
              );
              callback(editor.getHTML());
            }, 2000); // 2 second debounce
          } else {
            // In non-collaboration mode, update immediately
            console.log(
              "💾 [SimpleEditor] Calling onContentChange (immediate)"
            );
            callback(editor.getHTML());
          }
        }
      },
    },
    [ydoc, provider, userName, userColor, isCollaborationEnabled]
  );

  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  });

  // Populate editor with initial content AFTER first sync, if Yjs document is empty
  React.useEffect(() => {
    if (!provider || !editor || !ydoc) return;

    const handleFirstSync = (isSynced: boolean) => {
      if (!isSynced) return;

      // Check if there's stored initial content and the Yjs document is empty
      const storedContent = (ydoc as any)._initialContent;
      if (storedContent) {
        const yXmlFragment = ydoc.getXmlFragment("default");
        console.log("📝 [SimpleEditor] Checking Yjs document:", {
          fragmentLength: yXmlFragment.length,
          contentLength: storedContent.length,
        });
        if (yXmlFragment.length === 0) {
          console.log(
            "📝 [SimpleEditor] Yjs document is empty after sync, populating with database content"
          );
          editor.commands.setContent(storedContent);
          console.log("✅ [SimpleEditor] Initial content set successfully");
        } else {
          console.log(
            "📝 [SimpleEditor] Yjs document has content from server, skipping initial content"
          );
        }
        // Clear the temporary storage either way
        delete (ydoc as any)._initialContent;
      } else {
        console.log("📝 [SimpleEditor] No initial content to populate");
      }

      // Remove listener after first sync
      provider.off("sync", handleFirstSync);
    };

    provider.on("sync", handleFirstSync);

    return () => {
      provider.off("sync", handleFirstSync);
    };
  }, [editor, ydoc, provider]);

  React.useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main");
    }
  }, [isMobile, mobileView]);

  // Cleanup debounce timer on unmount
  React.useEffect(() => {
    return () => {
      if (contentChangeTimerRef.current) {
        clearTimeout(contentChangeTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="simple-editor-wrapper">
      <EditorContext.Provider value={{ editor }}>
        <Toolbar
          ref={toolbarRef}
          style={{
            ...(isMobile
              ? {
                  bottom: `calc(100% - ${height - rect.y}px)`,
                }
              : {}),
          }}
        >
          {mobileView === "main" ? (
            <MainToolbarContent
              onHighlighterClick={() => setMobileView("highlighter")}
              onLinkClick={() => setMobileView("link")}
              isMobile={isMobile}
            />
          ) : (
            <MobileToolbarContent
              type={mobileView === "highlighter" ? "highlighter" : "link"}
              onBack={() => setMobileView("main")}
            />
          )}
        </Toolbar>

        <EditorContent
          editor={editor}
          role="presentation"
          className="simple-editor-content"
        />
      </EditorContext.Provider>
    </div>
  );
}
