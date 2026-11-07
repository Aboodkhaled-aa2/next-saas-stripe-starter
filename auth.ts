import authConfig from "@/auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { Plan, UserRole } from "@prisma/client";
import NextAuth, { type DefaultSession } from "next-auth";

import { prisma } from "@/lib/db";
import { getUserById } from "@/lib/user";
import { env } from "@/env.mjs";

// More info: https://authjs.dev/getting-started/typescript#module-augmentation
declare module "next-auth" {
  interface Session {
    user: {
      role: UserRole;
      plan: Plan;
      hasSelectedPlan: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    plan?: Plan;
    hasSelectedPlan?: boolean;
  }
}

export const {
  handlers: { GET, POST },
  auth,
} = NextAuth({
  // Keep the current AUTH_SECRET first for new tokens, while allowing tokens
  // encrypted with the legacy NEXTAUTH_SECRET to be read during key rotation.
  secret: [env.AUTH_SECRET, process.env.NEXTAUTH_SECRET].filter(
    (value): value is string => Boolean(value),
  ),
  trustHost: true,
  // Keep the OAuth PKCE verifier available across the apex and www hosts.
  // The canonical redirect sends www traffic to smartcleaningdesk.com.
  cookies: {
    pkceCodeVerifier: {
      name: "__Secure-authjs.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
        domain: ".smartcleaningdesk.com",
        maxAge: 15 * 60,
      },
    },
  },
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
          data: { trialStartedAt, trialEndsAt, hasSelectedPlan: false },
        });
      } else {
        await prisma.user.update({ where: { id: user.id }, data: { hasSelectedPlan: false } });
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
        const now = new Date();
        const trialStartedAt = now;
        const trialEndsAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        // Verify the Google email and grant the one-time trial only when
        // this account has never had trial dates. Existing or expired trials
        // are preserved and are never restarted by signing in again.
        await prisma.user.updateMany({
          where: { id: user.id },
          data: {
            emailVerified: user.email ? now : undefined,
          },
        });

        await prisma.user.updateMany({
          where: {
            id: user.id,
            trialStartedAt: null,
            trialEndsAt: null,
          },
          data: {
            trialStartedAt,
            trialEndsAt,
            hasSelectedPlan: false,
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

        if (typeof token.hasSelectedPlan === "boolean") {
          session.user.hasSelectedPlan = token.hasSelectedPlan;
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
      token.hasSelectedPlan = dbUser.hasSelectedPlan;

      return token;
    },
  },
  ...authConfig,
  // debug: process.env.NODE_ENV !== "production"
});
