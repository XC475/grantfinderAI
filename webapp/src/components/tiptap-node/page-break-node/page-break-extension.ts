import { Node, mergeAttributes } from "@tiptap/core"

export interface PageBreakOptions {
  HTMLAttributes: Record<string, unknown>
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    pageBreak: {
      /**
       * Insert a page break
       */
      setPageBreak: () => ReturnType
    }
  }
}

export const PageBreak = Node.create<PageBreakOptions>({
  name: "pageBreak",

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  group: "block",

  atom: true,

  parseHTML() {
    return [
      {
        tag: 'div[data-type="page-break"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "page-break",
      }),
    ]
  },

  addCommands() {
    return {
      setPageBreak:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
          })
        },
    }
  },
})

export default PageBreak

