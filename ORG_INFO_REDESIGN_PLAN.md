# Org Info Tab Redesign - Development Plan

## 📋 Overview
Complete redesign of the "Org Info" tab to improve UX, visual hierarchy, and data input methods.

---

## 🎯 Task Breakdown

### **Task 1: Tab Rename**
**Current**: "Org Info"  
**New**: "Details" (or "Overview", "Information", "Profile")  
**Rationale**: One-word name that encompasses Mission Statement, Budget, Strategic Plan, and School Information

**Implementation**:
- Update `TabsTrigger` value and label
- Update `TabsContent` value
- Ensure all references are updated

---

### **Task 2: Remove Duplicate Save Button**
**Current**: Two save buttons (one sticky at top, one at bottom)  
**New**: Single save button in header (top right, matching Team page)

**Implementation**:
- Remove sticky save button from inside `TabsContent value="org-info"`
- Verify header save button works for all tab content
- Test save functionality

---

### **Task 3: Mission Statement - Add Button Pattern**
**Current**: Always-visible textarea  
**New**: "Add Mission Statement" button → Shows textarea when clicked

**Implementation**:
- Add state: `const [showMissionStatement, setShowMissionStatement] = useState(false)`
- Conditional rendering:
  - If no mission statement AND not showing: Show "Add Mission Statement" button
  - If showing OR has mission statement: Show textarea
- Button should be centered/well-positioned
- Consider "Edit" button when mission statement exists

---

### **Task 4: Budget Information Section**

#### **4.1: Rename Section**
- "Budget Information" → "Basic Budget Information"

#### **4.2: Annual Operating Budget Field**
**Changes**:
- Remove number input spinner (use `type="text"` instead of `type="number"`)
- Add dollar sign prefix (`$`) - use input wrapper with prefix
- Format number with commas (e.g., `1,000,000`)
- Handle input parsing (remove commas, $, format on display)

**Implementation**:
- Create helper function: `formatCurrency(value: string): string`
- Create helper function: `parseCurrency(value: string): string` (removes $ and commas)
- Use `type="text"` input with prefix styling
- Format on blur, allow raw input while typing

#### **4.3: Fiscal Year End - Calendar Component**
**Current**: Text input with placeholder "June 30 or 06/30"  
**New**: Calendar date picker (shadcn Calendar component)

**Implementation**:
- Import `Calendar` component
- Use `Popover` + `Calendar` pattern (matching grants page)
- Store as date, format for display
- Parse existing text values if present
- Use `format` from `date-fns` for display (matching grants page pattern)

#### **4.4: Change Icon**
**Current**: `Building2`  
**New**: `DollarSign` or `Wallet` or `Banknote` (budget-related icon)

---

### **Task 5: Strategic Plan - Complete Redesign**

#### **5.1: New UI Flow States**

**State 1: Empty/Initial**
- Centered content box
- Large upload icon or document icon
- Text: "Upload your PDF"
- Upload button (triggers file input)

**State 2: Loading**
- Centered loading spinner
- Text: "Processing PDF..." or "Extracting text..."

**State 3: Success**
- Document icon with checkmark
- Text: "Strategic plan uploaded successfully"
- Date: "Added on [formatted date]"
- Button: "See extracted text" (opens modal)

**State 4: Edit Modal**
- Modal/Dialog component
- Textarea with markdown content (editable)
- Save/Cancel buttons
- Updates strategic plan in database

#### **5.2: Implementation Details**

**State Management**:
```typescript
const [strategicPlanState, setStrategicPlanState] = useState<'empty' | 'loading' | 'success' | 'error'>('empty');
const [strategicPlanUploadDate, setStrategicPlanUploadDate] = useState<Date | null>(null);
const [showStrategicPlanModal, setShowStrategicPlanModal] = useState(false);
```

**PDF Upload Flow**:
1. User clicks upload → File input opens
2. File selected → Set state to 'loading'
3. Call `/api/pdf-extract` → Extract text
4. Save to database → Update organization.strategicPlan
5. Set state to 'success' → Show success UI
6. Store upload date → Display in success state

**Modal Component**:
- Use `Dialog` component from shadcn/ui
- Textarea for editing markdown
- Save button → Updates database
- Cancel button → Closes without saving

**Remove**:
- Current textarea (always visible)
- "Summarize with AI" button (or keep it in modal?)
- Direct text editing in main view

#### **5.3: Change Icon**
**Current**: `Building2`  
**New**: `Target`, `Flag`, `Map`, `Route`, `TrendingUp`, or `FileText` (strategic/planning-related)

---

## 📦 Required Components & Imports

### **New Imports Needed**:
```typescript
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { DollarSign, Target, CheckCircle2, FileText } from "lucide-react";
```

### **Components to Create/Modify**:
1. **StrategicPlanModal** (new component)
   - Dialog wrapper
   - Textarea for editing
   - Save/Cancel buttons
   - AI summarize button (optional, in modal)

2. **CurrencyInput** (helper component or inline)
   - Input with $ prefix
   - Comma formatting
   - Parsing logic

---

## 🔄 Data Flow Changes

### **Budget Field**:
- **Display**: `$1,000,000` (formatted)
- **Storage**: `1000000` (number/string in DB)
- **Input**: User types → Parse → Format on blur

### **Fiscal Year End**:
- **Display**: `June 30, 2025` (formatted date)
- **Storage**: Date object or formatted string
- **Input**: Calendar picker → Store as date

### **Strategic Plan**:
- **Display**: Success state with date (no text preview)
- **Storage**: Full markdown text in database
- **Input**: PDF upload → Extract → Store → Show success
- **Edit**: Modal → Edit text → Save → Update database

---

## 🎨 UI/UX Considerations

### **Mission Statement**:
- Button should be prominent but not overwhelming
- Smooth transition when showing textarea
- Consider "Edit" vs "Add" button text

### **Budget Field**:
- Dollar sign should be visually distinct but not intrusive
- Comma formatting should happen on blur (not while typing)
- Handle edge cases (empty, invalid input)

### **Calendar**:
- Match existing calendar pattern from grants page
- Use same styling and behavior
- Handle date parsing from existing text values

### **Strategic Plan**:
- Success state should be visually appealing
- Loading state should be clear and informative
- Modal should be large enough for comfortable editing
- Consider markdown preview option in modal

---

## 🧪 Testing Checklist

- [ ] Tab rename works correctly
- [ ] Save button in header saves all fields
- [ ] Mission Statement add button shows/hides textarea
- [ ] Budget field formats correctly with commas and $
- [ ] Budget field parses correctly on save
- [ ] Calendar picker works for fiscal year end
- [ ] Calendar displays existing dates correctly
- [ ] Strategic Plan empty state displays correctly
- [ ] Strategic Plan loading state shows during upload
- [ ] Strategic Plan success state shows after upload
- [ ] Strategic Plan modal opens from "See extracted text"
- [ ] Strategic Plan modal saves changes correctly
- [ ] All icons are appropriate and consistent
- [ ] Responsive design works on mobile

---

## 📝 Implementation Order

1. **Phase 1: Quick Wins**
   - Tab rename
   - Remove duplicate save button
   - Change icons

2. **Phase 2: Mission Statement**
   - Add button pattern
   - Conditional rendering

3. **Phase 3: Budget Section**
   - Rename section
   - Currency formatting
   - Calendar implementation

4. **Phase 4: Strategic Plan (Complex)**
   - State management
   - UI states (empty, loading, success)
   - Modal component
   - PDF upload flow
   - Edit functionality

---

## 🔍 Technical Notes

### **Currency Formatting**:
```typescript
function formatCurrency(value: string | number | null): string {
  if (!value) return '';
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : value;
  if (isNaN(num)) return '';
  return num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function parseCurrency(value: string): string {
  return value.replace(/[^0-9.]/g, '');
}
```

### **Date Handling**:
- Use `date-fns` `format` function (already in dependencies)
- Parse existing text dates if present
- Store as ISO string or Date object
- Display in user-friendly format

### **Strategic Plan States**:
- Check if `organization.strategicPlan` exists to determine initial state
- Track upload date separately (could use `updatedAt` or add new field)
- Modal should load current strategic plan text for editing

---

## 🎯 Success Criteria

✅ Tab has intuitive one-word name  
✅ Single save button in header (functional)  
✅ Mission Statement uses add button pattern  
✅ Budget field shows formatted currency with $  
✅ Fiscal year end uses calendar picker  
✅ Strategic Plan has clean upload → success flow  
✅ Strategic Plan text is editable in modal  
✅ All icons are contextually appropriate  
✅ UI is consistent with design system  
✅ All functionality works as expected  

---

*Plan created: $(date)*  
*Branch: feat/org-profile-update*

