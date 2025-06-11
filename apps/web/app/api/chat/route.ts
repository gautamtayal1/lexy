import { NextRequest } from "next/server";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@repo/db/convex/_generated/api";

export const runtime = "edge";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
})

export async function POST(request: NextRequest) {
  const { 
    userId,
    messages,
    threadId,
    model,
    reasoning,
    modelParams,
  } = await request.json();

  const result = streamText({
    model: openrouter.chat("deepseek/deepseek-r1-0528-qwen3-8b:free"),
    prompt: messages.map((message: any) => `${message.role}: ${message.content}`).join("\n"),
  })

  for await (const chunk of result.textStream) {
    console.log(chunk);
  }

  return new Response(result.textStream, {
    headers: {
      "Content-Type": "text/event-stream",
    },
  });
}