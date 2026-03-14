export type Language =
  | "en"
  | "es";

export type SimplicityMode =
  | "understand"
  | "organize"
  | "respond";

export interface TextStats {
  wordCount: number;
  sentenceCount: number;
  avgWordsPerSentence?: number;
}