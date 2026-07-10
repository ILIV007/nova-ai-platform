import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Clock, Bot } from "lucide-react";
import { useState } from "react";

const demoConversations = [
  { id: 1, title: "Code Review: React Component", model: "GPT-4o", provider: "OpenAI", messages: 12, lastActive: "2 min ago" },
  { id: 2, title: "Python Data Analysis", model: "Claude Sonnet 4", provider: "Anthropic", messages: 24, lastActive: "1 hour ago" },
  { id: 3, title: "API Design Discussion", model: "DeepSeek V3", provider: "OpenRouter", messages: 8, lastActive: "3 hours ago" },
  { id: 4, title: "Debug: TypeScript Errors", model: "Gemini 2.5 Pro", provider: "Google", messages: 15, lastActive: "5 hours ago" },
  { id: 5, title: "System Architecture Review", model: "Llama 3.3 70B", provider: "Cloudflare", messages: 32, lastActive: "1 day ago" },
];

export function ChatHistoryPage() {
  const [filter, setFilter] = useState<string | null>(null);
  const providers = ["OpenAI", "Anthropic", "OpenRouter", "Google", "Cloudflare"];
  const filtered = filter ? demoConversations.filter((c) => c.provider === filter) : demoConversations;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Chat History</h1>
          <p className="text-muted-foreground">Recent conversations</p>
        </div>
        {filter && <Badge variant="secondary" className="cursor-pointer" onClick={() => setFilter(null)}>Clear filter</Badge>}
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant={filter === null ? "default" : "outline"} className="cursor-pointer" onClick={() => setFilter(null)}>All</Badge>
        {providers.map((p) => (
          <Badge key={p} variant={filter === p ? "default" : "outline"} className="cursor-pointer" onClick={() => setFilter(p)}>{p}</Badge>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((conv) => (
          <Card key={conv.id} className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{conv.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Bot className="w-3 h-3" />{conv.model}<span>|</span><span>{conv.provider}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MessageSquare className="w-3 h-3" />{conv.messages} msgs
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Clock className="w-3 h-3" />{conv.lastActive}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
