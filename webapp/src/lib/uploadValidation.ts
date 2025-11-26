import { extractText } from "unpdf";

// File size limits
export const MAX_DOCUMENT_SIZE = 40 * 1024 * 1024; // 40MB for documents
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB for images

// Page limits
export const MAX_PDF_PAGES = 150;

// Allowed file types
export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
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

// Error messages
export const ERROR_MESSAGES = {
  FILE_TOO_LARGE: (maxSizeMB: number) =>
    `File size exceeds maximum limit of ${maxSizeMB}MB`,
  TOO_MANY_PAGES: (maxPages: number) =>
    `PDF has too many pages. Maximum allowed is ${maxPages} pages`,
  UNSUPPORTED_TYPE: (allowedTypes: string) =>
    `Unsupported file type. Supported types: ${allowedTypes}`,
  NO_FILE: "No file provided",
  EXTRACTION_FAILED: "Failed to extract text from file",
};

/**
 * Validates a document file's size and type
 */
export function validateDocumentFile(
  file: File | { size: number; type: string; name: string }
): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: ERROR_MESSAGES.NO_FILE };
  }

  // Check file type
  if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: ERROR_MESSAGES.UNSUPPORTED_TYPE("PDF, Word (.docx), Text, CSV"),
    };
  }

  // Check file size
  if (file.size > MAX_DOCUMENT_SIZE) {
    return {
      valid: false,
      error: ERROR_MESSAGES.FILE_TOO_LARGE(MAX_DOCUMENT_SIZE / (1024 * 1024)),
    };
  }

  return { valid: true };
}

/**
 * Validates an image file's size and type
 */
export function validateImageFile(
  file: File | { size: number; type: string }
): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: ERROR_MESSAGES.NO_FILE };
  }

  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: ERROR_MESSAGES.UNSUPPORTED_TYPE("PNG, JPEG, GIF, WebP"),
    };
  }

  // Check file size
  if (file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: ERROR_MESSAGES.FILE_TOO_LARGE(MAX_IMAGE_SIZE / (1024 * 1024)),
    };
  }

  return { valid: true };
}

/**
 * Validates PDF page count
 */
export function validatePageCount(pageCount: number): {
  valid: boolean;
  error?: string;
} {
  if (pageCount > MAX_PDF_PAGES) {
    return {
      valid: false,
      error: ERROR_MESSAGES.TOO_MANY_PAGES(MAX_PDF_PAGES),
    };
  }

  return { valid: true };
}

/**
 * Extracts page count from a PDF buffer
 */
export async function getPageCount(
  buffer: Buffer
): Promise<{ pageCount: number; error?: string }> {
  try {
    const uint8Array = new Uint8Array(buffer);
    const { totalPages } = await extractText(uint8Array);
    return { pageCount: totalPages };
  } catch (error) {
    console.error("Error extracting page count:", error);
    return {
      pageCount: 0,
      error:
        error instanceof Error ? error.message : "Failed to extract page count",
    };
  }
}

/**
 * Full validation for document uploads including page count for PDFs
 */
export async function validateDocumentUpload(
  file: File | { size: number; type: string; name: string },
  buffer?: Buffer
): Promise<{ valid: boolean; error?: string; pageCount?: number }> {
  // First validate file size and type
  const fileValidation = validateDocumentFile(file);
  if (!fileValidation.valid) {
    return fileValidation;
  }

  // If it's a PDF and we have the buffer, check page count
  if (file.type === "application/pdf" && buffer) {
    const { pageCount, error } = await getPageCount(buffer);

    if (error) {
      return { valid: false, error };
    }

    const pageValidation = validatePageCount(pageCount);
    if (!pageValidation.valid) {
      return { ...pageValidation, pageCount };
    }

    return { valid: true, pageCount };
  }

  return { valid: true };
}
