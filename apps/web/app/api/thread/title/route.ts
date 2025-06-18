import { NextRequest } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@repo/db/convex/_generated/api';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { groq } from '@ai-sdk/groq';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const { threadId, userId, question } = await request.json();

    if (!threadId || !userId || !question) {
      return new Response("Missing required fields", { status: 400 });
    }

    const { text } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      prompt: `Generate a concise title for this question. Return only the title text, no quotes or additional formatting. The title should be 3-5 words maximum. If the question is unclear or cannot be summarized, return exactly "New Chat".

      Question: ${question}`,
    });

    await convex.mutation(api.threads.updateThread, {
      userId,
      threadId,
      title: text,
    });

    return Response.json({ success: true, title: text });
  } catch (error) {
    console.error('Failed to update thread title:', error);
    return new Response("Failed to update thread title", { status: 500 });
  }
}