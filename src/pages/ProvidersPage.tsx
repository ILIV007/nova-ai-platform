import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Server, Plus, Key } from "lucide-react";
import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProvidersPage() {
  const utils = trpc.useUtils();
  const { data: providers, isLoading } = trpc.provider.list.useQuery();
  const createProvider = trpc.provider.create.useMutation({
    onSuccess: () => { utils.provider.list.invalidate(); setOpen(false); },
  });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", displayName: "", baseUrl: "", description: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProvider.mutate({ ...form, requiresApiKey: true });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Providers</h1>
          <p className="text-muted-foreground">Manage AI service providers</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Add Provider</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Custom Provider</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name (unique key)</Label>
                <Input id="name" placeholder="my-provider" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input id="displayName" placeholder="My AI Provider" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="baseUrl">Base URL</Label>
                <Input id="baseUrl" placeholder="https://api.example.com/v1" value={form.baseUrl} onChange={(e) => setForm({ ...form, baseUrl: e.target.value })} required />
              </div>
              <Button type="submit" className="w-full" disabled={createProvider.isPending}>
                {createProvider.isPending ? "Creating..." : "Create Provider"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {providers?.map((provider) => (
            <Card key={provider.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Server className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{provider.displayName}</CardTitle>
                      <p className="text-xs text-muted-foreground">{provider.baseUrl}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {provider.isBuiltin && <Badge variant="secondary">Built-in</Badge>}
                    <Badge variant={provider.isActive ? "default" : "destructive"}>{provider.isActive ? "Active" : "Inactive"}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{provider.description || "No description."}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Key className="w-3 h-3" />
                  {provider.requiresApiKey ? "API Key required" : "No API Key needed"}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
