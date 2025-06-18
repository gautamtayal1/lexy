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

export const getAttachmentsByUserId = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("attachments")
      .withIndex("byUserId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const deleteAttachment = mutation({
  args: {
    userId: v.string(),
    attachmentId: v.string(),
  },
  handler: async (ctx, { userId, attachmentId }) => {
    const attachment = await ctx.db
      .query("attachments")
      .withIndex("byUserId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("attachmentId"), attachmentId))
      .unique();

    if (!attachment) {
      throw new Error("Attachment not found or you don't have permission to delete it");
    }

    await ctx.db.delete(attachment._id);
    return true;
  },
});