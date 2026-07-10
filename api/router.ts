import { authRouter } from "./auth-router";
import { createRouter, publicQuery } from "./middleware";
import { providerRouter } from "./routers/provider-router";
import { modelRouter } from "./routers/model-router";
import { conversationRouter } from "./routers/conversation-router";
import { messageRouter } from "./routers/message-router";
import { botRouter } from "./routers/bot-router";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  provider: providerRouter,
  model: modelRouter,
  conversation: conversationRouter,
  message: messageRouter,
  bot: botRouter,
});

export type AppRouter = typeof appRouter;
