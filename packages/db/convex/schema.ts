import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const MessageStatusValidator = v.union(
  v.literal("waiting"),
  v.literal("thinking"),
  v.literal("streaming"),
  v.literal("completed"),
  v.literal("error"),
)

export const ThreadStatusValidator = v.union(
  v.literal("pending"),
  v.literal("generating"),
  v.literal("completed"),
  v.literal("error"),
)

export default defineSchema({
  threads: defineTable({
    userId: v.string(),
    model: v.string(),
    title: v.string(),
    threadId: v.string(),
    status: ThreadStatusValidator,
    createdAt: v.number(),
    updatedAt: v.number(),
  })
  .index("byUserId", ["userId"])
  .index("byThreadId", ["threadId"]),

  users: defineTable({
    name: v.string(),
    clerkId: v.string(),
  }).index("byClerkId", ["clerkId"]),
  
  messages: defineTable({
    userId: v.string(),
    messageId: v.string(),
    threadId: v.string(),
    attachmentIds: v.array(v.string()),

    content: v.string(),
    model: v.string(),
    status: MessageStatusValidator,

    role: v.union(
      v.literal("user"),
      v.literal("assistant"),
      v.literal("system"),
    ),

    modelParams: v.optional(
      v.object({
        temperature: v.number(),
        topP: v.optional(v.number()),
        topK: v.optional(v.number()),
        reasoning: v.optional(
          v.union(
            v.literal("low"),
            v.literal("medium"),
            v.literal("high"),
          )
        )
      })
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
  .index("byThreadId", ["threadId"])
  .index("byUserId", ["userId"]),

  attachments: defineTable({
    userId: v.string(),
    messageId: v.string(),
    attachmentId: v.string(),
    attachmentUrl: v.string(),

    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    fileKey: v.string(),
  })
  .index("byUserId", ["userId"])
  .index("byMessageId", ["messageId"]),

  sharedChats: defineTable({
    shareId: v.string(),
    threadId: v.string(),
    ownerId: v.string(),
    title: v.string(),
    isPublic: v.boolean(),
    createdAt: v.number(),
    expiresAt: v.optional(v.number()),
  })
  .index("byShareId", ["shareId"])
  .index("byOwnerId", ["ownerId"])
  .index("byThreadId", ["threadId"]),
});