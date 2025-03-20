// History item type for chat history
export interface HistoryItem {
  role: "user" | "model";
  parts: HistoryPart[];
}

// History part type for different content types in chat
export interface HistoryPart {
  text?: string;
  image?: string; // Base64 encoded image data URL
}
