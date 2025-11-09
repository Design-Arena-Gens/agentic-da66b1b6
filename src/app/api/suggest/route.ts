import { NextResponse } from "next/server";
import { z } from "zod";
import { getOpenAIClient } from "@/lib/openai";
import { suggestionSystemPrompt } from "@/lib/prompts";
import type { SuggestionResponse } from "@/types/agent";

const listingSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  price: z.string().min(1),
  category: z.string().min(2),
  condition: z.string().min(2),
  targetAudience: z.string().min(2)
});

export async function POST(req: Request) {
  try {
    const openai = getOpenAIClient();
    const body = await req.json();
    const listing = listingSchema.parse(body);

    const userPrompt = `Listing Information:\nTitle: ${listing.title}\nDescription: ${listing.description}\nPrice: ${listing.price}\nCategory: ${listing.category}\nCondition: ${listing.condition}\nTarget Audience: ${listing.targetAudience}\n\nReturn optimized guidance.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: suggestionSystemPrompt },
        { role: "user", content: userPrompt }
      ]
    });

    const content = completion.choices[0]?.message?.content ?? "{}";
    const parsed: SuggestionResponse = JSON.parse(content);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Suggestion error", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid listing payload.", details: error.flatten() },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes("OPENAI_API_KEY")) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Unable to generate suggestions." },
      { status: 500 }
    );
  }
}
