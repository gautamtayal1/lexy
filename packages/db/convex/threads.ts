import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const ensureThread = mutation({
  args: {
    userId: v.string(),
    threadId: v.optional(v.string()),
    title: v.string(),
    model: v.string(),
    status: v.optional(v.union(v.literal("pending"), v.literal("generating"), v.literal("completed"), v.literal("error")))
  },
  handler: async(ctx, { userId, threadId, title, model, status }) => {
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
        status: status || "generating",
        threadId: threadId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      return _id;
    }
  },
})

export const updateThread = mutation({
  args: {
    userId: v.string(),
    threadId: v.string(),
    title: v.string(),
    status: v.optional(v.union(v.literal("pending"), v.literal("generating"), v.literal("completed"), v.literal("error")))
  },
  handler: async(ctx, { userId, threadId, title, status }) => {
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

export const getThreadDetails = query({
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

    return thread;
  },
})

export const deleteThread = mutation({
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

    if (!thread) {
      throw new Error("Thread not found");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("byThreadId", (q) => q.eq("threadId", threadId))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }


    await ctx.db.delete(thread._id);

    return true;
  },
})

