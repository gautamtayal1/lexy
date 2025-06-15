import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addAttachment = mutation({
  args: {
    userId: v.string(),
    messageId: v.string(),
    attachmentId: v.string(),
    attachmentUrl: v.string(),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    fileKey: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("attachments", {
      userId: args.userId,
      attachmentId: args.attachmentId,
      messageId: args.messageId,
      attachmentUrl: args.attachmentUrl,    
      fileName: args.fileName,
      fileType: args.fileType,
      fileSize: args.fileSize,
      fileKey: args.fileKey,
    });
  },
});

export const getAttachmentsByMessageId = query({
  args: {
    messageId: v.string(),
  },
  handler: async (ctx, { messageId }) => {
    return await ctx.db
      .query("attachments")
      .withIndex("byMessageId", (q) => q.eq("messageId", messageId))
      .collect();
  },
});