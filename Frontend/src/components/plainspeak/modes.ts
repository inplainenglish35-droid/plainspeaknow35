export type ModeId = "understand" | "organize" | "respond";

export type ModeType = {
  id: ModeId;
  label: string;
  keys: number; // stays for display consistency, but all = 1
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
      "• A simple rewrite",
      "• Key points",
      "• Important dates",
      "• Clear next steps",
      "",
      "This is the foundation of every result."
    ]
  },

  organize: {
    id: "organize",
    label: "Organize",
    keys: 1,
    description: [
      "Everything from Understand, plus:",
      "• A simple timeline",
      "• What needs attention",
      "• A structured breakdown",
      "",
      "Included automatically in your result."
    ]
  },

  respond: {
    id: "respond",
    label: "Respond",
    keys: 1,
    description: [
      "Everything from Understand and Organize, plus:",
      "• A ready-to-use response draft",
      "• Clear subject line",
      "• Calm, professional wording",
      "",
      "This does not provide legal advice.",
      "Included automatically when needed."
    ]
  }
};