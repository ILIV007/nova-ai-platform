import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, Bot } from "lucide-react";

export function UsersPage() {
  const mockUsers = [
    { id: 1, name: "Telegram Users", count: "Dynamic", type: "bot" },
    { id: 2, name: "Web Users", count: "OAuth", type: "web" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-muted-foreground">Platform users and activity overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Telegram Bot Users</CardTitle>
            <div className="bg-blue-500/10 p-2 rounded-lg"><Bot className="w-4 h-4 text-blue-500" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground mt-1">Users interacting with the bot</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Web Dashboard Users</CardTitle>
            <div className="bg-green-500/10 p-2 rounded-lg"><UserCheck className="w-4 h-4 text-green-500" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">OAuth</div>
            <p className="text-xs text-muted-foreground mt-1">Admin dashboard access</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Providers Available</CardTitle>
            <div className="bg-purple-500/10 p-2 rounded-lg"><Users className="w-4 h-4 text-purple-500" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground mt-1">Built-in providers</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>User Types</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {user.type === "bot" ? <Bot className="w-5 h-5 text-primary" /> : <Users className="w-5 h-5 text-primary" />}
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">Auth: {user.count}</p>
                  </div>
                </div>
                <Badge variant="outline">{user.type === "bot" ? "Telegram" : "Web OAuth"}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
