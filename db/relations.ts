import { relations } from "drizzle-orm";
import { users, providers, models, userProviders, conversations, messages } from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  userProviders: many(userProviders),
  conversations: many(conversations),
}));

export const providersRelations = relations(providers, ({ many }) => ({
  models: many(models),
  userProviders: many(userProviders),
}));

export const modelsRelations = relations(models, ({ one, many }) => ({
  provider: one(providers, {
    fields: [models.providerId],
    references: [providers.id],
  }),
  conversations: many(conversations),
}));

export const userProvidersRelations = relations(userProviders, ({ one }) => ({
  user: one(users, {
    fields: [userProviders.userId],
    references: [users.id],
  }),
  provider: one(providers, {
    fields: [userProviders.providerId],
    references: [providers.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  user: one(users, {
    fields: [conversations.userId],
    references: [users.id],
  }),
  model: one(models, {
    fields: [conversations.modelId],
    references: [models.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));
