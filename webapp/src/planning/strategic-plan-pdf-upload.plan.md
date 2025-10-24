<!-- 7335c9bf-3f36-4d34-ac67-13d07fe59216 82c510cc-b52e-4289-849c-7ba7352e8591 -->
# Strategic Plan PDF Upload Feature

## Overview

Implement PDF upload functionality on the organization profile page that:

1. Accepts PDF file uploads
2. Converts PDF to text
3. Sends text to OpenAI API to extract funding-related content
4. Populates the strategicPlan textbox with extracted content

## Implementation Steps

### 1. Create API Endpoint for PDF Processing

**File**: `webapp/src/app/api/organizations/strategic-plan/upload/route.ts` (new file)

Create POST endpoint that:

- Accepts PDF file via FormData
- Uses `pdf-parse` library to extract text from PDF
- Calls OpenAI API with prompt to extract only funding-related content
- Returns extracted text
```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import OpenAI from "openai";
// Use pdf-parse for PDF text extraction

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  // 1. Authenticate user
  // 2. Get PDF from FormData
  // 3. Extract text using pdf-parse
  // 4. Send to OpenAI with prompt:
  //    "Extract only the content related to funding, grants, and financial planning from this strategic plan..."
  // 5. Return extracted text
}
```


### 2. Add PDF Upload UI Component

**File**: `webapp/src/app/private/[slug]/profile/page.tsx`

Update the strategic plan section (around line 329-364):

Add below the Textarea (after line 363):

```tsx
<div className="flex gap-2">
  <input
    ref={pdfInputRef}
    type="file"
    accept="application/pdf"
    onChange={handlePdfUpload}
    className="hidden"
  />
  <Button
    type="button"
    variant="outline"
    size="sm"
    onClick={() => pdfInputRef.current?.click()}
    disabled={uploadingPdf}
  >
    {uploadingPdf ? (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Processing PDF...
      </>
    ) : (
      <>
        <Upload className="mr-2 h-4 w-4" />
        Upload Strategic Plan PDF
      </>
    )}
  </Button>
  <p className="text-xs text-muted-foreground">
    PDF up to 10MB, max 50 pages
  </p>
</div>
```

### 3. Add PDF Upload Handler

**File**: `webapp/src/app/private/[slug]/profile/page.tsx`

Add state and handler function:

```typescript
const [uploadingPdf, setUploadingPdf] = useState(false);
const pdfInputRef = useRef<HTMLInputElement>(null);

const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file || !organization) return;

  // Validate file type
  if (file.type !== 'application/pdf') {
    toast.error('Please upload a PDF file');
    return;
  }

  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    toast.error('File size must be less than 10MB');
    return;
  }

  setUploadingPdf(true);
  try {
    const formData = new FormData();
    formData.append('pdf', file);

    const response = await fetch('/api/organizations/strategic-plan/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Failed to process PDF');

    const data = await response.json();
    
    // Populate the strategicPlan textbox
    setOrganization({
      ...organization,
      strategicPlan: data.extractedText
    });
    
    toast.success('Strategic plan extracted successfully');
  } catch (error) {
    console.error('Error processing PDF:', error);
    toast.error('Failed to process PDF');
  } finally {
    setUploadingPdf(false);
    // Reset file input
    if (pdfInputRef.current) {
      pdfInputRef.current.value = '';
    }
  }
};
```

### 4. Install Required Dependencies

**File**: `webapp/package.json`

Add to dependencies:

```bash
npm install pdf-parse
npm install --save-dev @types/pdf-parse
```

### 5. Update OpenAI Prompt

The OpenAI API call in the upload route should use a prompt like:

```typescript
const completion = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{
    role: "system",
    content: "You are an expert at analyzing strategic plans and extracting funding-related content."
  }, {
    role: "user",
    content: `Extract and summarize only the content related to funding, grants, financial planning, and resource allocation from the following strategic plan document. Focus on goals, objectives, and initiatives that would be relevant for grant applications and funding opportunities. Preserve important details but make it concise.\n\nDocument text:\n${pdfText}`
  }],
  temperature: 0.3,
});
```

### 6. Create Planning Documentation

**File**: `webapp/src/planning/strategic-plan-pdf-upload.md`

Document the feature with:

- API endpoint specifications
- PDF processing workflow
- OpenAI prompt engineering
- Error handling strategies
- File size and type constraints

## Key Files to Modify

1. **New**: `webapp/src/app/api/organizations/strategic-plan/upload/route.ts` - PDF processing API
2. **Update**: `webapp/src/app/private/[slug]/profile/page.tsx` - Add upload UI and handler
3. **New**: `webapp/src/planning/strategic-plan-pdf-upload.md` - Feature documentation
4. **Update**: `webapp/package.json` - Add pdf-parse dependency

## Technical Considerations

- PDF text extraction using pdf-parse library
- OpenAI API integration for content filtering
- File validation (type, size, page count)
- Progress indicators during upload/processing
- Error handling for malformed PDFs
- Textbox population after successful extraction

### To-dos

- [ ] Install pdf-parse and type definitions
- [ ] Create API endpoint for PDF upload and processing with OpenAI
- [ ] Add PDF upload button and file input to profile page
- [ ] Implement handlePdfUpload function with validation and API call
- [ ] Create feature documentation in planning folder