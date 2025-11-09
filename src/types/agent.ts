export interface ListingInput {
  title: string;
  description: string;
  price: string;
  category: string;
  condition: string;
  targetAudience: string;
}

export interface SuggestionResponse {
  summary: string;
  copySuggestions: string[];
  keywordTags: string[];
  growthIdeas: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}
