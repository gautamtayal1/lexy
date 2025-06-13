import { createGroq } from "@ai-sdk/groq";
import { ConvexHttpClient } from "convex/browser";
import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { api } from "@repo/db/convex/_generated/api";

export async function POST(request: NextRequest) {
  const { threadId, userId, question } = await request.json();

  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY!,
  })
  const {text} = await generateText({
    model: groq("deepseek-r1-distill-llama-70b"),
    system: "you are a helpful assistant",
    prompt: `You are a helpful assistant that generates a title for a thread based on the question. First, generate a brief hypothetical answer to the question (5-10 sentences). Then, create a title that captures the essence of that answer. The title should be a single sentence and should reflect the answer rather than the question itself. NEVER exceed 25 characters. If the question appears to be random characters or gibberish, return "New Chat" as the title.
    Question: ${question}
    Title:`,
  })

  await convex.mutation(api.threads.updateTitle, {
    userId,
    threadId,
    title: text.split("Title:")[1]?.trim() || "New Chat",
  });

  return NextResponse.json({ message: "Thread title set" });
}