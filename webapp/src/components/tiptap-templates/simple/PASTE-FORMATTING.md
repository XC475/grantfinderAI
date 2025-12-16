# Style-Inheriting Paste Feature

This document describes the paste formatting inheritance feature implemented in the GrantWare AI writing editor. When users paste content into the editor, it automatically inherits the document's current formatting (font family, size, color, etc.) rather than preserving the source formatting.

## Overview

The feature ensures a consistent document appearance by applying the current cursor/document formatting to all pasted content, regardless of the source. This is particularly useful when:

- Copying AI-generated responses from the writing assistant
- Pasting content from external websites
- Copying from other applications (Word, Google Docs, etc.)

## How It Works

### Architecture

The feature is implemented as a ProseMirror plugin within the `MarkdownPaste` Tiptap extension in `simple-editor.tsx`. It intercepts all paste events and processes the content before insertion.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Paste Event                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              Extract Text from Clipboard                         │
│  1. Try text/plain first                                        │
│  2. If empty, extract from text/html (strip HTML tags)          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│           Capture Current Cursor Formatting                      │
│  • Active marks (bold, italic, underline, strike)               │
│  • TextStyle attrs (fontFamily, fontSize, color, backgroundColor)│
│  • Block attrs (textAlign)                                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              Parse Text as Markdown                              │
│  Preserves structure: headings, lists, bold/italic from markdown │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│           Apply Document Formatting to Nodes                     │
│  • Merge textStyle attrs into all text nodes                    │
│  • Add active marks to text nodes                               │
│  • Apply textAlign to block nodes                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              Insert Styled Content                               │
└─────────────────────────────────────────────────────────────────┘
```

### Key Components

#### 1. Text Extraction (`stripHtmlToText`)

When HTML is present in the clipboard (common when selecting text from web pages), we strip all HTML tags and styling to get clean plain text:

```typescript
function stripHtmlToText(html: string): string {
  const temp = document.createElement("div");
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || "";
}
```

#### 2. Formatting Detection (`captureCursorFormatting`)

Captures the current formatting at the cursor position using multiple strategies:

1. **Direct attributes**: `editor.getAttributes("textStyle")` - works when cursor is inside formatted text
2. **Stored marks**: `state.storedMarks` - marks that will apply to next typed content
3. **Position marks**: `$from.marks()` - marks at the current selection anchor
4. **Document traversal**: `doc.nodesBetween(0, cursorPos)` - scans backwards to find nearest formatted text

This multi-strategy approach ensures formatting is detected even when:
- Cursor is at the end of a paragraph
- Cursor is in a new empty paragraph (after pressing Enter)
- Cursor is at the beginning of the document

#### 3. Formatting Application (`applyFormattingToNodes`)

Recursively walks the parsed JSON tree and applies formatting:

- **Block nodes** (paragraph, heading): Applies `textAlign` if not already set
- **Text nodes**: 
  - Adds cursor marks (bold/italic/underline/strike) if active
  - Merges textStyle attributes (fontFamily, fontSize, color, backgroundColor)
  - Preserves existing marks from markdown (doesn't override)

#### 4. Fallback Handling (`insertPlainTextWithFormatting`)

If markdown parsing fails, falls back to plain text insertion with formatting applied. This ensures:
- No source styling bleeds through
- Document formatting is always applied
- Graceful degradation on errors

## Supported Formatting

| Property | Inherited | Notes |
|----------|-----------|-------|
| Font Family | ✅ | e.g., Times New Roman, Arial |
| Font Size | ✅ | e.g., 12px, 16px |
| Text Color | ✅ | Any CSS color value |
| Background Color | ✅ | Highlight color |
| Bold | ✅ | Inherits if active at cursor |
| Italic | ✅ | Inherits if active at cursor |
| Underline | ✅ | Inherits if active at cursor |
| Strikethrough | ✅ | Inherits if active at cursor |
| Text Alignment | ✅ | left, center, right, justify |

## Paste Scenarios

### 1. Copy Button (AI Assistant)

The copy button in the AI chat uses `navigator.clipboard.writeText()` which copies plain text only.

**Flow**: Plain text → Parse as markdown → Apply doc formatting → Insert

### 2. Manual Text Selection (AI Assistant)

When users highlight text in the AI chat response, the browser copies both HTML (with chat styling) and plain text.

**Flow**: Try plain text → If empty, strip HTML → Parse as markdown → Apply doc formatting → Insert

### 3. External Sources (Websites, Word, etc.)

External sources typically provide both HTML and plain text.

**Flow**: Try plain text → If empty, strip HTML → Parse as markdown → Apply doc formatting → Insert

### 4. After Pressing Enter (New Paragraph)

When cursor is in a new empty paragraph, the feature scans backwards through the document to find the nearest formatted text.

**Flow**: Capture formatting (scan backwards) → Parse content → Apply found formatting → Insert

## Edge Cases Handled

1. **Empty clipboard**: Returns early, allows default behavior
2. **No text/plain available**: Falls back to HTML stripping
3. **Markdown parse failure**: Uses plain text fallback with formatting
4. **No formatting found**: Inserts without formatting (clean text)
5. **Cursor at document start**: Searches forward for any formatted text
6. **Multiple paragraphs**: Each paragraph gets block-level formatting

## Code Location

The feature is implemented in:
- **File**: `webapp/src/components/tiptap-templates/simple/simple-editor.tsx`
- **Extension**: `MarkdownPaste`
- **Key Functions**:
  - `captureCursorFormatting()` - Detects current formatting
  - `findNearestTextFormatting()` - Scans document for formatting
  - `applyFormattingToNodes()` - Applies formatting to parsed content
  - `applyFormattingToNode()` - Applies formatting to individual nodes
  - `stripHtmlToText()` - Strips HTML to plain text
  - `insertPlainTextWithFormatting()` - Fallback text insertion

## Testing

To test the feature:

1. **Basic paste test**:
   - Type text and set a font (e.g., Times New Roman, 16px)
   - Copy text from AI response using copy button
   - Paste into editor
   - Verify: Text should be in Times New Roman, 16px

2. **Enter + paste test**:
   - Type formatted text
   - Press Enter to create new paragraph
   - Paste content
   - Verify: Pasted content inherits previous paragraph's formatting

3. **Manual selection test**:
   - Set document formatting
   - Highlight text from AI chat (not using copy button)
   - Paste into editor
   - Verify: No source styling (beige background) should appear

4. **External paste test**:
   - Set document formatting
   - Copy text from external website
   - Paste into editor
   - Verify: Text inherits document formatting, not source styling

5. **Markdown preservation test**:
   - Copy AI response with **bold** or *italic* markdown
   - Paste into editor
   - Verify: Bold/italic structure preserved, font inherits document

## Dependencies

- `@tiptap/core` - Editor framework
- `@tiptap/pm/state` - ProseMirror state (Plugin, PluginKey)
- `@tiptap/pm/model` - ProseMirror model (Fragment, Slice)
- `@tiptap/pm/view` - ProseMirror view (EditorView)
- `@tiptap/markdown` - Markdown parsing

## Performance Considerations

- Document scanning is limited to positions before cursor (not full document)
- `nodesBetween()` is efficient for traversing document trees
- HTML stripping uses native DOM parsing (fast)
- Formatting is captured once per paste, not per node

## Future Improvements

Potential enhancements:

1. **Configurable behavior**: Option to preserve source formatting for specific paste sources
2. **Format painter**: Copy formatting from one selection to apply to paste
3. **Paste special**: Dialog to choose formatting behavior
4. **Indent inheritance**: When indent extension is added, inherit indent level

