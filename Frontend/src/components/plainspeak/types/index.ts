export type Language =
  | "en" // English
  | "es" // Spanish
  | "vi" // Vietnamese
  | "tl"; // Tagalog

export interface TextStats {
  wordCount: number;
  sentenceCount: number;
  avgWordsPerSentence?: number;
}


