/**
 * Hard document safety limits (not billing logic)
 * Prevent runaway payloads
 */

export const MAX_DOCUMENT_CHARS = 120_000; // ~30 pages safe buffer

export function enforceDocumentLimit(text: string): {
  truncatedText: string;
  wasTruncated: boolean;
} {
  if (text.length <= MAX_DOCUMENT_CHARS) {
    return {
      truncatedText: text,
      wasTruncated: false,
    };
  }

  return {
    truncatedText: text.slice(0, MAX_DOCUMENT_CHARS),
    wasTruncated: true,
  };
}