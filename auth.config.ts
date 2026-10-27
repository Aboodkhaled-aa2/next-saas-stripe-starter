import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import Credentials from "next-auth/providers/credentials";

import { env } from "@/env.mjs";
import { prisma } from "@/lib/db";

export default {
  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),

    Resend({
      apiKey: env.RESEND_API_KEY,
      from: env.EMAIL_FROM,
    }),

    Credentials({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
        verificationCode: {
          label: "Email verification code",
          type: "text",
        },
      },

      async authorize(credentials) {
        if (!credentials?.email) {
          return null;
        }

        const email = String(credentials.email).toLowerCase().trim();
        const verificationCode = String(credentials.verificationCode || "").trim();

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        // A short-lived, single-use verification code can establish the first session.
        if (verificationCode) {
          if (!/^\d{6}$/.test(verificationCode) || !user.emailVerified) {
            return null;
          }

          const now = new Date();
          const consumedToken = await prisma.verificationToken.deleteMany({
            where: {
              identifier: email,
              token: verificationCode,
              expires: { gte: now },
            },
          });

          if (consumedToken.count !== 1) {
            return null;
          }
        } else {
          if (!credentials.password) {
            return null;
          }

          if (!user.emailVerified) {
            throw new Error("EMAIL_NOT_VERIFIED");
          }

          const bcrypt = await import("bcryptjs");
          const isValidPassword = await bcrypt.compare(
            String(credentials.password),
            user.passwordHash
          );

          if (!isValidPassword) {
            return null;
          }
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
} satisfies NextAuthConfig;
