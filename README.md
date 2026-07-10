# NOVA - Universal AI Gateway

NOVA is a Telegram bot and web dashboard that lets you chat with 200+ AI models through a single interface. Connect your API keys from multiple providers and switch between models seamlessly.

## Features

- **6 Built-in Providers**: OpenRouter, NVIDIA NIM, Google Gemini, Cloudflare Workers AI, OpenAI, Anthropic
- **200+ Models**: Access GPT-4o, Claude Sonnet, Gemini Pro, Llama, DeepSeek, and more
- **Custom Providers**: Add any OpenAI-compatible API endpoint
- **Chat History**: Persistent conversations stored in Supabase
- **Web Dashboard**: Admin panel for managing providers and models
- **Secure**: API keys are encrypted and stored securely

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────┐
│   Telegram Bot  │────▶│  Cloudflare      │────▶│  Supabase    │
│   (User Chat)   │     │  Worker (API)    │     │  (Database)  │
└─────────────────┘     └──────────────────┘     └──────────────┘
                               │
                        ┌──────┴──────┐
                        │  Web Dashboard │
                        │  (React SPA)   │
                        └───────────────┘
```

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Hono + tRPC + Cloudflare Workers
- **Database**: Supabase (PostgreSQL) + Drizzle ORM
- **Bot**: Telegram Bot API (Webhook-based)
- **AI**: OpenAI-compatible API routing

## Quick Start

### Prerequisites

- Node.js 20+
- Cloudflare account
- Supabase account
- Telegram Bot Token (from @BotFather)

### Environment Variables

```env
# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token

# Supabase
DATABASE_URL=postgresql://...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_key

# Cloudflare
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
```

### Installation

```bash
# Install dependencies
npm install

# Push database schema
npm run db:push

# Development
npm run dev

# Build
npm run build
```

### Deploy to Cloudflare

```bash
# Deploy Worker
npx wrangler deploy

# Set Telegram webhook
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -d "url=https://your-worker.your-subdomain.workers.dev/api/bot.webhook"
```

## Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Start the bot and show welcome message |
| `/menu` | Show main dashboard |
| `/providers` | List your configured providers |
| `/models` | Show available models |
| `/newchat` | Start a new chat |
| `/history` | Show chat history |
| `/addprovider` | Add a new provider |
| `/reset` | Reset current session |

## Project Structure

```
nova/
├── api/                    # Backend API
│   ├── routers/           # tRPC routers
│   │   ├── bot-router.ts  # Telegram bot logic
│   │   ├── provider-router.ts
│   │   ├── model-router.ts
│   │   ├── conversation-router.ts
│   │   └── message-router.ts
│   ├── lib/               # Utilities
│   │   ├── telegram.ts    # Telegram API helpers
│   │   └── ai-service.ts  # AI provider routing
│   └── ...
├── db/
│   ├── schema.ts          # Database schema
│   └── relations.ts       # Table relations
├── src/
│   ├── pages/             # Dashboard pages
│   ├── components/        # UI components
│   └── ...
└── contracts/             # Shared types
```

## License

MIT
