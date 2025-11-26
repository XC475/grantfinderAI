/**
 * Client-side file upload validation utility
 * Used for validating files before upload to provide immediate user feedback
 */

// File size limits (matching backend)
export const MAX_DOCUMENT_SIZE = 40 * 1024 * 1024; // 40MB
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// Note: Page count validation requires parsing PDF, so it's backend-only

// Allowed file types
export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "text/plain",
  "text/csv",
];

export const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
];

// Human-readable type names
const TYPE_NAMES: Record<string, string> = {
  "application/pdf": "PDF",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "Word (.docx)",
  "text/plain": "Text (.txt)",
  "text/csv": "CSV",
  "image/png": "PNG",
  "image/jpeg": "JPEG",
  "image/jpg": "JPEG",
  "image/gif": "GIF",
  "image/webp": "WebP",
};

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates a document file (PDF, DOCX, TXT, CSV)
 */
export function validateDocumentFile(file: File): ValidationResult {
  if (!file) {
    return { valid: false, error: "No file provided" };
  }

  // Check file type
  if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported file type. Please upload PDF, Word (.docx), Text, or CSV files.`,
    };
  }

  // Check file size
  if (file.size > MAX_DOCUMENT_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum limit of ${MAX_DOCUMENT_SIZE / (1024 * 1024)}MB`,
    };
  }

  return { valid: true };
}

/**
 * Validates an image file
 */
export function validateImageFile(file: File): ValidationResult {
  if (!file) {
    return { valid: false, error: "No file provided" };
  }

  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error:
        "Unsupported image type. Please upload PNG, JPEG, GIF, or WebP images.",
    };
  }

  // Check file size
  if (file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: `Image size exceeds maximum limit of ${MAX_IMAGE_SIZE / (1024 * 1024)}MB`,
    };
  }

  return { valid: true };
}

/**
 * Validates multiple files and returns details about each
 */
export function validateMultipleFiles(
  files: File[],
  type: "document" | "image" = "document"
): {
  allValid: boolean;
  results: Array<{ file: File; validation: ValidationResult }>;
  errors: string[];
} {
  const validateFn =
    type === "document" ? validateDocumentFile : validateImageFile;

  const results = files.map((file) => ({
    file,
    validation: validateFn(file),
  }));

  const errors = results
    .filter((r) => !r.validation.valid)
    .map((r) => `${r.file.name}: ${r.validation.error}`);

  return {
    allValid: results.every((r) => r.validation.valid),
    results,
    errors,
  };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Get human-readable file type name
 */
export function getFileTypeName(mimeType: string): string {
  return TYPE_NAMES[mimeType] || mimeType;
}
