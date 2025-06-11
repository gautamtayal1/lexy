import { NextRequest, NextResponse } from "next/server";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText, CoreMessage } from "ai";
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
    modelParams,
  }: {
    userId: string;
    messages: CoreMessage[];
    threadId: string;
    model: string;
    modelParams: any;
  } = await request.json();

  if (!messages || messages.length === 0) {
    return new Response("messages are required", { status: 400 });
  }
  console.log("check1")

  const threadInternalId = await convex.mutation(api.threads.ensureThread, {
    userId,
    threadId,
    model,
    title: "sample thread",
  });
  console.log("check2")
  
  const userMessageId = crypto.randomUUID();
  const last = messages[messages.length - 1]!
  await convex.mutation(api.messages.addMessage, {
    userId,
    threadId: threadInternalId as string,
    role: "user",
    content: last.content as string,
    model,
    status: "completed",
    modelParams,
    messageId: userMessageId,
  })

  console.log("check3")

  const assistantMessageId = crypto.randomUUID();
  await convex.mutation(api.messages.addMessage, {
    userId,
    threadId: threadInternalId as string,
    messageId: assistantMessageId,
    role: "assistant",
    content: "",
    model,
    status: "thinking",
    modelParams,
  })
  console.log("check4")
  const result = await streamText({
    model: openrouter.chat(model),
    messages,
  })
  console.log("check5")
  return new NextResponse(result.textStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    }
  })
}