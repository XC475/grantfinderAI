# Real-Time Cursor Tracking - Testing Guide

## 🎯 What We've Implemented

We've created a **custom cursor tracking system** that works with `y-websocket` provider, displaying:

- ✅ Real-time cursor positions
- ✅ User name labels next to cursors
- ✅ Color-coded cursors per user
- ✅ Text selection highlighting
- ✅ Automatic cursor updates on typing/navigation

## 🔧 Technical Implementation

### Custom Extension Created

**File**: `webapp/src/components/tiptap-node/collaboration-cursor-node/custom-collaboration-cursor.ts`

This custom Tiptap extension:

- Uses the Yjs awareness API directly (avoiding the `provider.doc` compatibility issue)
- Creates ProseMirror decorations for cursors and selections
- Updates decorations whenever users move their cursor
- Syncs cursor positions in real-time via WebSocket

### Key Features

1. **Cursor Widget**: Shows a vertical line with user's name label
2. **Selection Highlight**: Shows selected text with semi-transparent user color
3. **Auto-update**: Cursor position updates on every selection change
4. **Cleanup**: Properly removes cursors when users disconnect

---

## 🧪 How to Test

### Prerequisites

Both servers must be running:

```bash
# Terminal 1 - WebSocket Server
cd websocket_server
npm start

# Terminal 2 - Next.js App
cd webapp
npm run dev
```

### Test 1: Open Document and Check Logs

1. **Open a document** in your browser
2. **Open DevTools Console** (F12)
3. **Look for these logs:**
   ```
   🔍 [SimpleEditor] Provider.doc set: {...}
   👤 [SimpleEditor] Setting initial user awareness: {...}
   🖱️ [Cursor] Updated position: { anchor: 0, head: 0 }
   ```

✅ **Expected**: You should see cursor position logging when you click in the editor

### Test 2: Two Users - Same Document

1. **User 1 (Chrome)**:

   - Open document
   - Click somewhere in the text
   - Check console for: `🖱️ [Cursor] Updated position`

2. **User 2 (Firefox/Incognito)**:

   - Log in (same organization)
   - Open the **same document**
   - Check console logs:
     ```
     🎨 [Cursor] Creating decorations: { totalStates: 2, currentClientId: X }
     ✅ [Cursor] Creating cursor for: { clientId: Y, user: "User 1", position: {...} }
     ➕ [Cursor] Added cursor decoration
     🎨 [Cursor] Total decorations created: 1
     ```

3. **User 1**: Move cursor around
   - **User 2 should see logs**: `👥 [Cursor] Awareness changed, updating decorations`

✅ **Expected**:

- User 2 sees User 1's cursor position in console
- User 2 sees User 1's cursor widget in the editor (colored vertical line with name)

### Test 3: Text Selection

1. **User 1**: Select some text (click and drag)
2. **User 2**: Should see:
   - Cursor decoration at the end of selection
   - Selection decoration (highlighted text with User 1's color)
   - Console log: `➕ [Cursor] Added selection decoration`

✅ **Expected**: Selected text appears highlighted with User 1's color

### Test 4: Typing and Cursor Movement

1. **User 1**: Type some text
2. **User 2**: Should see:
   - User 1's cursor moving as they type
   - Real-time decoration updates
   - Console logs showing position changes

✅ **Expected**: Cursor follows typing in real-time

---

## 🐛 Debug Checklist

If cursors aren't showing, check these logs:

### 1. Is Awareness Set Up?

```javascript
🔍 [SimpleEditor] Provider.doc set: { hasDoc: true, hasAwareness: true }
👤 [SimpleEditor] Setting initial user awareness: {...}
```

✅ Both should be `true`

### 2. Is Cursor Position Being Tracked?

```javascript
🖱️ [Cursor] Updated position: { anchor: N, head: N }
```

✅ Should log when you click in the editor

### 3. Are Decorations Being Created?

```javascript
🎨 [Cursor] Creating decorations: { totalStates: 2, ... }
✅ [Cursor] Creating cursor for: {...}
➕ [Cursor] Added cursor decoration
🎨 [Cursor] Total decorations created: 1
```

✅ Should log when another user is present

### 4. Are Awareness Changes Detected?

```javascript
👥 [Cursor] Awareness changed, updating decorations
```

✅ Should log when other users move their cursor

---

## 🎨 Cursor Styling

Cursors are styled with CSS in:
`webapp/src/components/tiptap-templates/simple/simple-editor.scss`

```css
/* Cursor caret (vertical line) */
.collaboration-cursor__caret {
  border-left: 2px solid;
  border-color: inherit;
}

/* User name label */
.collaboration-cursor__label {
  background-color: inherit;
  color: #fff;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 3px 3px 3px 0;
}

/* Selection highlight */
.collaboration-cursor__selection {
  background-color: inherit;
  opacity: 0.3;
}
```

---

## 📊 Expected Console Output

### When You Open Document (Solo)

```
🔍 [SimpleEditor] Provider.doc set: { hasDoc: true, hasAwareness: true }
👤 [SimpleEditor] Setting initial user awareness: {...}
🖱️ [Cursor] Updated position: { anchor: 0, head: 0 }
🎨 [Cursor] Creating decorations: { totalStates: 1, currentClientId: 123 }
🎨 [Cursor] Total decorations created: 0  // No other users yet
```

### When Second User Joins

```
// User 2's console:
🎨 [Cursor] Creating decorations: { totalStates: 2, currentClientId: 456 }
✅ [Cursor] Creating cursor for: { clientId: 123, user: "User 1", position: {...} }
➕ [Cursor] Added cursor decoration
🎨 [Cursor] Total decorations created: 1
```

### When User 1 Moves Cursor

```
// User 1's console:
🖱️ [Cursor] Updated position: { anchor: 5, head: 5 }

// User 2's console:
👥 [Cursor] Awareness changed, updating decorations
🎨 [Cursor] Creating decorations: { totalStates: 2, ... }
✅ [Cursor] Creating cursor for: { clientId: 123, user: "User 1", position: { anchor: 5, head: 5 } }
```

---

## ⚠️ Troubleshooting

### Issue: No cursor logs at all

**Solution**: Check that `CustomCollaborationCursor` is properly imported and configured in the editor

### Issue: Decorations created: 0

**Solution**:

- Other user might not have cursor data in awareness yet
- Make sure other user clicks in the editor to set their cursor position

### Issue: Cursor logs but no visual cursor

**Solution**:

- Check CSS is loaded: inspect element and look for `.collaboration-cursor__caret`
- Verify decorations are being returned by checking DevTools Elements tab

### Issue: Cursor appears but doesn't move

**Solution**:

- Check if `update` function is being called in the plugin view
- Verify `🖱️ [Cursor] Updated position` logs appear when moving cursor

---

## ✅ Success Criteria

- [ ] Console shows cursor position updates when clicking in editor
- [ ] Console shows decorations being created when 2+ users present
- [ ] Visual cursor (colored vertical line) appears in editor
- [ ] User name label appears above cursor
- [ ] Cursor moves in real-time as user types
- [ ] Selected text is highlighted with user's color
- [ ] Cursors disappear when users disconnect

---

## 🎯 Next Steps After Testing

Once basic cursor tracking works:

1. Remove debug console.logs for production
2. Add cursor animation (smooth transitions)
3. Add cursor timeout (hide inactive cursors after 30s)
4. Optimize decoration updates (debounce)
5. Add cursor click-to-follow feature

---

## 📝 Notes

- History conflict warning is now fixed (disabled in StarterKit when collaborating)
- Custom extension works around the `provider.doc` compatibility issue
- All cursor data flows through Yjs awareness protocol
- Decorations are ProseMirror's way of overlaying UI elements on the editor
