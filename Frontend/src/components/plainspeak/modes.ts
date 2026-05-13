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
      "Turn your document into clear, plain language.",
      "You will receive:",
      "• A simplified explanation",
      "• Important items clearly labeled",
      "• Translation if needed",
      "",
      "Includes:",
      "🔺 Critical items",
      "🟧 Urgent items",
      "🟨 Important details"
    ]
  }
};