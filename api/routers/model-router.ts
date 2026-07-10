import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { models, providers } from "@db/schema";
import { eq, and } from "drizzle-orm";

export const modelRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select({
      id: models.id,
      modelName: models.modelName,
      displayName: models.displayName,
      description: models.description,
      maxTokens: models.maxTokens,
      isPopular: models.isPopular,
      createdAt: models.createdAt,
      providerId: providers.id,
      providerName: providers.name,
      providerDisplayName: providers.displayName,
    }).from(models).innerJoin(providers, eq(models.providerId, providers.id))
      .where(eq(models.isActive, true));
  }),

  byProvider: publicQuery
    .input(z.object({ providerId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.select().from(models)
        .where(and(eq(models.providerId, input.providerId), eq(models.isActive, true)));
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(models).where(eq(models.id, input.id)).limit(1);
      return result[0] ?? null;
    }),

  create: authedQuery
    .input(z.object({
      providerId: z.number(),
      modelName: z.string().min(1),
      displayName: z.string().min(1),
      description: z.string().optional(),
      maxTokens: z.number().optional(),
      isPopular: z.boolean().default(false),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(models).values({
        providerId: input.providerId,
        modelName: input.modelName,
        displayName: input.displayName,
        description: input.description,
        maxTokens: input.maxTokens,
        isPopular: input.isPopular,
      }).returning();
      return result[0];
    }),

  popular: publicQuery.query(async () => {
    const db = getDb();
    return db.select({
      id: models.id,
      modelName: models.modelName,
      displayName: models.displayName,
      description: models.description,
      isPopular: models.isPopular,
      providerId: providers.id,
      providerName: providers.name,
      providerDisplayName: providers.displayName,
    }).from(models).innerJoin(providers, eq(models.providerId, providers.id))
      .where(eq(models.isPopular, true));
  }),
});
