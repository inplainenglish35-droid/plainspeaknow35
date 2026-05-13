export const SUPPORTED_LANGUAGES = ["en", "es", "vi", "tl"] as const;

export type Language = typeof SUPPORTED_LANGUAGES[number];

export interface TextStats {
  wordCount: number;
  sentenceCount: number;
  avgWordsPerSentence?: number;
}