import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { users, providers, userProviders, models, conversations, messages } from "@db/schema";
import { eq, and } from "drizzle-orm";
import { sendMessage, sendChatAction, answerCallbackQuery, setWebhook, deleteWebhook, createReplyKeyboard } from "../lib/telegram";
import { generateAIResponse } from "../lib/ai-service";

const activeChats = new Map<number, { modelId: number; conversationId: number }>();
const awaitingInput = new Map<number, { action: string; data?: any }>();

export const botRouter = createRouter({
  webhook: publicQuery
    .input(z.any())
    .mutation(async ({ input }) => {
      const update = input as any;
      if (update.callback_query) {
        await handleCallback(update.callback_query);
        return { ok: true };
      }
      if (update.message) {
        await handleMessage(update.message);
        return { ok: true };
      }
      return { ok: true };
    }),

  setWebhook: publicQuery
    .input(z.object({ url: z.string().url() }))
    .mutation(async ({ input }) => {
      return setWebhook(input.url);
    }),

  deleteWebhook: publicQuery.mutation(async () => {
    return deleteWebhook();
  }),
});

async function handleMessage(msg: any) {
  const chatId = msg.chat?.id;
  const text = msg.text ?? "";
  const userId = msg.from?.id;
  const username = msg.from?.username;
  const firstName = msg.from?.first_name;

  if (!chatId || !userId) return;
  await ensureUser(userId, username, firstName);

  if (text.startsWith("/")) {
    await handleCommand(chatId, userId, text);
    return;
  }

  const awaiting = awaitingInput.get(userId);
  if (awaiting) {
    awaitingInput.delete(userId);
    await handleAwaitingInput(chatId, userId, text, awaiting);
    return;
  }

  const activeChat = activeChats.get(userId);
  if (activeChat) {
    await handleChatMessage(chatId, userId, text, activeChat);
    return;
  }

  await sendMainMenu(chatId);
}

async function handleCommand(chatId: number, userId: number, text: string) {
  const command = text.split(" ")[0].toLowerCase();
  switch (command) {
    case "/start":
      await sendWelcome(chatId, userId);
      break;
    case "/menu":
    case "/dashboard":
      await sendMainMenu(chatId);
      break;
    case "/providers":
      await showMyProviders(chatId, userId);
      break;
    case "/models":
      await showPopularModels(chatId, userId);
      break;
    case "/newchat":
      await startNewChat(chatId, userId);
      break;
    case "/history":
      await showChatHistory(chatId, userId);
      break;
    case "/addprovider":
      await promptAddProvider(chatId, userId);
      break;
    case "/reset":
      activeChats.delete(userId);
      awaitingInput.delete(userId);
      await sendMessage(chatId, "Session reset! Use /menu to see options.");
      break;
    default:
      await sendMessage(chatId, "Unknown command. Use /menu to see available options.");
  }
}

async function sendWelcome(chatId: number, _userId: number) {
  const welcome = `Welcome to NOVA!\n\nYour universal AI gateway.\n\nQuick Start:\n1. Add a provider API key\n2. Pick a model\n3. Start chatting!\n\nUse the buttons below to navigate:`;
  const keyboard = createReplyKeyboard([
    ["Dashboard", "Add Provider"],
    ["My Models", "New Chat"],
    ["History", "Settings"],
  ]);
  await sendMessage(chatId, welcome, { keyboard });
}

async function sendMainMenu(chatId: number) {
  const menu = `NOVA Dashboard\n\nWhat would you like to do?`;
  const keyboard = createReplyKeyboard([
    ["Dashboard", "Add Provider"],
    ["My Models", "New Chat"],
    ["History", "Settings"],
  ]);
  await sendMessage(chatId, menu, { keyboard });
}

async function promptAddProvider(chatId: number, userId: number) {
  const db = getDb();
  const allProviders = await db.select().from(providers).where(eq(providers.isActive, true));
  let text = `Add Provider\n\nChoose a provider:`;
  const buttons: any[] = [];
  for (const p of allProviders) {
    const hasKey = await db.select().from(userProviders)
      .where(and(eq(userProviders.userId, userId), eq(userProviders.providerId, p.id))).limit(1);
    const status = hasKey[0] ? "OK" : "X";
    buttons.push([{ text: `${status} ${p.displayName}`, callback_data: `add_provider_${p.id}` }]);
  }
  buttons.push([{ text: "Custom Provider", callback_data: "add_custom_provider" }]);
  buttons.push([{ text: "Back", callback_data: "back_menu" }]);
  await sendMessage(chatId, text, { inlineKeyboard: buttons });
}

async function showMyProviders(chatId: number, userId: number) {
  const db = getDb();
  const myProviders = await db.select({
    id: userProviders.id,
    providerName: providers.name,
    providerDisplayName: providers.displayName,
    isActive: userProviders.isActive,
  }).from(userProviders).innerJoin(providers, eq(userProviders.providerId, providers.id))
    .where(eq(userProviders.userId, userId));

  if (myProviders.length === 0) {
    await sendMessage(chatId, "No providers configured. Use Add Provider to get started!");
    return;
  }

  let text = `My Providers:\n\n`;
  const buttons: any[] = [];
  for (const p of myProviders) {
    const status = p.isActive ? "Active" : "Inactive";
    text += `${status}: ${p.providerDisplayName}\n`;
    buttons.push([{ text: `${p.providerDisplayName}`, callback_data: `provider_${p.id}` }]);
  }
  buttons.push([{ text: "Back", callback_data: "back_menu" }]);
  await sendMessage(chatId, text, { inlineKeyboard: buttons });
}

async function showPopularModels(chatId: number, _userId: number) {
  const db = getDb();
  const popularModels = await db.select({
    id: models.id,
    displayName: models.displayName,
    description: models.description,
    providerDisplayName: providers.displayName,
  }).from(models).innerJoin(providers, eq(models.providerId, providers.id))
    .where(eq(models.isPopular, true));

  let text = `Popular Models:\n\nTap to chat:`;
  const buttons: any[] = [];
  for (const m of popularModels) {
    buttons.push([{ text: `${m.displayName} (${m.providerDisplayName})`, callback_data: `select_model_${m.id}` }]);
  }
  buttons.push([{ text: "All Models", callback_data: "all_models" }]);
  buttons.push([{ text: "Back", callback_data: "back_menu" }]);
  await sendMessage(chatId, text, { inlineKeyboard: buttons });
}

async function showAllModels(chatId: number, _userId: number) {
  const db = getDb();
  const allModels = await db.select({
    id: models.id,
    displayName: models.displayName,
    description: models.description,
    providerDisplayName: providers.displayName,
  }).from(models).innerJoin(providers, eq(models.providerId, providers.id))
    .where(eq(models.isActive, true));

  let text = `All Models:\n\nTap to chat:`;
  const buttons: any[] = [];
  for (const m of allModels) {
    buttons.push([{ text: `${m.displayName} (${m.providerDisplayName})`, callback_data: `select_model_${m.id}` }]);
  }
  buttons.push([{ text: "Back", callback_data: "back_models" }]);
  await sendMessage(chatId, text, { inlineKeyboard: buttons });
}

async function startNewChat(chatId: number, userId: number) {
  awaitingInput.set(userId, { action: "awaiting_first_message" });
  await showPopularModels(chatId, userId);
}

async function handleChatMessage(chatId: number, userId: number, text: string, activeChat: { modelId: number; conversationId: number }) {
  const db = getDb();
  await db.insert(messages).values({
    conversationId: activeChat.conversationId,
    role: "user",
    content: text,
  });
  await sendChatAction(chatId, "typing");

  const history = await db.select().from(messages)
    .where(eq(messages.conversationId, activeChat.conversationId))
    .orderBy(messages.createdAt);

  const modelInfo = await db.select({
    id: models.id,
    modelName: models.modelName,
    providerName: providers.name,
    baseUrl: providers.baseUrl,
  }).from(models).innerJoin(providers, eq(models.providerId, providers.id))
    .where(eq(models.id, activeChat.modelId)).limit(1);

  if (!modelInfo[0]) {
    await sendMessage(chatId, "Model not found. Start a new chat.");
    return;
  }

  const userProv = await db.select().from(userProviders)
    .innerJoin(providers, eq(userProviders.providerId, providers.id))
    .where(and(eq(userProviders.userId, userId), eq(providers.name, modelInfo[0].providerName)))
    .limit(1);

  if (!userProv[0]) {
    await sendMessage(chatId, `Add API key for ${modelInfo[0].providerName} first. Use Add Provider.`);
    activeChats.delete(userId);
    return;
  }

  try {
    const aiResponse = await generateAIResponse({
      provider: modelInfo[0].providerName,
      baseUrl: modelInfo[0].baseUrl,
      apiKey: userProv[0].user_providers.apiKey,
      model: modelInfo[0].modelName,
      messages: history.map((m) => ({ role: m.role, content: m.content })),
    });

    await db.insert(messages).values({
      conversationId: activeChat.conversationId,
      role: "assistant",
      content: aiResponse.content,
      tokensUsed: aiResponse.tokensUsed,
      metadata: aiResponse.metadata,
    });

    await sendMessage(chatId, aiResponse.content);
  } catch (error: any) {
    await sendMessage(chatId, `Error: ${error.message || "Failed to get AI response."}`);
  }
}

async function showChatHistory(chatId: number, userId: number) {
  const db = getDb();
  const convs = await db.select({
    id: conversations.id,
    title: conversations.title,
    updatedAt: conversations.updatedAt,
    modelName: models.displayName,
  }).from(conversations).innerJoin(models, eq(conversations.modelId, models.id))
    .where(eq(conversations.userId, userId))
    .orderBy(conversations.updatedAt);

  if (convs.length === 0) {
    await sendMessage(chatId, "No chat history. Start with New Chat!");
    return;
  }

  let text = `Chat History:\n\nTap to resume:`;
  const buttons: any[] = [];
  for (const c of convs.slice(0, 20)) {
    const date = c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : "";
    buttons.push([{ text: `${c.title} (${c.modelName}) - ${date}`, callback_data: `resume_chat_${c.id}` }]);
  }
  buttons.push([{ text: "Back", callback_data: "back_menu" }]);
  await sendMessage(chatId, text, { inlineKeyboard: buttons });
}

async function handleCallback(callbackQuery: any) {
  const data = callbackQuery.data;
  const chatId = callbackQuery.message?.chat?.id;
  const userId = callbackQuery.from?.id;

  if (!chatId || !userId || !data) return;
  await answerCallbackQuery(callbackQuery.id);

  if (data === "back_menu") { await sendMainMenu(chatId); return; }
  if (data === "back_models") { await showPopularModels(chatId, userId); return; }
  if (data === "all_models") { await showAllModels(chatId, userId); return; }

  if (data.startsWith("add_provider_")) {
    const providerId = parseInt(data.replace("add_provider_", ""));
    awaitingInput.set(userId, { action: "awaiting_api_key", data: { providerId } });
    await sendMessage(chatId, `Send your API key for this provider.`, { removeKeyboard: true });
    return;
  }

  if (data === "add_custom_provider") {
    awaitingInput.set(userId, { action: "awaiting_custom_provider" });
    await sendMessage(chatId, `Custom Provider Setup:\n\nSend: Name|Display Name|Base URL|API Key\n\nExample:\nMyAI|My AI|https://api.myai.com/v1|sk-my-key`);
    return;
  }

  if (data.startsWith("select_model_")) {
    const modelId = parseInt(data.replace("select_model_", ""));
    await startChatWithModel(chatId, userId, modelId);
    return;
  }

  if (data.startsWith("resume_chat_")) {
    const convId = parseInt(data.replace("resume_chat_", ""));
    await resumeChat(chatId, userId, convId);
    return;
  }

  if (data.startsWith("provider_")) {
    const providerUserId = parseInt(data.replace("provider_", ""));
    await showProviderOptions(chatId, userId, providerUserId);
    return;
  }

  if (data.startsWith("toggle_provider_")) {
    const providerUserId = parseInt(data.replace("toggle_provider_", ""));
    await toggleProvider(chatId, userId, providerUserId);
    return;
  }

  if (data.startsWith("delete_provider_")) {
    const providerUserId = parseInt(data.replace("delete_provider_", ""));
    await deleteUserProvider(chatId, userId, providerUserId);
    return;
  }
}

async function startChatWithModel(chatId: number, userId: number, modelId: number) {
  const db = getDb();
  const modelInfo = await db.select({
    id: models.id,
    displayName: models.displayName,
    providerName: providers.name,
    providerDisplayName: providers.displayName,
  }).from(models).innerJoin(providers, eq(models.providerId, providers.id))
    .where(eq(models.id, modelId)).limit(1);

  if (!modelInfo[0]) {
    await sendMessage(chatId, "Model not found.");
    return;
  }

  const conv = await db.insert(conversations).values({
    userId,
    modelId,
    title: `Chat with ${modelInfo[0].displayName}`,
  }).returning();

  activeChats.set(userId, { modelId, conversationId: conv[0].id });
  await sendMessage(chatId, `Chat started with ${modelInfo[0].displayName}\n(${modelInfo[0].providerDisplayName})\n\nSend message or /reset to exit.`, { removeKeyboard: true });
}

async function resumeChat(chatId: number, userId: number, convId: number) {
  const db = getDb();
  const conv = await db.select().from(conversations).where(eq(conversations.id, convId)).limit(1);
  if (!conv[0] || conv[0].userId !== userId) {
    await sendMessage(chatId, "Chat not found.");
    return;
  }

  activeChats.set(userId, { modelId: conv[0].modelId, conversationId: convId });
  const msgs = await db.select().from(messages).where(eq(messages.conversationId, convId))
    .orderBy(messages.createdAt).limit(10);

  let text = `Resumed: ${conv[0].title}\n\n---\n`;
  for (const m of msgs) {
    const prefix = m.role === "user" ? "You:" : "AI:";
    text += `${prefix} ${m.content.slice(0, 200)}${m.content.length > 200 ? "..." : ""}\n\n`;
  }
  text += `---\n\nSend to continue or /reset to exit.`;
  await sendMessage(chatId, text, { removeKeyboard: true });
}

async function handleAwaitingInput(chatId: number, userId: number, text: string, awaiting: { action: string; data?: any }) {
  const db = getDb();

  switch (awaiting.action) {
    case "awaiting_api_key": {
      const { providerId } = awaiting.data;
      const existing = await db.select().from(userProviders)
        .where(and(eq(userProviders.userId, userId), eq(userProviders.providerId, providerId))).limit(1);

      if (existing[0]) {
        await db.update(userProviders).set({ apiKey: text, isActive: true })
          .where(eq(userProviders.id, existing[0].id));
      } else {
        await db.insert(userProviders).values({ userId, providerId, apiKey: text });
      }

      const prov = await db.select().from(providers).where(eq(providers.id, providerId)).limit(1);
      await sendMessage(chatId, `${prov[0]?.displayName ?? "Provider"} configured! Use My Models to chat.`);
      break;
    }

    case "awaiting_custom_provider": {
      const parts = text.split("|");
      if (parts.length < 4) {
        await sendMessage(chatId, `Invalid format. Use: Name|Display Name|Base URL|API Key`);
        awaitingInput.set(userId, awaiting);
        return;
      }
      const [name, displayName, baseUrl, apiKey] = parts;
      const prov = await db.insert(providers).values({
        name: name.trim(),
        displayName: displayName.trim(),
        baseUrl: baseUrl.trim(),
        isBuiltin: false,
      }).returning();

      await db.insert(userProviders).values({
        userId,
        providerId: prov[0].id,
        apiKey: apiKey.trim(),
      });

      await sendMessage(chatId, `Custom provider ${displayName.trim()} added!`);
      break;
    }
  }
}

async function showProviderOptions(chatId: number, userId: number, userProviderId: number) {
  const db = getDb();
  const up = await db.select({
    id: userProviders.id,
    isActive: userProviders.isActive,
    providerDisplayName: providers.displayName,
  }).from(userProviders).innerJoin(providers, eq(userProviders.providerId, providers.id))
    .where(and(eq(userProviders.id, userProviderId), eq(userProviders.userId, userId))).limit(1);

  if (!up[0]) return;
  const text = `${up[0].providerDisplayName}\nStatus: ${up[0].isActive ? "Active" : "Inactive"}`;
  const buttons = [
    [{ text: up[0].isActive ? "Deactivate" : "Activate", callback_data: `toggle_provider_${userProviderId}` }],
    [{ text: "Delete", callback_data: `delete_provider_${userProviderId}` }],
    [{ text: "Back", callback_data: "back_providers" }],
  ];
  await sendMessage(chatId, text, { inlineKeyboard: buttons });
}

async function toggleProvider(chatId: number, userId: number, userProviderId: number) {
  const db = getDb();
  const existing = await db.select().from(userProviders)
    .where(and(eq(userProviders.id, userProviderId), eq(userProviders.userId, userId))).limit(1);
  if (!existing[0]) return;
  await db.update(userProviders).set({ isActive: !existing[0].isActive })
    .where(eq(userProviders.id, userProviderId));
  await showProviderOptions(chatId, userId, userProviderId);
}

async function deleteUserProvider(chatId: number, userId: number, userProviderId: number) {
  const db = getDb();
  await db.delete(userProviders)
    .where(and(eq(userProviders.id, userProviderId), eq(userProviders.userId, userId)));
  await sendMessage(chatId, `Provider removed.`);
}

async function ensureUser(userId: number, username?: string, firstName?: string) {
  const db = getDb();
  const existing = await db.select().from(users).where(eq(users.telegramId, userId)).limit(1);
  if (!existing[0]) {
    await db.insert(users).values({
      telegramId: userId,
      telegramUsername: username,
      name: firstName ?? username,
    });
  }
}
