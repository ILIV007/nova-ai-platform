import { z } from "zod";
import { createRouter, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { messages, conversations } from "@db/schema";
import { eq } from "drizzle-orm";

export const messageRouter = createRouter({
  send: authedQuery
    .input(z.object({ conversationId: z.number(), content: z.string().min(1).max(100000) }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const conv = await db.select().from(conversations).where(eq(conversations.id, input.conversationId)).limit(1);
      if (!conv[0] || conv[0].userId !== ctx.user.id) throw new Error("Conversation not found");
      const userMsg = await db.insert(messages).values({
        conversationId: input.conversationId,
        role: "user",
        content: input.content,
      }).returning();
      return { message: userMsg[0], conversation: conv[0] };
    }),

  saveAssistant: authedQuery
    .input(z.object({
      conversationId: z.number(),
      content: z.string().min(1),
      tokensUsed: z.number().optional(),
      metadata: z.record(z.string(), z.any()).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(messages).values({
        conversationId: input.conversationId,
        role: "assistant",
        content: input.content,
        tokensUsed: input.tokensUsed,
        metadata: input.metadata ?? {},
      }).returning();
      return result[0];
    }),

  list: authedQuery
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conv = await db.select().from(conversations).where(eq(conversations.id, input.conversationId)).limit(1);
      if (!conv[0] || conv[0].userId !== ctx.user.id) return [];
      return db.select().from(messages).where(eq(messages.conversationId, input.conversationId))
        .orderBy(messages.createdAt);
    }),
});
