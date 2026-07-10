import { Hono } from "hono";
import { trpcServer } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";

const app = new Hono();

// tRPC endpoint
app.use("/api/*", async (c) => {
  return trpcServer({
    router: appRouter,
    createContext: () => createContext(c.req.raw),
  })(c.req.raw);
});

// Health check
app.get("/health", (c) => c.json({ ok: true, time: Date.now() }));

// Serve frontend
app.get("*", async (c) => {
  try {
    const file = await import("fs").then((fs) => fs.readFileSync("./dist/index.html", "utf8"));
    return c.html(file);
  } catch {
    return c.json({ message: "NOVA API is running. Build the frontend to see the dashboard." });
  }
});

export default app;

// Start server for local dev
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  const { serve } = await import("@hono/node-server");
  serve({ fetch: app.fetch, port });
  console.log(`NOVA server running at http://localhost:${port}`);
}
