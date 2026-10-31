import authConfig from "@/auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { Plan, UserRole } from "@prisma/client";
import NextAuth, { type DefaultSession } from "next-auth";

import { prisma } from "@/lib/db";
import { getUserById } from "@/lib/user";

// More info: https://authjs.dev/getting-started/typescript#module-augmentation
declare module "next-auth" {
  interface Session {
    user: {
      role: UserRole;
      plan: Plan;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    plan?: Plan;
  }
}

export const {
  handlers: { GET, POST },
  auth,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    // error: "/auth/error",
  },
  events: {
    async createUser({ user }) {
      // Grant the 7-day trial once, only when Auth.js creates a brand-new user.
      // Existing Google sign-ins never reset or extend a trial.
      if (!user.id) return;

      const existing = await prisma.user.findUnique({
        where: { id: user.id },
        select: { trialStartedAt: true, trialEndsAt: true },
      });

      if (!existing?.trialStartedAt && !existing?.trialEndsAt) {
        const trialStartedAt = new Date();
        const trialEndsAt = new Date(
          trialStartedAt.getTime() + 7 * 24 * 60 * 60 * 1000,
        );

        await prisma.user.update({
          where: { id: user.id },
          data: { trialStartedAt, trialEndsAt },
        });
      }
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Google has already verified this address when email_verified is true.
      // Persist that verification so plan selection does not ask Google users
      // to complete the separate email-code flow.
      const googleProfile = profile as
        | { email_verified?: boolean }
        | undefined;

      if (
        account?.provider === "google" &&
        googleProfile?.email_verified === true &&
        user.id
      ) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            emailVerified: user.email ? new Date() : undefined,
          },
        });
      }

      return true;
    },

    async session({ token, session }) {
      if (session.user) {
        if (token.sub) {
          session.user.id = token.sub;
        }

        if (token.email) {
          session.user.email = token.email;
        }

        if (token.role) {
          session.user.role = token.role;
        }

        if (token.plan) {
          session.user.plan = token.plan;
        }

        session.user.name = token.name;
        session.user.image = token.picture;
      }

      return session;
    },

    async jwt({ token }) {
      if (!token.sub) return token;

      const dbUser = await getUserById(token.sub);

      if (!dbUser) return token;

      token.name = dbUser.name;
      token.email = dbUser.email;
      token.picture = dbUser.image;
      token.role = dbUser.role;
      token.plan = dbUser.plan;

      return token;
    },
  },
  ...authConfig,
  // debug: process.env.NODE_ENV !== "production"
});
