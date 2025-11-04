import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import type { Awareness } from "y-protocols/awareness";

export interface CollaborationCursorOptions {
  awareness: Awareness | null;
  user: {
    name: string;
    color: string;
  };
}

interface CursorUser {
  clientId: number;
  user: {
    name: string;
    color: string;
  };
  cursor: {
    anchor: number;
    head: number;
  } | null;
}

export const CustomCollaborationCursor =
  Extension.create<CollaborationCursorOptions>({
    name: "customCollaborationCursor",

    addOptions() {
      return {
        awareness: null,
        user: {
          name: "Anonymous",
          color: "#808080",
        },
      };
    },

    addProseMirrorPlugins() {
      const { awareness, user } = this.options;

      if (!awareness) {
        return [];
      }

      return [
        new Plugin({
          key: new PluginKey("customCollaborationCursor"),
          state: {
            init() {
              return DecorationSet.empty;
            },
            apply(tr, oldState) {
              // Return old state if no awareness
              if (!awareness) {
                return oldState;
              }

              const decorations: Decoration[] = [];
              const awarenessStates = awareness.getStates();

              // Get current client ID
              const currentClientId = awareness.clientID;

              console.log("🎨 [Cursor] Creating decorations:", {
                totalStates: awarenessStates.size,
                currentClientId,
              });

              awarenessStates.forEach((state, clientId) => {
                // Skip current user
                if (clientId === currentClientId) {
                  return;
                }

                // Skip if no cursor data
                if (!state.cursor || !state.user) {
                  console.log(
                    "⚠️ [Cursor] Skipping client (no cursor/user):",
                    clientId
                  );
                  return;
                }

                const { anchor, head } = state.cursor;
                const cursorUser = state.user;

                console.log("✅ [Cursor] Creating cursor for:", {
                  clientId,
                  user: cursorUser.name,
                  position: { anchor, head },
                });

                // Create cursor decoration
                const cursorDecoration = Decoration.widget(
                  head,
                  () => {
                    const cursor = document.createElement("span");
                    cursor.classList.add("collaboration-cursor__caret");
                    cursor.style.borderColor = cursorUser.color;

                    const label = document.createElement("div");
                    label.classList.add("collaboration-cursor__label");
                    label.style.backgroundColor = cursorUser.color;
                    label.textContent = cursorUser.name;
                    cursor.appendChild(label);

                    return cursor;
                  },
                  {
                    key: `cursor-${clientId}`,
                    side: -1,
                  }
                );

                decorations.push(cursorDecoration);
                console.log("➕ [Cursor] Added cursor decoration");

                // Create selection decoration if there's a selection
                if (anchor !== head) {
                  const from = Math.min(anchor, head);
                  const to = Math.max(anchor, head);

                  const selectionDecoration = Decoration.inline(
                    from,
                    to,
                    {
                      class: "collaboration-cursor__selection",
                      style: `background-color: ${cursorUser.color}`,
                    },
                    {
                      key: `selection-${clientId}`,
                    }
                  );

                  decorations.push(selectionDecoration);
                  console.log("➕ [Cursor] Added selection decoration");
                }
              });

              console.log(
                "🎨 [Cursor] Total decorations created:",
                decorations.length
              );

              return DecorationSet.create(tr.doc, decorations);
            },
          },
          props: {
            decorations(state) {
              return this.getState(state);
            },
          },
          view(view) {
            if (!awareness) {
              return {};
            }

            // Update awareness on selection change
            const updateCursorPosition = (editorView: any) => {
              if (!editorView) return;

              const { selection } = editorView.state;
              const { anchor, head } = selection;

              awareness.setLocalStateField("cursor", {
                anchor,
                head,
              });

              console.log("🖱️ [Cursor] Updated position:", { anchor, head });
            };

            // Listen for awareness changes
            const onAwarenessChange = () => {
              // Trigger a state update to re-render decorations
              view.updateState(view.state);
              console.log(
                "👥 [Cursor] Awareness changed, updating decorations"
              );
            };

            awareness.on("change", onAwarenessChange);

            // Set initial cursor position
            updateCursorPosition(view);

            return {
              update: (editorView, prevState) => {
                // Update cursor position when selection changes
                const prevSelection = prevState.selection;
                const currSelection = editorView.state.selection;

                // Only update if selection actually changed
                if (!prevSelection.eq(currSelection)) {
                  updateCursorPosition(editorView);
                }
              },
              destroy: () => {
                awareness.off("change", onAwarenessChange);
                // Clear cursor from awareness when destroying
                awareness.setLocalStateField("cursor", null);
              },
            };
          },
        }),
      ];
    },
  });
