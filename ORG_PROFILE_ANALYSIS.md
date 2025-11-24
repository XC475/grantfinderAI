# Organization Profile Page - Comprehensive Deep Dive Analysis

## 📋 Executive Summary

The Organization Profile page is a comprehensive settings page that allows organizations to manage their complete profile information. It's organized into 4 main tabs, each handling different aspects of organizational data. The page is fully client-side rendered with real-time state management and integrates with multiple APIs for data persistence and AI-powered features.

---

## 🏗️ Architecture Overview

### **File Structure**
```
webapp/src/app/private/[slug]/settings/profile/
└── page.tsx (1,277 lines) - Main component

webapp/src/components/profile/
└── CustomFieldModal.tsx (146 lines) - Modal for custom field CRUD

webapp/src/app/api/organizations/
├── route.ts - GET organization data
├── [id]/route.ts - PATCH organization updates
└── [id]/custom-fields/
    ├── route.ts - GET/POST custom fields
    └── [fieldId]/route.ts - PATCH/DELETE custom field

webapp/src/app/api/
├── pdf-extract/route.ts - PDF text extraction
└── strategic-plan-summarize/route.ts - AI summarization
```

### **Technology Stack**
- **Framework**: Next.js 15 (App Router) - Client Component (`"use client"`)
- **State Management**: React useState hooks
- **UI Components**: shadcn/ui (Tabs, Input, Textarea, Button, Dialog, etc.)
- **Icons**: Lucide React
- **Image Handling**: Next.js Image component
- **File Upload**: Supabase Storage
- **API Integration**: Fetch API with REST endpoints
- **Form Validation**: Client-side validation
- **Notifications**: Sonner toast library

---

## 📊 Data Model

### **Organization Interface**
```typescript
interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  website: string | null;
  missionStatement: string | null;
  strategicPlan: string | null;
  annualOperatingBudget: string | null;  // Stored as string, converted to Decimal in DB
  fiscalYearEnd: string | null;
  phone: string | null;
  email: string | null;
  organizationLeaderName: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  enrollment: number | null;
  numberOfSchools: number | null;
  lowestGrade: number | null;  // -2 (Pre-K) to 12 (Senior)
  highestGrade: number | null;
  services: string[] | null;  // Array of enum values
  createdAt: string;
  updatedAt: string;
}
```

### **Custom Field Interface**
```typescript
interface CustomField {
  id: string;
  fieldName: string;
  fieldValue: string | null;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## 🎨 UI Structure & Layout

### **Page Layout**
```
┌─────────────────────────────────────────────────┐
│ Header: "Organization Profile"                  │
│ Subtitle: "Manage your organization's..."       │
├─────────────────────────────────────────────────┤
│ Tabs: [Basic Info] [Contact] [Org Info] [Custom Fields] │
├─────────────────────────────────────────────────┤
│                                                 │
│ Tab Content (varies by active tab)             │
│                                                 │
│ ┌─────────────────────────────────────────┐   │
│ │ Section 1: [Icon] Section Title         │   │
│ │ ─────────────────────────────────────   │   │
│ │ Form Fields...                          │   │
│ └─────────────────────────────────────────┘   │
│                                                 │
│ ┌─────────────────────────────────────────┐   │
│ │ Section 2: [Icon] Section Title         │   │
│ │ ─────────────────────────────────────   │   │
│ │ Form Fields...                          │   │
│ └─────────────────────────────────────────┘   │
│                                                 │
│ [Save Changes Button] (bottom right)           │
└─────────────────────────────────────────────────┘
```

### **Visual Design Patterns**
- **Spacing**: `space-y-6` for main container, `space-y-4` for sections, `space-y-8` for tab content
- **Typography**: `text-3xl font-bold` for title, `text-muted-foreground` for subtitles
- **Icons**: 5px icons (`h-5 w-5`) for section headers, 4px icons (`h-4 w-4`) for buttons
- **Borders**: `border-b` for section dividers, `border-2 border-dashed` for empty states
- **Colors**: Uses theme-aware colors (`text-muted-foreground`, `border-border`)

---

## 📑 Tab-by-Tab Breakdown

### **Tab 1: Basic Info**

#### **Sections:**
1. **Basic Information** (Building2 icon)
   - Organization Logo
     - Preview: 96x96px rounded square with border
     - Upload button with loading state
     - File validation: image/*, max 5MB
     - Storage: Supabase `grantware/organization-logos/`
   - Organization Name (text input)
   - Website (URL input with placeholder)
   - Mission Statement (textarea, 4 rows)
   - Organization Type (checkboxes)
     - Options: K-12 Education, Higher Education, Non-Profit, Government Agencies, Other
     - Tooltip explaining purpose
     - Multi-select (array of strings)

#### **Features:**
- Logo upload with automatic old logo deletion
- Real-time form state updates
- Save button at bottom

---

### **Tab 2: Contact**

#### **Sections:**
1. **Contact Information** (Mail icon)
   - Organization Leader Name (text input)
   - Contact Email (email input, 2-column grid on md+)
   - Phone Number (tel input, 2-column grid on md+)

2. **Primary Office Address** (MapPin icon)
   - Street Address (text input)
   - City, State, ZIP Code (3-column grid on md+)
   - State limited to 2 characters (`maxLength={2}`)

#### **Features:**
- Responsive grid layout (1 column mobile, multi-column desktop)
- Save button at bottom

---

### **Tab 3: Org Info**

#### **Sections:**
1. **Budget Information** (Building2 icon)
   - Annual Operating Budget (number input)
   - Fiscal Year End (text input, placeholder: "June 30 or 06/30")
   - 2-column grid layout

2. **Strategic Plan** (Building2 icon)
   - Strategic Plan (textarea, 6 rows)
   - Info tooltip with examples
   - Upload PDF button
     - Extracts text using `unpdf` library
     - Max 10MB file size
     - Updates textarea with extracted content
   - Summarize with AI button
     - Uses OpenAI GPT-4o-mini
     - Requires minimum 100 characters
     - Extracts grant-relevant information
     - Updates textarea with summary
   - Helper text explaining features

3. **School Information** (GraduationCap icon)
   - Total Enrollment (number input)
     - Helper text: "Total number of students enrolled"
   - Number of Schools (number input)
     - Helper text: "Total number of schools in your district"
   - Lowest Grade (Select dropdown)
     - Options: Pre-K (-2) through 12th Grade (12)
     - Helper text: "Lowest grade level your organization serves"
   - Highest Grade (Select dropdown)
     - Same options as Lowest Grade
     - Helper text: "Highest grade level your organization serves"

#### **Features:**
- AI-powered PDF extraction
- AI-powered strategic plan summarization
- Grade level dropdowns with comprehensive options
- Save button at bottom

---

### **Tab 4: Custom Fields**

#### **Layout:**
- Header with title, description, and "Add Custom Field" button
- Empty state (dashed border box) when no fields exist
- List view with cards when fields exist

#### **Field Card Structure:**
```
┌─────────────────────────────────────────┐
│ Field Name (font-semibold)              │
│ Field Value (truncated to 200 chars)    │
│ [Edit] [Delete] buttons (right side)    │
└─────────────────────────────────────────┘
```

#### **Features:**
- Create/Edit/Delete custom fields
- Modal-based editing (CustomFieldModal component)
- Field value truncation with "Show more" link
- Empty state with call-to-action
- Loading state during fetch

#### **Custom Field Modal:**
- Dialog component (600px max width)
- Field Name input (required)
- Field Value textarea (8 rows, optional)
- Save/Cancel buttons
- Error handling and validation

---

## 🔄 State Management

### **Component State**
```typescript
const [organization, setOrganization] = useState<Organization | null>(null);
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [uploading, setUploading] = useState(false);
const [uploadingPdf, setUploadingPdf] = useState(false);
const [summarizing, setSummarizing] = useState(false);
const [customFields, setCustomFields] = useState<CustomField[]>([]);
const [loadingCustomFields, setLoadingCustomFields] = useState(false);
const [modalOpen, setModalOpen] = useState(false);
const [selectedField, setSelectedField] = useState<CustomField | null>(null);
```

### **State Flow**
1. **Initial Load**: `fetchOrganization()` → Sets `organization` state
2. **Form Updates**: Direct state mutations via `setOrganization({ ...organization, field: value })`
3. **Save**: `handleSave()` → PATCH API → Updates state on success
4. **Custom Fields**: Separate state, fetched after organization loads

---

## 🔌 API Integration

### **Endpoints Used**

#### **1. GET /api/organizations**
- **Purpose**: Fetch current user's organization
- **Auth**: Supabase session required
- **Response**: Full organization object
- **Called**: On component mount

#### **2. PATCH /api/organizations/[id]**
- **Purpose**: Update organization fields
- **Auth**: Requires ADMIN or OWNER role
- **Body**: Partial organization object
- **Called**: On "Save Changes" button click
- **Validation**: Server-side role check

#### **3. GET /api/organizations/[id]/custom-fields**
- **Purpose**: Fetch all custom fields
- **Auth**: User must be member of organization
- **Response**: Array of custom fields
- **Called**: After organization loads

#### **4. POST /api/organizations/[id]/custom-fields**
- **Purpose**: Create new custom field
- **Body**: `{ fieldName: string, fieldValue: string }`
- **Validation**: Field name required

#### **5. PATCH /api/organizations/[id]/custom-fields/[fieldId]**
- **Purpose**: Update existing custom field
- **Body**: `{ fieldName?: string, fieldValue?: string }`

#### **6. DELETE /api/organizations/[id]/custom-fields/[fieldId]**
- **Purpose**: Delete custom field
- **Confirmation**: Client-side `window.confirm()` dialog

#### **7. POST /api/pdf-extract**
- **Purpose**: Extract text from PDF
- **Body**: FormData with file
- **Response**: `{ text: string, pageCount: number }`
- **Library**: `unpdf` (serverless-friendly)

#### **8. POST /api/strategic-plan-summarize**
- **Purpose**: AI-powered strategic plan summarization
- **Body**: `{ strategicPlanText: string }`
- **Model**: OpenAI GPT-4o-mini
- **Response**: `{ summary: string, tokensUsed: number }`

---

## 🎯 Key Features & Functionality

### **1. Logo Upload**
- **Storage**: Supabase Storage bucket `grantware`
- **Path**: `organization-logos/{orgId}-{timestamp}.{ext}`
- **Process**:
  1. Validate file type and size
  2. Delete old logo if exists
  3. Upload new file
  4. Get public URL
  5. Update organization record
  6. Update local state
- **Error Handling**: Toast notifications for failures

### **2. PDF Text Extraction**
- **Library**: `unpdf` (no canvas dependencies)
- **Process**:
  1. Validate PDF file (type, size)
  2. Convert to Uint8Array
  3. Extract text and page count
  4. Clean text (normalize whitespace)
  5. Update strategic plan field
  6. Save to database
- **Limitations**: 10MB max file size

### **3. AI Strategic Plan Summarization**
- **Model**: GPT-4o-mini
- **System Prompt**: Expert grant writer persona
- **Focus**: Extract grant-relevant information
- **Output**: 500-1000 word summary
- **Requirements**: Minimum 100 characters input
- **Process**:
  1. Validate text length
  2. Call OpenAI API
  3. Extract summary from response
  4. Update strategic plan field
  5. Save to database

### **4. Custom Fields Management**
- **CRUD Operations**: Full create, read, update, delete
- **Modal Interface**: Dialog-based editing
- **Validation**: Field name required
- **Display**: Truncated values with "Show more" link
- **Empty State**: User-friendly call-to-action

### **5. Form Persistence**
- **Strategy**: Single "Save Changes" button per tab
- **Updates**: All changes stored in state until save
- **No Auto-save**: Manual save required
- **Feedback**: Loading states and toast notifications

---

## 🎨 UI Components Used

### **shadcn/ui Components**
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` - Tab navigation
- `Input` - Text inputs
- `Textarea` - Multi-line text inputs
- `Button` - Action buttons
- `Label` - Form labels
- `Checkbox` - Multi-select options
- `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem` - Dropdowns
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter` - Modal
- `Tooltip`, `TooltipProvider`, `TooltipTrigger`, `TooltipContent` - Info tooltips

### **Icons (Lucide React)**
- `Building2` - Organization/sections
- `Mail` - Contact information
- `MapPin` - Address
- `Upload` - File upload
- `Image as ImageIcon` - Logo placeholder
- `Info` - Tooltips
- `Save` - Save button
- `Sparkles` - AI features
- `GraduationCap` - School information
- `Plus` - Add actions
- `Pencil` - Edit actions
- `Trash2` - Delete actions
- `Loader2` - Loading states

---

## 🔒 Security & Authorization

### **Authentication**
- All API calls require Supabase session
- Middleware handles session validation
- Unauthorized requests return 401

### **Authorization**
- Organization updates require ADMIN or OWNER role
- Custom fields require organization membership
- Server-side role verification on all mutations

### **File Upload Security**
- File type validation (image/*, application/pdf)
- File size limits (5MB images, 10MB PDFs)
- Unique filenames prevent overwrites
- Old files cleaned up on replacement

---

## ⚡ Performance Considerations

### **Current Implementation**
- **Client-side rendering**: Full page is client component
- **No code splitting**: All tabs loaded at once
- **No memoization**: Re-renders on every state change
- **Sequential API calls**: Custom fields fetched after organization

### **Optimization Opportunities**
- Lazy load tab content
- Memoize form components
- Debounce save operations
- Parallel API calls where possible
- Optimistic UI updates

---

## 🐛 Known Issues & Limitations

### **Current Limitations**
1. **No form validation**: Client-side only, no schema validation
2. **No dirty state tracking**: Can't detect unsaved changes
3. **No auto-save**: Manual save required
4. **No field-level errors**: Only generic error messages
5. **No undo/redo**: Changes lost if page refreshed
6. **No field dependencies**: No conditional field visibility
7. **No bulk operations**: Custom fields edited one at a time
8. **No field types**: All custom fields are text-only
9. **No file preview**: PDF upload doesn't show preview
10. **No progress indicators**: File upload progress not shown

### **UX Issues**
1. **Save button placement**: Only at bottom, requires scrolling
2. **No confirmation**: Save happens immediately, no confirmation dialog
3. **No success feedback**: Only toast notification
4. **Tab switching**: No warning if unsaved changes
5. **Long forms**: No section navigation or progress indicator

---

## 📱 Responsive Design

### **Breakpoints**
- **Mobile**: Single column layout
- **md+ (768px)**: Multi-column grids for related fields
  - Contact: Email/Phone (2 columns)
  - Address: City/State/ZIP (3 columns)
  - Budget: Budget/Fiscal Year (2 columns)
  - School: Enrollment/Schools (2 columns), Grades (2 columns)

### **Mobile Considerations**
- All inputs stack vertically
- Tabs remain horizontal (scrollable if needed)
- Buttons full-width on small screens
- Modal dialogs responsive

---

## 🎯 Data Flow Diagram

```
User Interaction
    ↓
State Update (setOrganization)
    ↓
Form Renders with New Values
    ↓
User Clicks "Save Changes"
    ↓
handleSave() → PATCH /api/organizations/[id]
    ↓
Server Validates (Auth + Role)
    ↓
Prisma Update
    ↓
Response with Updated Data
    ↓
Toast Notification
    ↓
State Updated (if needed)
```

---

## 🔄 Custom Fields Flow

```
Tab 4 Loaded
    ↓
fetchCustomFields() → GET /api/organizations/[id]/custom-fields
    ↓
Display List or Empty State
    ↓
User Clicks "Add Custom Field"
    ↓
Modal Opens (CustomFieldModal)
    ↓
User Enters Field Name + Value
    ↓
handleSaveCustomField() → POST /api/organizations/[id]/custom-fields
    ↓
Update Local State
    ↓
Close Modal
    ↓
Toast Notification
```

---

## 📝 Code Quality Observations

### **Strengths**
✅ Comprehensive error handling
✅ Loading states for all async operations
✅ TypeScript interfaces for type safety
✅ Consistent naming conventions
✅ Good separation of concerns (modal component)
✅ Accessible form labels and inputs

### **Areas for Improvement**
⚠️ Large component (1,277 lines) - could be split
⚠️ Repeated save button code (3 instances)
⚠️ No form validation library (Zod/React Hook Form)
⚠️ Inline styles mixed with Tailwind
⚠️ Magic numbers (5MB, 10MB, 100 chars)
⚠️ No error boundaries
⚠️ Console.error without error tracking service

---

## 🎨 Design System Adherence

### **Colors**
- Uses theme-aware colors (`text-muted-foreground`, `border-border`)
- Consistent with shadcn/ui design system
- No hardcoded colors

### **Spacing**
- Consistent spacing scale (4, 6, 8)
- Grid gaps standardized
- Padding consistent

### **Typography**
- Font sizes follow scale (text-3xl, text-lg, text-sm, text-xs)
- Font weights consistent (font-bold, font-semibold, font-normal)
- Line heights appropriate

### **Components**
- All components from shadcn/ui
- Consistent button variants
- Standardized input styles

---

## 🚀 Integration Points

### **Used By**
- Settings navigation (`/private/[slug]/settings/profile`)
- Dashboard feature card (links to settings)

### **Uses**
- Supabase Storage (logo uploads)
- OpenAI API (strategic plan summarization)
- unpdf library (PDF extraction)
- Organization API endpoints
- Custom Fields API endpoints

### **Data Used By**
- AI Assistant Agent (organization context)
- Grant Recommendations (organization profile)
- Eligibility Analysis (organization data)
- Application creation (organization info)

---

## 📊 Statistics

- **Total Lines**: 1,277 (main component)
- **Tabs**: 4
- **Form Fields**: ~20+ fields
- **API Endpoints**: 8
- **State Variables**: 10
- **Event Handlers**: 8
- **useEffect Hooks**: 2
- **Icons Used**: 12
- **UI Components**: 15+

---

## 🎯 Summary

The Organization Profile page is a **comprehensive, feature-rich settings page** that handles:
- ✅ Basic organization information
- ✅ Contact details and address
- ✅ Budget and strategic planning
- ✅ School-specific information
- ✅ Custom extensible fields
- ✅ File uploads (logo, PDF)
- ✅ AI-powered features (summarization)

**Key Strengths:**
- Well-organized tab structure
- Comprehensive field coverage
- AI integration for strategic plans
- Custom fields for extensibility
- Good error handling and loading states

**Key Weaknesses:**
- Large monolithic component
- No form validation library
- No auto-save or dirty state tracking
- Limited UX feedback
- No field-level validation

**Ready for Redesign**: ✅
The current implementation provides a solid foundation for a UI redesign while maintaining all existing functionality.

---

*Analysis completed on: $(date)*
*Branch: feat/org-profile-update*

