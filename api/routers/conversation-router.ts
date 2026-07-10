import { z } from "zod";
import { createRouter, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { conversations, messages, models, providers } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const conversationRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select({
      id: conversations.id,
      title: conversations.title,
      isActive: conversations.isActive,
      createdAt: conversations.createdAt,
      updatedAt: conversations.updatedAt,
      modelId: models.id,
      modelName: models.displayName,
      providerName: providers.displayName,
    }).from(conversations)
      .innerJoin(models, eq(conversations.modelId, models.id))
      .innerJoin(providers, eq(models.providerId, providers.id))
      .where(eq(conversations.userId, ctx.user.id))
      .orderBy(desc(conversations.updatedAt));
  }),

  get: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const conv = await db.select().from(conversations).where(eq(conversations.id, input.id)).limit(1);
      if (!conv[0] || conv[0].userId !== ctx.user.id) return null;
      const msgs = await db.select().from(messages).where(eq(messages.conversationId, input.id)).orderBy(messages.createdAt);
      return { ...conv[0], messages: msgs };
    }),

  create: authedQuery
    .input(z.object({ modelId: z.number(), title: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const result = await db.insert(conversations).values({
        userId: ctx.user.id,
        modelId: input.modelId,
        title: input.title ?? "New Chat",
      }).returning();
      return result[0];
    }),

  updateTitle: authedQuery
    .input(z.object({ id: z.number(), title: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.update(conversations).set({ title: input.title })
        .where(eq(conversations.id, input.id)).returning();
      return result[0];
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(messages).where(eq(messages.conversationId, input.id));
      await db.delete(conversations).where(eq(conversations.id, input.id));
      return { success: true };
    }),
});
