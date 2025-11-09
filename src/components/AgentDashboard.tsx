"use client";

import { useState } from "react";
import type React from "react";
import type {
  ListingInput,
  SuggestionResponse,
  ChatMessage
} from "@/types/agent";

const defaultListing: ListingInput = {
  title: "",
  description: "",
  price: "",
  category: "",
  condition: "",
  targetAudience: ""
};

const sampleListing: ListingInput = {
  title: "Refurbished MacBook Air M1 256GB",
  description:
    "Lightly used 2021 MacBook Air (Space Gray) with 8GB RAM and 256GB SSD. Fresh battery cycle count under 90, includes original box, charger, and protective sleeve.",
  price: "₹58,000",
  category: "Electronics",
  condition: "Excellent",
  targetAudience: "Remote workers and students needing fast delivery in Delhi NCR"
};

export function AgentDashboard() {
  const [listing, setListing] = useState<ListingInput>(defaultListing);
  const [suggestions, setSuggestions] = useState<SuggestionResponse | null>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "assistant-initial",
      role: "assistant",
      createdAt: Date.now(),
      content:
        "नमस्ते! मैं आपका Marketplace सेल्स एजेंट हूँ। अपनी लिस्टिंग की जानकारी साझा करें और मैं इसे बेहतर बनाने में मदद करूँगा।"
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const handleListingChange = (field: keyof ListingInput) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setListing((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const resetListing = () => {
    setListing(defaultListing);
    setSuggestions(null);
    setSuggestionError(null);
  };

  const applySample = () => {
    setListing(sampleListing);
  };

  const requestSuggestions = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoadingSuggestions(true);
    setSuggestionError(null);

    try {
      const response = await fetch("/api/suggest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(listing)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error ?? "Suggestion request failed.");
      }

      const data: SuggestionResponse = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error(error);
      setSuggestionError(
        error instanceof Error ? error.message : "Unable to fetch suggestions."
      );
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const sendMessage = async () => {
    if (!chatInput.trim()) {
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: chatInput.trim(),
      createdAt: Date.now()
    };

    const optimisticMessages = [...messages, userMessage];
    setMessages(optimisticMessages);
    setChatInput("");
    setIsSending(true);
    setChatError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: optimisticMessages.map(({ role, content }) => ({ role, content })),
          listing
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error ?? "Chat request failed.");
      }

      const data = (await response.json()) as { reply: string };

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply,
        createdAt: Date.now()
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      setChatError(error instanceof Error ? error.message : "Unable to send message.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
      <section className="grid gap-6 md:grid-cols-[2fr,3fr]">
        <form
          onSubmit={requestSuggestions}
          className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-xl shadow-slate-950/40"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Listing Intelligence</h2>
            <div className="flex gap-2 text-sm">
              <button
                type="button"
                onClick={applySample}
                className="rounded-lg border border-brand-500/40 px-3 py-1 text-brand-200 transition hover:border-brand-400 hover:text-brand-50"
              >
                Load sample
              </button>
              <button
                type="button"
                onClick={resetListing}
                className="rounded-lg border border-slate-700 px-3 py-1 text-slate-300 transition hover:border-slate-500 hover:text-white"
              >
                Reset
              </button>
            </div>
          </div>

          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-200">Title</span>
            <input
              required
              value={listing.title}
              onChange={handleListingChange("title")}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-brand-400 focus:outline-none"
              placeholder="Example: Premium Wooden Study Table"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-200">Description</span>
            <textarea
              required
              value={listing.description}
              onChange={handleListingChange("description")}
              className="min-h-[120px] rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-brand-400 focus:outline-none"
              placeholder="Highlight key features, usage, warranty, delivery, etc."
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-slate-200">Price</span>
              <input
                required
                value={listing.price}
                onChange={handleListingChange("price")}
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-brand-400 focus:outline-none"
                placeholder="₹4,999"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-slate-200">Category</span>
              <input
                required
                value={listing.category}
                onChange={handleListingChange("category")}
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-brand-400 focus:outline-none"
                placeholder="Furniture, Electronics, Fashion"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-slate-200">Condition</span>
              <input
                required
                value={listing.condition}
                onChange={handleListingChange("condition")}
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-brand-400 focus:outline-none"
                placeholder="Brand new, Excellent, Refurbished"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-slate-200">Target Audience</span>
              <input
                required
                value={listing.targetAudience}
                onChange={handleListingChange("targetAudience")}
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-brand-400 focus:outline-none"
                placeholder="Ideal buyers, urgency, city"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoadingSuggestions}
            className="mt-2 inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:cursor-wait disabled:bg-brand-500/60"
          >
            {isLoadingSuggestions ? "Analyzing listing..." : "Generate growth playbook"}
          </button>

          {suggestionError ? (
            <p className="text-sm text-rose-400">{suggestionError}</p>
          ) : null}
        </form>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-brand-500/20 bg-slate-900/60 p-6 shadow-xl shadow-brand-500/10">
            <h2 className="text-xl font-semibold text-white">Growth Playbook</h2>
            {suggestions ? (
              <div className="mt-4 space-y-4 text-sm text-slate-200">
                <div>
                  <p className="text-brand-200">Opportunity Summary</p>
                  <p className="mt-1 text-slate-100">{suggestions.summary}</p>
                </div>

                {suggestions.copySuggestions.length ? (
                  <div>
                    <p className="text-brand-200">Copy Upgrades</p>
                    <ul className="mt-1 list-disc space-y-1 pl-5 text-slate-100">
                      {suggestions.copySuggestions.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {suggestions.keywordTags.length ? (
                  <div>
                    <p className="text-brand-200">Recommended Keyword Tags</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {suggestions.keywordTags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-brand-500/40 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-100"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {suggestions.growthIdeas.length ? (
                  <div>
                    <p className="text-brand-200">Growth Tactics</p>
                    <ul className="mt-1 list-disc space-y-1 pl-5 text-slate-100">
                      {suggestions.growthIdeas.map((idea) => (
                        <li key={idea}>{idea}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-400">
                आपकी लिस्टिंग के आधार पर यहाँ पर कॉपी सुझाव, हैशटैग और सेल्स रणनीति दिखाई जाएगी।
              </p>
            )}
          </div>

          <div className="flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-xl shadow-slate-950/40">
            <h2 className="text-xl font-semibold text-white">Sales Agent Chat</h2>
            <div className="mt-3 flex-1 space-y-3 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-100">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex flex-col gap-1 ${
                    message.role === "assistant" ? "items-start" : "items-end"
                  }`}
                >
                  <span
                    className={`max-w-[75%] whitespace-pre-wrap rounded-2xl px-4 py-2 ${
                      message.role === "assistant"
                        ? "bg-brand-500/20 text-brand-50"
                        : "bg-slate-800 text-slate-100"
                    }`}
                  >
                    {message.content}
                  </span>
                  <span className="text-[11px] uppercase tracking-wide text-slate-500">
                    {message.role === "assistant" ? "Agent" : "You"}
                  </span>
                </div>
              ))}
            </div>

            {chatError ? (
              <p className="mt-2 text-sm text-rose-400">{chatError}</p>
            ) : null}

            <div className="mt-4 flex gap-2">
              <textarea
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder="एजेंट से पूछें: खरीदार को कैसे जवाब दें, कौन सा ऑफर दें, आदि..."
                className="h-24 flex-1 resize-none rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={isSending}
                className="h-24 w-32 rounded-xl bg-brand-500 text-sm font-semibold text-white transition hover:bg-brand-400 disabled:cursor-wait disabled:bg-brand-500/60"
              >
                {isSending ? "Thinking..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
