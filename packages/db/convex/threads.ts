import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const ensureThread = mutation({
  args: {
    userId: v.string(),
    threadId: v.optional(v.string()),
    title: v.string(),
    model: v.string() 
  },
  handler: async(ctx, { userId, threadId, title, model }) => {
    if (threadId) {
      const thread = await ctx.db
        .query("threads")
        .withIndex("byUserId", (q) => q.eq("userId", userId))
        .filter((q) => q.eq(q.field("threadId"), threadId))
        .unique();

      if (thread) {
        return thread._id;
      }

      const _id = await ctx.db.insert("threads", {
        userId,
        title,
        model,
        status: "pending",
        threadId: threadId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      return _id;
    }
  },
})

export const updateTitle = mutation({
  args: {
    userId: v.string(),
    threadId: v.string(),
    title: v.string(),
  },
  handler: async(ctx, { userId, threadId, title }) => {
    const thread = await ctx.db
      .query("threads")
      .withIndex("byUserId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("threadId"), threadId))
      .unique();

    if (!thread) {
      throw new Error("Thread not found");
    }

    await ctx.db.patch(thread._id, {
      title,
      updatedAt: Date.now(),
    });

    return thread._id;
  },
})

export const getThread = query({
  args: {
    userId: v.string(),
  },
  handler: async(ctx, { userId }) => {
    const threads = await ctx.db
      .query("threads")
      .withIndex("byUserId", (q) => q.eq("userId", userId))   
      .collect();

    return threads;
  },
})

export const isThreadExists = query({
  args: {
    userId: v.string(),
    threadId: v.string(),
  },
  handler: async(ctx, { userId, threadId }) => {
    const thread = await ctx.db
      .query("threads")
      .withIndex("byUserId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("threadId"), threadId))
      .unique();

    return !!thread;
  },
})