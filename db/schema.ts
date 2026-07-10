import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  bigint,
} from "drizzle-orm/pg-core";

// ─── Users (both web auth + telegram users) ──────────────────────────
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("union_id", { length: 255 }).unique(),
  telegramId: bigint("telegram_id", { mode: "number" }).unique(),
  telegramUsername: varchar("telegram_username", { length: 255 }),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: varchar("role", { length: 20 }).default("user").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Providers ───────────────────────────────────────────────────────
export const providers = pgTable("providers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  displayName: varchar("display_name", { length: 255 }).notNull(),
  baseUrl: text("base_url").notNull(),
  description: text("description"),
  logoUrl: text("logo_url"),
  isBuiltin: boolean("is_builtin").default(false).notNull(),
  requiresApiKey: boolean("requires_api_key").default(true).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  config: jsonb("config"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Provider = typeof providers.$inferSelect;
export type InsertProvider = typeof providers.$inferInsert;

// ─── Models ──────────────────────────────────────────────────────────
export const models = pgTable("models", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").notNull(),
  modelName: varchar("model_name", { length: 255 }).notNull(),
  displayName: varchar("display_name", { length: 255 }).notNull(),
  description: text("description"),
  maxTokens: integer("max_tokens"),
  isActive: boolean("is_active").default(true).notNull(),
  isPopular: boolean("is_popular").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Model = typeof models.$inferSelect;
export type InsertModel = typeof models.$inferInsert;

// ─── User Providers ──────────────────────────────────────────────────
export const userProviders = pgTable("user_providers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  providerId: integer("provider_id").notNull(),
  apiKey: text("api_key").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type UserProvider = typeof userProviders.$inferSelect;
export type InsertUserProvider = typeof userProviders.$inferInsert;

// ─── Conversations ───────────────────────────────────────────────────
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  modelId: integer("model_id").notNull(),
  title: varchar("title", { length: 255 }).default("New Chat").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

// ─── Messages ────────────────────────────────────────────────────────
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  role: varchar("role", { length: 20 }).notNull(),
  content: text("content").notNull(),
  tokensUsed: integer("tokens_used"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
