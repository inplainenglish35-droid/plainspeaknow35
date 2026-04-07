export type Language =
  | "en" // English
  | "es" // Spanish
  | "vi" // Vietnamese
  | "tl"; // Tagalog

export type SimplicityMode =
  | "understand"
  | "organize"
  | "respond";

export interface TextStats {
  wordCount: number;
  sentenceCount: number;
  avgWordsPerSentence?: number;
}


