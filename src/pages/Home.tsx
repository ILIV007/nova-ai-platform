import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Bot,
  Zap,
  Shield,
  Globe,
  ArrowRight,
  Github,
  MessageCircle,
  Server,
  Brain,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">NOVA</span>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <Link to="/dashboard">
                  <Button variant="default">
                    Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              ) : (
                <Link to="/login">
                  <Button variant="default">Login</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Zap className="w-4 h-4" />
            Universal AI Gateway
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            One Bot.{" "}
            <span className="bg-gradient-to-r from-violet-500 to-indigo-600 bg-clip-text text-transparent">
              Every Model.
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            NOVA connects you to 200+ AI models through a single Telegram bot.
            Add your API keys and chat with any model instantly.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href="https://t.me/your_nova_bot" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="gap-2">
                <MessageCircle className="w-5 h-5" />
                Open in Telegram
              </Button>
            </a>
            <Link to="/dashboard">
              <Button size="lg" variant="outline" className="gap-2">
                <ArrowRight className="w-5 h-5" />
                Web Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-t">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose NOVA?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Globe, title: "200+ Models", desc: "Access GPT-4o, Claude, Gemini, Llama, DeepSeek, and more." },
              { icon: Server, title: "6 Built-in Providers", desc: "OpenRouter, NVIDIA, Gemini, Cloudflare, OpenAI, Anthropic." },
              { icon: Shield, title: "Secure API Keys", desc: "Your keys are encrypted and stored securely." },
              { icon: Brain, title: "Custom Providers", desc: "Add any OpenAI-compatible API endpoint." },
            ].map((feature) => (
              <div key={feature.title} className="p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 border-t">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Supported Providers</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {["OpenRouter", "NVIDIA NIM", "Google Gemini", "Cloudflare AI", "OpenAI", "Anthropic"].map((name) => (
              <div key={name} className="p-4 rounded-xl border bg-card text-center hover:bg-accent transition-colors">
                <Server className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">{name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 border-t">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
          <p className="text-muted-foreground">
            Start chatting with your favorite AI models in seconds.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href="https://t.me/your_nova_bot" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="gap-2">
                <MessageCircle className="w-5 h-5" />
                Start on Telegram
              </Button>
            </a>
          </div>
        </div>
      </section>

      <footer className="py-8 px-4 border-t">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold">NOVA</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built with Cloudflare Workers + Supabase
          </p>
          <a href="https://github.com/ILIV007/nova-ai-platform" target="_blank" rel="noopener noreferrer"
             className="text-muted-foreground hover:text-foreground transition-colors">
            <Github className="w-5 h-5" />
          </a>
        </div>
      </footer>
    </div>
  );
}
