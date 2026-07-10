// ─── Telegram Bot API Helpers ────────────────────────────────────────

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

export interface SendMessageOptions {
  keyboard?: any;
  inlineKeyboard?: any[];
  removeKeyboard?: boolean;
  parseMode?: "Markdown" | "MarkdownV2" | "HTML";
}

export async function sendMessage(
  chatId: number,
  text: string,
  options: SendMessageOptions = {}
) {
  const body: any = {
    chat_id: chatId,
    text: text.slice(0, 4096), // Telegram limit
  };

  if (options.parseMode) {
    body.parse_mode = options.parseMode;
  }

  if (options.keyboard) {
    body.reply_markup = { keyboard: options.keyboard, resize_keyboard: true };
  }

  if (options.inlineKeyboard) {
    body.reply_markup = { inline_keyboard: options.inlineKeyboard };
  }

  if (options.removeKeyboard) {
    body.reply_markup = { remove_keyboard: true };
  }

  return fetch(`${API_BASE}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function editMessage(
  chatId: number,
  messageId: number,
  text: string,
  options: SendMessageOptions = {}
) {
  const body: any = {
    chat_id: chatId,
    message_id: messageId,
    text: text.slice(0, 4096),
  };

  if (options.parseMode) {
    body.parse_mode = options.parseMode;
  }

  if (options.inlineKeyboard) {
    body.reply_markup = { inline_keyboard: options.inlineKeyboard };
  }

  return fetch(`${API_BASE}/editMessageText`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function sendChatAction(chatId: number, action: string) {
  return fetch(`${API_BASE}/sendChatAction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, action }),
  });
}

export async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  const body: any = { callback_query_id: callbackQueryId };
  if (text) body.text = text;
  return fetch(`${API_BASE}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function setWebhook(url: string) {
  return fetch(`${API_BASE}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  }).then((r) => r.json());
}

export async function deleteWebhook() {
  return fetch(`${API_BASE}/deleteWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  }).then((r) => r.json());
}

// ─── Keyboard Builders ───────────────────────────────────────────────

export function createReplyKeyboard(buttons: string[][]) {
  return {
    keyboard: buttons.map((row) => row.map((text) => ({ text }))),
    resize_keyboard: true,
    one_time_keyboard: false,
  };
}

export function createInlineKeyboard(buttons: any[][]) {
  return { inline_keyboard: buttons };
}

export function removeKeyboard() {
  return { remove_keyboard: true };
}
