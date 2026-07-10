import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { providers, userProviders } from "@db/schema";
import { eq, and } from "drizzle-orm";

export const providerRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(providers).where(eq(providers.isActive, true));
  }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(providers).where(eq(providers.id, input.id)).limit(1);
      return result[0] ?? null;
    }),

  create: authedQuery
    .input(
      z.object({
        name: z.string().min(1).max(100),
        displayName: z.string().min(1).max(255),
        baseUrl: z.string().url(),
        description: z.string().optional(),
        requiresApiKey: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(providers).values({
        name: input.name,
        displayName: input.displayName,
        baseUrl: input.baseUrl,
        description: input.description,
        isBuiltin: false,
        requiresApiKey: input.requiresApiKey,
      }).returning();
      return result[0];
    }),

  saveApiKey: authedQuery
    .input(z.object({ providerId: z.number(), apiKey: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const existing = await db.select().from(userProviders)
        .where(and(eq(userProviders.userId, ctx.user.id), eq(userProviders.providerId, input.providerId)))
        .limit(1);

      if (existing[0]) {
        const result = await db.update(userProviders)
          .set({ apiKey: input.apiKey })
          .where(eq(userProviders.id, existing[0].id))
          .returning();
        return result[0];
      }

      const result = await db.insert(userProviders).values({
        userId: ctx.user.id,
        providerId: input.providerId,
        apiKey: input.apiKey,
      }).returning();
      return result[0];
    }),

  getMyProviders: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select({
      id: userProviders.id,
      providerId: providers.id,
      providerName: providers.name,
      providerDisplayName: providers.displayName,
      isActive: userProviders.isActive,
      createdAt: userProviders.createdAt,
    }).from(userProviders)
      .innerJoin(providers, eq(userProviders.providerId, providers.id))
      .where(eq(userProviders.userId, ctx.user.id));
  }),

  toggle: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const existing = await db.select().from(userProviders)
        .where(and(eq(userProviders.id, input.id), eq(userProviders.userId, ctx.user.id)))
        .limit(1);
      if (!existing[0]) throw new Error("Provider not found");
      const result = await db.update(userProviders)
        .set({ isActive: !existing[0].isActive })
        .where(eq(userProviders.id, input.id))
        .returning();
      return result[0];
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.delete(userProviders)
        .where(and(eq(userProviders.id, input.id), eq(userProviders.userId, ctx.user.id)));
      return { success: true };
    }),
});
