import { NextRequest } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@repo/db/convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const { threadId, userId, question } = await request.json();

    if (!threadId || !userId || !question) {
      return new Response("Missing required fields", { status: 400 });
    }

    // Generate a title from the first question (simple truncation)
    const title = question.length > 50 
      ? question.substring(0, 47) + "..." 
      : question;

    await convex.mutation(api.threads.updateThread, {
      userId,
      threadId,
      title,
    });

    return Response.json({ success: true, title });
  } catch (error) {
    console.error('Failed to update thread title:', error);
    return new Response("Failed to update thread title", { status: 500 });
  }
}