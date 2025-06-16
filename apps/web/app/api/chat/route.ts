import { NextRequest, NextResponse } from "next/server";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText, experimental_generateImage as generateImage } from "ai";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@repo/db/convex/_generated/api";
import { createGroq } from "@ai-sdk/groq";
import { openai, createOpenAI } from "@ai-sdk/openai";
import {  GoogleGenAI, Modality } from "@google/genai";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { LEXY_SYSTEM_PROMPT, THEO_MODE_SYSTEM_PROMPT } from "~/app/lib/prompts/system-prompts";

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
      isTheoMode,
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
      isTheoMode: boolean;
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
      // Handle both single attachment and array of attachments
      const attachmentArray = Array.isArray(attachments) ? attachments : [attachments];
      
      for (const attachment of attachmentArray) {
        await convex.mutation(api.attachments.addAttachment, {
          userId,
          messageId: userMessageId, // Fix: Attach to user message, not assistant message
          attachmentUrl: attachment.url,
          fileName: attachment.name,
          fileType: attachment.type,
          fileSize: attachment.size,
          fileKey: attachment.key,
          attachmentId: crypto.randomUUID(),
        });
      }
    }

    if (model ==="gemini-2.0-flash-preview-image-generation") {
      if (!apiKeys?.gemini) {
        return new Response(JSON.stringify({ 
          error: "API_KEY_REQUIRED",
          message: "Gemini API key required for this model. Please configure it in settings." 
        }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      try {
        const ai = new GoogleGenAI({ apiKey: apiKeys.gemini });
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
      } catch (error) {
        console.error('Gemini API error:', error);
        return new Response(JSON.stringify({
          error: "INVALID_API_KEY",
          message: "Invalid Gemini API key. Please check your API key configuration in settings."
        }), { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    if (model === "gpt-image-1") {
      if (!apiKeys?.openai) {
        return new Response(JSON.stringify({ 
          error: "API_KEY_REQUIRED",
          message: "OpenAI API key required for this model. Please configure it in settings." 
        }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      try {
        const openaiProvider = createOpenAI({ apiKey: apiKeys.openai });
        const { image } = await generateImage({
          model: openaiProvider.image('gpt-image-1'),
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
      } catch (error) {
        console.error('OpenAI API error:', error);
        return new Response(JSON.stringify({
          error: "INVALID_API_KEY",
          message: "Invalid OpenAI API key. Please check your API key configuration in settings."
        }), { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
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
    } else if (model === "gpt-image-1") {
      // For OpenAI direct models, use user's OpenAI key
      if (!apiKeys?.openai) {
        return new Response(JSON.stringify({ 
          error: "API_KEY_REQUIRED",
          message: "OpenAI API key required for this model. Please configure it in settings." 
        }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      const openaiProvider = createOpenAI({ apiKey: apiKeys.openai });
      aiProvider = openaiProvider(model);
    } else if (model === "gemini-2.0-flash-preview-image-generation") {
      // For Gemini models, check for API key
      if (!apiKeys?.gemini) {
        return new Response(JSON.stringify({ 
          error: "API_KEY_REQUIRED",
          message: "Gemini API key required for this model. Please configure it in settings." 
        }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      // Gemini models are handled separately above, this is just for consistency
      return new Response(JSON.stringify({ success: true }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      // Use user's OpenRouter key or fallback to server key
      const openrouterApiKey = apiKeys?.openrouter || process.env.OPENROUTER_API_KEY;
      if (!openrouterApiKey) {
        return new Response(JSON.stringify({ 
          error: "API_KEY_REQUIRED",
          message: "OpenRouter API key required. Please configure it in settings." 
        }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      const openrouter = createOpenRouter({ apiKey: openrouterApiKey });
      aiProvider = openrouter(model);
    }

    // Skip streamText for image generation models  
    if (model === "gpt-image-1") {
      return new Response(JSON.stringify({ success: true }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = await streamText({
      model: aiProvider,
      system: isTheoMode ? THEO_MODE_SYSTEM_PROMPT : LEXY_SYSTEM_PROMPT,
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
                ...(attachments.map((attachment: any) => ({
                  type: "image",
                  image: attachment.url,
                  mimeType: attachment.type,
                }))),
              ],
            },
          ]
        : messages,
      topK: modelParams.topK,
      temperature: modelParams.temperature,
      // async onChunk({chunk}) {
      //   await convex.mutation(api.messages.patchMessage, {
      //     messageId: assistantMessageId,
      //     content: chunk.type === "text-delta" ? chunk.textDelta : chunk.text,
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
    
    // Check for API key related errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes('401') || 
        errorMessage.includes('unauthorized') || 
        errorMessage.includes('invalid api key') ||
        errorMessage.includes('authentication') ||
        errorMessage.toLowerCase().includes('api key')) {
      return new Response(JSON.stringify({
        error: "INVALID_API_KEY",
        message: "Invalid API key. Please check your API key configuration in settings."
      }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      error: "INTERNAL_ERROR",
      message: "Internal server error"
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}