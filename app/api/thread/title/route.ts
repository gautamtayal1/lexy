import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '~/convex/_generated/api';
import { generateText } from 'ai';
import { createGroq } from '@ai-sdk/groq';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL as string);

// Create Groq provider if API key is available
const groqProvider = process.env.GROQ_API_KEY 
  ? createGroq({ apiKey: process.env.GROQ_API_KEY })
  : null;

export async function POST(request: NextRequest) {
  try {
    const { threadId, userId, question } = await request.json();

    if (!threadId || !userId || !question) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if Groq API key is configured (though user confirmed it's working)
    if (!groqProvider) {
      console.error("GROQ_API_KEY not configured");
      return NextResponse.json({ 
        error: "GROQ_API_KEY not configured on server", 
        details: "The server is missing the required GROQ_API_KEY environment variable" 
      }, { status: 500 });
    }

    // Validate Convex URL
    if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
      console.error("NEXT_PUBLIC_CONVEX_URL not configured");
      return NextResponse.json({ 
        error: "Convex not configured", 
        details: "Missing NEXT_PUBLIC_CONVEX_URL environment variable" 
      }, { status: 500 });
    }

    const { text } = await generateText({
      model: groqProvider("llama-3.1-8b-instant"),
      prompt: `Generate a concise title for this question. Return only the title text, no quotes or additional formatting. The title should be 3-5 words maximum. If the question is unclear or cannot be summarized, return exactly "New Chat".

      Question: ${question}`,
    });

    // Additional validation for the generated text
    if (!text || text.trim().length === 0) {
      console.warn("Generated text is empty, using fallback title");
      const fallbackTitle = "New Chat";
      
      try {
        await convex.mutation(api.threads.updateThread, {
          userId,
          threadId,
          title: fallbackTitle,
        });
        return NextResponse.json({ success: true, title: fallbackTitle });
      } catch (convexError) {
        console.error("Convex mutation failed (fallback):", convexError);
        return NextResponse.json({ 
          error: "Failed to update thread with fallback title", 
          details: convexError instanceof Error ? convexError.message : String(convexError) 
        }, { status: 500 });
      }
    }

    // Try to update the thread with the generated title
    try {
      await convex.mutation(api.threads.updateThread, {
        userId,
        threadId,
        title: text.trim(),
      });
      return NextResponse.json({ success: true, title: text.trim() });
    } catch (convexError) {
      console.error("Convex mutation failed:", convexError);
      console.error("Failed parameters:", { userId, threadId, title: text.trim() });
      
      // Check if it's a "Thread not found" error
      if (convexError instanceof Error && convexError.message.includes("Thread not found")) {
        return NextResponse.json({ 
          error: "Thread not found", 
          details: `Thread with ID ${threadId} not found for user ${userId}` 
        }, { status: 404 });
      }
      
      return NextResponse.json({ 
        error: "Failed to update thread title in database", 
        details: convexError instanceof Error ? convexError.message : String(convexError) 
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Error updating thread title:", error);
    return NextResponse.json({ 
      error: "Failed to update thread title", 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}