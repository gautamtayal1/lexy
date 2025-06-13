import { NextRequest, NextResponse } from "next/server";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@repo/db/convex/_generated/api";
import { openai } from "@ai-sdk/openai";
import { createGroq } from "@ai-sdk/groq";

export const runtime = "edge";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
})

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const { 
      userId,
      messages,
      threadId,
      model,
      modelParams,
    }: {
      userId: string;
      messages: any[];
      threadId: string;
      model: string;
      modelParams: any;
    } = await request.json();

    if (!messages || messages.length === 0) {
      return new Response("messages are required", { status: 400 });
    }

    const threadInternalId = await convex.mutation(api.threads.ensureThread, {
      userId,
      threadId,
      model: "deepseek/deepseek-r1-0528-qwen3-8b:free",
      title: "sample thread",
    });
    
    const userMessageId = crypto.randomUUID();
    const last = messages[messages.length - 1]!
    await convex.mutation(api.messages.addMessage, {
      userId,
      threadId: threadInternalId as string,
      role: "user",
      content: last.content as string,
      model: "deepseek/deepseek-r1-0528-qwen3-8b:free",
      status: "completed",
      modelParams,
      messageId: userMessageId,
    })

    const assistantMessageId = crypto.randomUUID();
    await convex.mutation(api.messages.addMessage, {
      userId,
      threadId: threadInternalId as string,
      messageId: assistantMessageId,
      role: "assistant",
      content: "",
      model: "deepseek/deepseek-r1-0528-qwen3-8b:free",
      status: "thinking",
      modelParams,
    })

    const result = await streamText({
      model: groq("llama-3.1-8b-instant"),
      // model: openrouter.chat("gpt-4o"),
      system: "you are a helpful assistant",
      messages,
    })
    return result.toDataStreamResponse({
      sendReasoning: true,
      sendSources: true,
    })
  } catch (error) {
    console.error("Error in chat route:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}