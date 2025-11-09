import { NextResponse } from "next/server";
import { z } from "zod";
import { getOpenAIClient } from "@/lib/openai";
import { chatSystemPrompt } from "@/lib/prompts";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1)
});

const payloadSchema = z.object({
  messages: z.array(messageSchema).min(1),
  listing: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      price: z.string().optional(),
      category: z.string().optional(),
      condition: z.string().optional(),
      targetAudience: z.string().optional()
    })
    .optional()
});

export async function POST(req: Request) {
  try {
    const openai = getOpenAIClient();
    const json = await req.json();
    const { messages, listing } = payloadSchema.parse(json);

    const contextChunks: string[] = [];
    if (listing?.title) contextChunks.push(`Title: ${listing.title}`);
    if (listing?.description) contextChunks.push(`Description: ${listing.description}`);
    if (listing?.price) contextChunks.push(`Price: ${listing.price}`);
    if (listing?.category) contextChunks.push(`Category: ${listing.category}`);
    if (listing?.condition) contextChunks.push(`Condition: ${listing.condition}`);
    if (listing?.targetAudience)
      contextChunks.push(`Target Audience: ${listing.targetAudience}`);

    const contextBlock = contextChunks.length
      ? `\n\nListing context:\n${contextChunks.join("\n")}`
      : "";

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        { role: "system", content: chatSystemPrompt + contextBlock },
        ...messages.map((message) => ({
          role: message.role,
          content: message.content
        }))
      ]
    });

    const reply = completion.choices[0]?.message?.content?.trim();

    if (!reply) {
      return NextResponse.json(
        {
          error: "Empty response from model. Try again.",
          fallback:
            "I'm recalibrating and didn't catch that. Could you rephrase your question?"
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat error", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid chat payload.", details: error.flatten() },
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
      { error: "Unable to generate a response." },
      { status: 500 }
    );
  }
}
