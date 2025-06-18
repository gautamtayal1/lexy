import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '~/convex/_generated/api';
import { generateText } from 'ai';
import { groq } from '@ai-sdk/groq';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL as string);

export async function POST(request: NextRequest) {
  try {
    const { threadId, userId, question } = await request.json();

    if (!threadId || !userId || !question) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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

    return NextResponse.json({ success: true, title: text });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update thread title" }, { status: 500 });
  }
}