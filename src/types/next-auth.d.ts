import { DefaultSession } from "next-auth";

type SessionPlan = "FREE" | "BASIC" | "ADVANCE";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & { id: string; plan: SessionPlan };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    plan?: SessionPlan;
  }
}
