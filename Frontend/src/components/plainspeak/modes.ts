export type ModeId = "understand";

export type ModeType = {
  id: ModeId;
  label: string;
  keys: number;
  description: string[];
};

export const MODES: Record<ModeId, ModeType> = {
  understand: {
    id: "understand",
    label: "Understand",
    keys: 1,
    description: [
  "Understand your document before you make a decision.",
  "",
  "You'll receive:",
  "• A complete plain-language rewrite",
  "• A professional response (when appropriate)",
  "• Translation if needed",
  "",
  "Clearly organized:",
  "🟥 Critical items",
  "🟧 Urgent items",
  "🟨 Important details"
]
  }
};