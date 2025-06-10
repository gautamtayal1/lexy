import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";
import { Id } from "./_generated/dataModel";

export const send = mutation({
  args: { body: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    await ctx.db.insert("messages", { body: args.body, userId: user._id });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const messages = await ctx.db.query("messages").collect();
    return Promise.all(
      messages.map(async (message) => {
          
        const user = await ctx.db.get(message.userId as Id<"users">);
        return {
          author: user?.name ?? "Anonymous",
          ...message,
        };
      }),
    );
  },
});