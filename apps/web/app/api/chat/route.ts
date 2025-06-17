import { NextRequest, NextResponse } from "next/server";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText, experimental_generateImage as generateImage } from "ai";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@repo/db/convex/_generated/api";
import { createGroq } from "@ai-sdk/groq";
import { createOpenAI } from "@ai-sdk/openai";
import { GoogleGenAI, Modality } from "@google/genai";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { LEXY_SYSTEM_PROMPT, THEO_MODE_SYSTEM_PROMPT } from "~/app/lib/prompts/system-prompts";

const openAIProviders = new Map<string, ReturnType<typeof createOpenAI>>();
function getOpenAIProvider(apiKey: string) {
  let provider = openAIProviders.get(apiKey);
  if (!provider) {
    provider = createOpenAI({ apiKey });
    openAIProviders.set(apiKey, provider);
  }
  return provider;
}

const openRouterProviders = new Map<string, ReturnType<typeof createOpenRouter>>();
function getOpenRouterProvider(apiKey: string) {
  let provider = openRouterProviders.get(apiKey);
  if (!provider) {
    provider = createOpenRouter({ apiKey });
    openRouterProviders.set(apiKey, provider);
  }
  return provider;
}

const groqProviderSingleton = process.env.GROQ_API_KEY
  ? createGroq({ apiKey: process.env.GROQ_API_KEY })
  : null;

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
export const runtime = "edge";

const groqModels = [
  "llama-3.3-70b-versatile",
]

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

    const userMessageId = crypto.randomUUID();
    const assistantMessageId = crypto.randomUUID();

    const last = messages[messages.length - 1]!;

    const attachmentArray = attachments
      ? Array.isArray(attachments)
        ? attachments
        : [attachments]
      : [];

    const attachmentsForDb = attachmentArray.map((att: any) => ({
      attachmentId: crypto.randomUUID(),
      attachmentUrl: att.url,
      fileName: att.name,
      fileType: att.type,
      fileSize: att.size,
      fileKey: att.key,
    }));

    await convex.mutation(api.chat.createChatBatch, {
      userId,
      threadId,
      title: "New Chat",
      model,
      userMessage: {
        messageId: userMessageId,
        content: last.content as string,
        modelParams,
      },
      assistantMessage: {
        messageId: assistantMessageId,
        modelParams,
      },
      attachments: attachmentsForDb,
    });

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
        const openaiProvider = getOpenAIProvider(apiKeys.openai);
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

    let aiProvider;
    if (groqModels.includes(model)) {
      if (!groqProviderSingleton) {
        return new Response("Groq API key not configured on server.", { status: 500 });
      }
      aiProvider = groqProviderSingleton(model);
    } else if (model === "gpt-image-1") {
      if (!apiKeys?.openai) {
        return new Response(JSON.stringify({ 
          error: "API_KEY_REQUIRED",
          message: "OpenAI API key required for this model. Please configure it in settings." 
        }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      const openaiProvider = getOpenAIProvider(apiKeys.openai);
      aiProvider = openaiProvider(model);
    } else if (model === "gemini-2.0-flash-preview-image-generation") {
      if (!apiKeys?.gemini) {
        return new Response(JSON.stringify({ 
          error: "API_KEY_REQUIRED",
          message: "Gemini API key required for this model. Please configure it in settings." 
        }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify({ success: true }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
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
      const openrouter = getOpenRouterProvider(openrouterApiKey);
      aiProvider = openrouter(model);
    }

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
      onFinish: async ({text}) => {
        await convex.mutation(api.messages.patchMessage, {
          messageId: assistantMessageId,
          content: text,
          status: "completed",
        });
      }
    }
    );
    return result.toDataStreamResponse({
      sendReasoning: true,
      sendSources: true,
    })

  } catch (error) {
    console.error('Chat API error:', error);
    
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