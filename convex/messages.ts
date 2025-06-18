import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { MessageStatusValidator } from "./schema";

export const addMessage = mutation({
  args: {
    userId: v.string(),
    threadId: v.string(),
    messageId: v.string(),
    role: v.union(
      v.literal("user"),
      v.literal("assistant"),
      v.literal("system")
    ),
    content: v.string(),
    model: v.string(),
    status: MessageStatusValidator,
    modelParams: v.optional(
      v.object({
        temperature: v.number(),
        topP: v.optional(v.number()),
        topK: v.optional(v.number()),
        reasoning: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
      })
    ),
  },
  handler: async(ctx, args) => {
    await ctx.db.insert("messages", {
      ...args,
      messageId: args.messageId,
      attachmentIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
  }
})

export const patchMessage = mutation({
  args: {
    messageId: v.string(),
    content: v.optional(v.string()),
    status: v.optional(MessageStatusValidator),
    modelResponse: v.optional(v.string()),
  },
  handler: async (ctx, { messageId, content, status, modelResponse }) => {
    const msg = await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("messageId"), messageId))
      .unique();
    if (!msg) throw new Error("message not found");

    await ctx.db.patch(msg._id, {
      content,
      status,
      modelResponse,
      updatedAt: Date.now(),
    });
  },
});

export const listMessages = query({
  args: {
    threadId: v.string(),
  },
  handler: async (ctx, { threadId }) => {
    return await ctx.db
      .query("messages")
      .withIndex("byThreadId", (q) => q.eq("threadId", threadId))
      .collect();
  }
})