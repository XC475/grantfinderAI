import Heading from "@tiptap/extension-heading";
import { mergeAttributes } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

export const HeadingWithId = Heading.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute("id"),
        renderHTML: (attributes) => {
          if (!attributes.id) {
            return {};
          }
          return {
            id: attributes.id,
          };
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("heading-id-generator"),
        appendTransaction: (transactions, oldState, newState) => {
          // Only run if document changed
          if (!transactions.some((transaction) => transaction.docChanged)) {
            return null;
          }

          const tr = newState.tr;
          let modified = false;

          // Iterate through all descendants to find headings without IDs
          newState.doc.descendants((node, pos) => {
            if (node.type.name === "heading" && !node.attrs.id) {
              // Generate a unique ID
              // Using a simple random string + timestamp to ensure uniqueness
              const id = `h-${Math.random().toString(36).substring(2, 9)}`;
              
              tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                id,
              });
              modified = true;
            }
          });

          if (modified) {
            return tr;
          }

          return null;
        },
      }),
    ];
  },
});

