import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Server,
  Brain,
  TrendingUp,
  Activity,
} from "lucide-react";

export function DashboardPage() {
  const { data: providers } = trpc.provider.list.useQuery();
  const { data: models } = trpc.model.list.useQuery();

  const stats = [
    { title: "Built-in Providers", value: providers?.filter((p) => p.isBuiltin).length ?? 0, icon: Server, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Total Models", value: models?.length ?? 0, icon: Brain, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "Popular Models", value: models?.filter((m) => m.isPopular).length ?? 0, icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
    { title: "Active Providers", value: providers?.filter((p) => p.isActive).length ?? 0, icon: Activity, color: "text-orange-500", bg: "bg-orange-500/10" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">NOVA AI Platform - Overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`${stat.bg} p-2 rounded-lg`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Available Providers</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {providers?.map((provider) => (
                <div key={provider.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">{provider.displayName}</p>
                    <p className="text-xs text-muted-foreground">{provider.baseUrl}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {provider.isBuiltin && <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">Built-in</span>}
                    <span className={`w-2 h-2 rounded-full ${provider.isActive ? "bg-green-500" : "bg-red-500"}`} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Popular Models</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {models?.filter((m) => m.isPopular).map((model) => (
                <div key={model.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">{model.displayName}</p>
                    <p className="text-xs text-muted-foreground">{model.modelName}</p>
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full bg-purple-500/10 text-purple-500">{model.providerName}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
