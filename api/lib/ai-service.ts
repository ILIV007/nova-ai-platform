// ─── AI Service — Routes requests to different AI providers ──────────

export interface AIMessage {
  role: string;
  content: string;
}

export interface AIRequest {
  provider: string;
  baseUrl: string;
  apiKey: string;
  model: string;
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponse {
  content: string;
  tokensUsed?: number;
  metadata: Record<string, any>;
}

export async function generateAIResponse(request: AIRequest): Promise<AIResponse> {
  switch (request.provider.toLowerCase()) {
    case "openrouter":
    case "openai":
    case "nvidia":
      return openAICompatible(request);

    case "gemini":
      return geminiHandler(request);

    case "cloudflare":
      return cloudflareHandler(request);

    case "anthropic":
      return anthropicHandler(request);

    default:
      // Try OpenAI-compatible format for custom providers
      return openAICompatible(request);
  }
}

// ─── OpenAI-Compatible (OpenRouter, OpenAI, NVIDIA, custom) ──────────

async function openAICompatible(req: AIRequest): Promise<AIResponse> {
  const url = `${req.baseUrl}/chat/completions`;

  const body = {
    model: req.model,
    messages: req.messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    temperature: req.temperature ?? 0.7,
    max_tokens: req.maxTokens ?? 4096,
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${req.apiKey}`,
  };

  // OpenRouter specific headers
  if (req.provider === "openrouter") {
    headers["HTTP-Referer"] = "https://nova.ai";
    headers["X-Title"] = "NOVA";
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error (${response.status}): ${error.slice(0, 500)}`);
  }

  const data = (await response.json()) as any;

  return {
    content: data.choices?.[0]?.message?.content ?? "No response",
    tokensUsed: data.usage?.total_tokens,
    metadata: {
      model: data.model,
      provider: req.provider,
      finishReason: data.choices?.[0]?.finish_reason,
      promptTokens: data.usage?.prompt_tokens,
      completionTokens: data.usage?.completion_tokens,
    },
  };
}

// ─── Google Gemini ───────────────────────────────────────────────────

async function geminiHandler(req: AIRequest): Promise<AIResponse> {
  const url = `${req.baseUrl}/models/${req.model}:generateContent?key=${req.apiKey}`;

  const contents = req.messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const body = {
    contents,
    generationConfig: {
      temperature: req.temperature ?? 0.7,
      maxOutputTokens: req.maxTokens ?? 4096,
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API Error (${response.status}): ${error.slice(0, 500)}`);
  }

  const data = (await response.json()) as any;

  return {
    content: data.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response",
    tokensUsed: data.usageMetadata?.totalTokenCount,
    metadata: {
      provider: "gemini",
      model: req.model,
      finishReason: data.candidates?.[0]?.finishReason,
    },
  };
}

// ─── Cloudflare Workers AI ──────────────────────────────────────────

async function cloudflareHandler(req: AIRequest): Promise<AIResponse> {
  const url = `${req.baseUrl}/${req.model}`;

  const body = {
    messages: req.messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${req.apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Cloudflare AI Error (${response.status}): ${error.slice(0, 500)}`);
  }

  const data = (await response.json()) as any;

  return {
    content: data.result?.response ?? JSON.stringify(data.result ?? data),
    tokensUsed: data.result?.usage?.total_tokens,
    metadata: {
      provider: "cloudflare",
      model: req.model,
    },
  };
}

// ─── Anthropic Claude ───────────────────────────────────────────────

async function anthropicHandler(req: AIRequest): Promise<AIResponse> {
  const url = `${req.baseUrl}/messages`;

  const systemMsg = req.messages.find((m) => m.role === "system");
  const otherMsgs = req.messages.filter((m) => m.role !== "system");

  const body: any = {
    model: req.model,
    messages: otherMsgs.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    max_tokens: req.maxTokens ?? 4096,
  };

  if (systemMsg) {
    body.system = systemMsg.content;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": req.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API Error (${response.status}): ${error.slice(0, 500)}`);
  }

  const data = (await response.json()) as any;

  return {
    content: data.content?.[0]?.text ?? "No response",
    tokensUsed: data.usage?.input_tokens + data.usage?.output_tokens,
    metadata: {
      provider: "anthropic",
      model: data.model,
      stopReason: data.stop_reason,
    },
  };
}
