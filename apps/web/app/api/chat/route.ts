import { NextRequest, NextResponse } from "next/server";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@repo/db/convex/_generated/api";
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
      attachments,
    }: {
      userId: string;
      messages: any[];
      threadId: string;
      model: string;
      modelParams: any;
      attachments: any;
    } = await request.json();

    if (!messages || messages.length === 0) {
      return new Response("messages are required", { status: 400 });
    }

      await convex.mutation(api.threads.ensureThread, {
      userId,
      threadId,
      model,
      title: "sample thread",
    });
    
    const userMessageId = crypto.randomUUID();
    const last = messages[messages.length - 1]!
    await convex.mutation(api.messages.addMessage, {
      userId,
      threadId,
      role: "user",
      content: last.content as string,
      model,
      status: "completed",
      modelParams,
      messageId: userMessageId,
      // attachments: fileUrl ? [fileUrl] : undefined,
    })

    const assistantMessageId = crypto.randomUUID();
    await convex.mutation(api.messages.addMessage, {
      userId,
      threadId,
      messageId: assistantMessageId,
      role: "assistant",
      // Will be patched with the full text when the stream finishes.
      content: "",
      model,
      status: "thinking",
      modelParams,
    })
    
    if (attachments) {
      await convex.mutation(api.attachments.addAttachment, {
        userId,
        messageId: assistantMessageId,
        attachmentUrl: attachments.serverData.fileUrl,
        fileName: attachments.name,
        fileType: attachments.type,
        fileSize: attachments.size,
        fileKey: attachments.key,
        attachmentId: crypto.randomUUID(),
      });
    }
    // const URLObject = new URL(attachments.serverData.fileUrl)
    const result = await streamText({
      model: groq("llama-3.1-8b-instant"),
      system: "you are a helpful assistant",
      messages: attachments
        ? [
            ...messages.slice(0, -1),
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: messages[messages.length - 1].content,
                },
                {
                  type: "image",
                  image: attachments.serverData.fileUrl,
                  mimeType: attachments.type,
                },
              ],
            },
          ]
        : messages,
      
      // async onChunk({chunk}) {
      //   await convex.mutation(api.messages.patchMessage, {
      //     messageId: assistantMessageId,
      //     content: chunk.textDelta,
      //     status: "completed",
      //   });
      // },
      async onFinish({ text }) {
        console.log('text', text)
        await convex.mutation(api.messages.patchMessage, {
          messageId: assistantMessageId,
          content: text,
          status: "completed",
        });
      },
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