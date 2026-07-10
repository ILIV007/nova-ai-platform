import { authenticateRequest } from "./kimi/auth";

export async function createContext(req: Request) {
  try {
    const user = await authenticateRequest(req.headers);
    return { user };
  } catch {
    return { user: null };
  }
}

export type TrpcContext = Awaited<ReturnType<typeof createContext>>;
