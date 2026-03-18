export type ModeId = "understand" | "organize" | "respond";

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
      "This level makes your document easier to read.",
      "You will receive:",
      "• A plain-language rewrite",
      "• Key points",
      "• Any deadlines",
      "• Clear next steps",
      "Best for when you just need clarity."
    ]
  },

  organize: {
    id: "organize",
    label: "Organize",
    keys: 2,
    description: [
      "Includes everything in Understand, plus:",
      "• A simple timeline",
      "• Issues that may need attention",
      "• A checklist of helpful information",
      "Best for when you need to prepare before taking action."
    ]
  },

  respond: {
    id: "respond",
    label: "Respond",
    keys: 3,
    description: [
      "Includes Understand and Organize, plus:",
      "• A structured reply draft",
      "• A clear subject line",
      "• Calm, professional wording",
      "",
      "This does not provide legal advice.",
      "Best for when you are ready to respond."
    ]
  }
};