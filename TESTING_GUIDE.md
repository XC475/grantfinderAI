# Writer Assistant Chat Testing Guide

## Quick Testing Steps

### 1. Basic Persistence Test (5 min)

**Navigate to a document editor:**

1. Go to `/private/{org}/applications/{appId}` and open a document
2. Open the editor assistant sidebar (should have "History" and "New Chat" buttons in header)
3. Send a message: "Hello, can you help me with this document?"
4. Wait for response
5. **Refresh the page** 🔄
6. Open the sidebar again
7. ✅ **Expected:** Your conversation should still be there (messages persisted)

### 2. Multiple Sessions Test (3 min)

**In the same document:**

1. Click "New Chat" button
2. ✅ **Expected:** Messages clear, starting fresh
3. Send a message: "This is session 2"
4. Click "History" button
5. ✅ **Expected:** You should see 2 sessions listed with dates and message counts
6. Click on the first session
7. ✅ **Expected:** First conversation loads back

### 3. Separation Test (2 min)

**Check main chat list:**

1. Navigate to `/private/{org}/chat`
2. Look at the chat list in the sidebar
3. ✅ **Expected:** Editor assistant chats should NOT appear here
4. Only GENERAL, APPLICATION, GRANT_ANALYSIS, etc. chats should show

### 4. Different Documents Test (2 min)

**Open a different document:**

1. Go to a different document in the same or different application
2. Open editor assistant
3. ✅ **Expected:** Should be empty (no messages from the first document)
4. Send a message
5. Click "History"
6. ✅ **Expected:** Only shows chats for THIS document

### 5. Standalone Document Test (3 min)

**Test without application link:**

1. Create a standalone document (not linked to application) via `/api/documents`
2. Open it in editor
3. Open assistant and send message
4. ✅ **Expected:** Should work exactly the same (saves with null applicationId)

---

## Browser Console Checks

Open browser DevTools console and look for these logs:

✅ **On creating new chat:**

```
💬 [DocumentChat] New chat created with ID: <chat-id>
📝 [Editor Chat] Saving assistant response to database
✅ [Editor Chat] Saved response to DB
```

✅ **On loading chat session:**

```
💬 [DocumentChat] Loaded chat session: <chat-id>
```

✅ **On starting new chat:**

```
💬 [DocumentChat] Starting new chat session
```

---

## Database Verification

**Check data in database:**

```sql
-- See all editor chats
SELECT id, title, context, metadata->>'chatType' as chat_type,
       metadata->>'documentId' as document_id, created_at
FROM app.ai_chats
WHERE context = 'DRAFTING'
  AND metadata->>'chatType' = 'editor_assistant'
ORDER BY created_at DESC;

-- Count messages per chat
SELECT c.id, c.title, COUNT(m.id) as message_count
FROM app.ai_chats c
LEFT JOIN app.ai_chat_messages m ON m.chat_id = c.id
WHERE c.context = 'DRAFTING'
  AND c.metadata->>'chatType' = 'editor_assistant'
GROUP BY c.id, c.title;

-- Verify normal chats are separate
SELECT id, title, context, metadata
FROM app.ai_chats
WHERE context != 'DRAFTING'
   OR metadata->>'chatType' IS NULL
   OR metadata->>'chatType' != 'editor_assistant'
ORDER BY updated_at DESC
LIMIT 10;
```

---

## API Endpoint Testing

**Using curl or Postman:**

```bash
# 1. List editor chat sessions for a document
curl -X GET \
  "http://localhost:3000/api/chats/editor?documentId=<document-id>" \
  -H "Cookie: <your-auth-cookie>"

# 2. Get specific chat session with messages
curl -X GET \
  "http://localhost:3000/api/chats/editor/<chat-id>" \
  -H "Cookie: <your-auth-cookie>"

# 3. Verify main chat list excludes editor chats
curl -X GET \
  "http://localhost:3000/api/chats" \
  -H "Cookie: <your-auth-cookie>"
```

---

## Common Issues & Solutions

### Issue: "History" button shows no sessions

**Solution:**

- Check browser console for errors
- Verify API is returning data: `/api/chats/editor?documentId=<id>`
- Check database for records

### Issue: Messages not persisting after refresh

**Solution:**

- Check Network tab: POST to `/api/chat/editor` should return `X-Chat-Id` header
- Check console for "New chat created with ID" log
- Check database for new records in `ai_chats` table

### Issue: Editor chats appearing in main chat list

**Solution:**

- Verify metadata has `chatType: 'editor_assistant'`
- Check `/api/chats` query logic in `route.ts`
- Clear browser cache and retry

### Issue: Can't load previous sessions

**Solution:**

- Check console for errors when clicking History dropdown
- Verify GET `/api/chats/editor/{chatId}` returns messages
- Check user owns the chat (userId matches)

---

## Performance Checks

### Response Times

- Chat message response: Should stream immediately
- Loading chat history: < 500ms
- Loading previous session: < 1s

### Database Queries

- Should see efficient queries (no N+1)
- Check Prisma query logs if slow

---

## Edge Cases to Test

1. **Client disconnects mid-stream:**

   - Send message, immediately close tab
   - Re-open and check if message was still saved

2. **Very long conversation:**

   - Send 20+ messages in one session
   - Check loading time when reopening

3. **Concurrent sessions:**

   - Open same document in two tabs
   - Send messages from both
   - Verify both sessions are separate

4. **Special characters in messages:**
   - Send messages with emojis, code blocks, markdown
   - Verify they save/load correctly

---

## Success Criteria

✅ All basic tests pass
✅ No console errors
✅ Database has correct records
✅ API endpoints return expected data
✅ UI is responsive and intuitive
✅ Backward compatibility maintained (existing chats unaffected)

---

## Next Steps After Testing

1. Monitor production logs for errors
2. Gather user feedback on UX
3. Consider adding:
   - Delete session functionality
   - Rename session titles
   - Search within chat history
   - Export chat sessions
