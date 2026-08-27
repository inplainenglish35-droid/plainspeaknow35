export type Language =
  | "en" // English
  | "es" // Spanish
  | "vi" // Vietnamese
  | "tl" // Tagalog
  | "fr" // French
  | "zh" // Simplified Chinese
  | "ko" // Korean
  | "ar" // Arabic
  | "pt" // Portuguese
  | "ru" // Russian
  | "ht" // Haitian Creole
  | "hi" // Hindi
;

export interface TextStats {
  wordCount: number;
  sentenceCount: number;
  avgWordsPerSentence?: number;
}


