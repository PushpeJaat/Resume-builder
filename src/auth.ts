import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { getAuthSecret } from "@/lib/auth-secret";
import { prisma } from "@/lib/prisma";

const providers = [
  Credentials({
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const email = credentials?.email as string | undefined;
      const password = credentials?.password as string | undefined;
      if (!email || !password) return null;
      const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
      if (!user || !user.passwordHash) return null;
      const ok = await compare(password, user.passwordHash);
      if (!ok) return null;
      return {
        id: user.id,
        email: user.email,
        name: user.name ?? undefined,
      };
    },
  }),
] as Array<ReturnType<typeof Credentials> | ReturnType<typeof GoogleProvider>>;

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: getAuthSecret(),
  providers,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") return true;

      const email = user?.email ?? (profile as { email?: string })?.email;
      if (!email) {
        console.error("Google signIn failed: missing email on Google profile.", {
          user,
          account,
          profile,
        });
        return false;
      }

      const normalizedEmail = email.toLowerCase();
      const name = user?.name ?? (profile as { name?: string })?.name;

      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: normalizedEmail,
              name: name ?? undefined,
              plan: "FREE",
            },
          });
        }

        return true;
      } catch (error) {
        console.error("Error during Google sign-in:", error, {
          user,
          account,
          profile,
        });
        return false;
      }
    },
    async jwt({ token, user, account }) {
      // On sign in, set the token.sub to the database user ID
      if (user?.email && account?.provider === "google") {
        try {
          console.log("JWT callback: looking up user by email:", user.email);
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email.toLowerCase() },
          });
          if (dbUser) {
            token.sub = dbUser.id;
            console.log("JWT callback: found user ID:", dbUser.id);
          } else {
            console.error("JWT callback: user not found in database");
          }
        } catch (error) {
          console.error("JWT callback error:", error);
        }
      }

      // Always preserve token.sub on subsequent calls
      console.log("JWT callback: current token.sub:", token.sub);
      return token;
    },
    async session({ session, token }) {
      console.log("Session callback: token.sub:", token.sub);
      if (session.user && token.sub) {
        session.user.id = token.sub;
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { plan: true },
        });
        session.user.plan = dbUser?.plan === "PREMIUM" ? "PREMIUM" : "FREE";
        console.log("Session callback: set user ID and plan");
      } else {
        console.log("Session callback: no token.sub or session.user");
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // After successful login/signup, always redirect to templates page
      // This ensures Google OAuth users go to the right place
      return `${baseUrl}/dashboard/templates`;
    },
  },
  pages: {
    signIn: "/login",
  },
});