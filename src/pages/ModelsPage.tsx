import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles } from "lucide-react";

export function ModelsPage() {
  const { data: models, isLoading } = trpc.model.list.useQuery();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Models</h1>
        <p className="text-muted-foreground">Available AI models across all providers</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading models...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {models?.map((model) => (
            <Card key={model.id} className={model.isPopular ? "border-purple-200" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${model.isPopular ? "bg-purple-500/10" : "bg-primary/10"}`}>
                      <Brain className={`w-5 h-5 ${model.isPopular ? "text-purple-500" : "text-primary"}`} />
                    </div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {model.displayName}
                        {model.isPopular && <Sparkles className="w-4 h-4 text-purple-500" />}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">{model.providerDisplayName}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">{model.description || "No description available."}</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge variant="outline">{model.modelName}</Badge>
                  {model.maxTokens && <Badge variant="outline">{model.maxTokens.toLocaleString()} tokens</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
