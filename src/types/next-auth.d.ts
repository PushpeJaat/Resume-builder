import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & { id: string; plan: "FREE" | "PREMIUM" };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    plan?: "FREE" | "PREMIUM";
  }
}
