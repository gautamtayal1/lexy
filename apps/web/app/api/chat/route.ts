import { NextRequest, NextResponse } from "next/server";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText, experimental_generateImage as generateImage } from "ai";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@repo/db/convex/_generated/api";
import { createGroq } from "@ai-sdk/groq";
import { openai } from "@ai-sdk/openai";
import { createPartFromUri, createUserContent, GoogleGenAI, Modality } from "@google/genai";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export const runtime = "edge";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const groqModels = [
  "llama-3.3-70b-versatile",
  "deepseek-r1-distill-llama-70b",
]

const openrouterModels = [
  "openai/gpt-4.1-mini",
  "openai/o4-mini",
  "anthropic/claude-3-5-sonnet-20240620",
  "google/gemini-2.0-flash-exp:free",
  "google/gemini-2.5-pro-preview",
]

const apiKey = process.env.VERTEX_API_KEY;

// Configure DO Spaces client
const s3Client = new S3Client({
  endpoint: `https://${process.env.DO_SPACES_REGION}.digitaloceanspaces.com`,
  region: process.env.DO_SPACES_REGION,
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY!,
    secretAccessKey: process.env.DO_SPACES_SECRET!,
  },
});

export async function POST(request: NextRequest) {
  try {
    const { 
      userId,
      messages,
      threadId,
      model,
      modelParams,
      attachments,
      apiKeys,
    }: {
      userId: string;
      messages: any[];
      threadId: string;
      model: string;
      modelParams: any;
      attachments: any;
      apiKeys?: {
        openrouter?: string;
        openai?: string;
        gemini?: string;
      };
    } = await request.json();

    if (!messages || messages.length === 0) {
      return new Response("messages are required", { status: 400 });
    }

    await convex.mutation(api.threads.ensureThread, {
    userId,
    threadId,
    model,
    title: "New Chat",
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
      role: "assistant",
      content: "",
      model,
      status: "thinking",
      modelParams,
      messageId: assistantMessageId,
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

    if (model ==="gemini-2.0-flash-preview-image-generation") {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-preview-image-generation",
        contents: messages[messages.length - 1].content,
        config: {
          responseModalities: [Modality.TEXT, Modality.IMAGE]
        }
      });
      for (const part of response.candidates?.[0]?.content?.parts ?? []) {
        // Based on the part type, either show the text or save the image
        if (part.text) {
          console.log(part.text);
        } else if (part.inlineData) {
          const imageData = part.inlineData.data;
          if (imageData) {
            const buffer = Buffer.from(imageData, "base64");
            const fileName = `generated-images/${crypto.randomUUID()}.png`;
            
            try {
              const result = await s3Client.send(new PutObjectCommand({
                Bucket: process.env.DO_SPACES_BUCKET!,
                Key: fileName,
                Body: buffer,
                ContentType: 'image/png',
                ACL: 'public-read',
              }));
              
              const imageUrl = `https://${process.env.DO_SPACES_BUCKET}.${process.env.DO_SPACES_REGION}.digitaloceanspaces.com/${fileName}`;
              console.log('Image uploaded to DO Spaces:', imageUrl);
              console.log('result', result);
              console.log('fileName used as key:', fileName);
              
              await convex.mutation(api.attachments.addAttachment, {
                userId,
                messageId: assistantMessageId,
                attachmentUrl: imageUrl,
                fileName: 'generated-image.png',
                fileType: 'image/png',
                fileSize: buffer.length,
                fileKey: fileName,
                attachmentId: crypto.randomUUID(),
              });
              
            } catch (error) {
              console.error('Failed to upload image to DO Spaces:', error);
            }
          }
        }
      }
    }

    if (model === "gpt-image-1") {
      const { image } = await generateImage({
        model: openai.image('gpt-image-1'),
        prompt: messages[messages.length - 1].content,
      });
      const imageData = image.base64
      if (imageData) {
        const buffer = Buffer.from(imageData, "base64");
        const fileName = `generated-images/${crypto.randomUUID()}.png`;
        
        try {
          const result = await s3Client.send(new PutObjectCommand({
            Bucket: process.env.DO_SPACES_BUCKET!,
            Key: fileName,
            Body: buffer,
            ContentType: 'image/png',
            ACL: 'public-read',
          }));
          
          const imageUrl = `https://${process.env.DO_SPACES_BUCKET}.${process.env.DO_SPACES_REGION}.digitaloceanspaces.com/${fileName}`;
          console.log('Image uploaded to DO Spaces:', imageUrl);
          console.log('result', result);
          console.log('fileName used as key:', fileName);
          
          await convex.mutation(api.attachments.addAttachment, {
            userId,
            messageId: assistantMessageId,
            attachmentUrl: imageUrl,
            fileName: 'generated-image.png',
            fileType: 'image/png',
            fileSize: buffer.length,
            fileKey: fileName,
            attachmentId: crypto.randomUUID(),
          });
          
        } catch (error) {
          console.error('Failed to upload image to DO Spaces:', error);
        }
      }
    }

    // Create AI providers
    let aiProvider;
    if (groqModels.includes(model)) {
      // Use your Groq API key for Groq models
      if (!process.env.GROQ_API_KEY) {
        return new Response("Groq API key not configured on server.", { status: 500 });
      }
      const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
      aiProvider = groq(model);
    } else {
      // Use user's OpenRouter key or fallback to server key
      const openrouterApiKey = apiKeys?.openrouter || process.env.OPENROUTER_API_KEY;
      if (!openrouterApiKey) {
        return new Response("OpenRouter API key required. Please configure it in settings.", { status: 400 });
      }
      const openrouter = createOpenRouter({ apiKey: openrouterApiKey });
      aiProvider = openrouter(model);
    }

    const result = await streamText({
      model: aiProvider,
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
      async onFinish({ text, reasoning }) {
        console.log('text', text)
        console.log('reasoning', reasoning)
        await convex.mutation(api.messages.patchMessage, {
          messageId: assistantMessageId,
          content: text,
          status: "completed",
          modelResponse: reasoning,
        });
      },
    })

    return result.toDataStreamResponse({
      sendReasoning: true,
      sendSources: true,
    })

  } catch (error) {
    console.error('Chat API error:', error);
    return new Response("Internal server error", { status: 500 });
  }
}