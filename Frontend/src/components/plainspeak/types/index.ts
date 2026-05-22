export type Language =
  | "en" // English
  | "es" // Spanish
  | "vi" // Vietnamese
  | "tl" // Tagalog
  | "fr" // French
;

export interface TextStats {
  wordCount: number;
  sentenceCount: number;
  avgWordsPerSentence?: number;
}


