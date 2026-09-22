import { MagicLinkEmail } from "@/emails/magic-link-email";
import { EmailConfig } from "next-auth/providers/email";
import { Resend } from "resend";

import { env } from "@/env.mjs";
import { siteConfig } from "@/config/site";

import { getUserByEmail } from "./user";

export const resend = new Resend(env.RESEND_API_KEY);

export const sendVerificationCode = async ({
  email,
  firstName,
  verificationCode,
}: {
  email: string;
  firstName: string;
  verificationCode: string;
}) => {
  try {
    const { data, error } = await resend.emails.send({
      from: env.EMAIL_FROM,
      to:
        process.env.NODE_ENV === "development"
          ? "delivered@resend.dev"
          : email,
      subject: `Your verification code for ${siteConfig.name}`,
      react: MagicLinkEmail({
        firstName,
        verificationCode,
        siteName: siteConfig.name,
      }),
      headers: {
        "X-Entity-Ref-ID": new Date().getTime() + "",
      },
    });

<<<<<<< ours
    if (error) {
      console.error("Resend API error:", error);
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error("Resend returned no email data.");
    }

    return data;
  } catch (error) {
    console.error("Verification email error:", error);

    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to send verification email."
    );
=======
    if (error || !data) {
      throw new Error(error?.message || "Failed to send verification email.");
    }

    return data;
  } catch {
    throw new Error("Failed to send verification email.");
>>>>>>> theirs
  }
};

export const sendVerificationRequest: EmailConfig["sendVerificationRequest"] =
  async ({ identifier, provider }) => {
    const user = await getUserByEmail(identifier);

    if (!user || !user.name) {
      throw new Error("User not found.");
<<<<<<< ours
    }

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const { data, error } = await resend.emails.send({
      from: provider.from ?? env.EMAIL_FROM,
      to:
        process.env.NODE_ENV === "development"
          ? "delivered@resend.dev"
          : identifier,
      subject: `Your verification code for ${siteConfig.name}`,
      react: MagicLinkEmail({
        firstName: user.name,
        verificationCode,
        siteName: siteConfig.name,
      }),
      headers: {
        "X-Entity-Ref-ID": new Date().getTime() + "",
      },
    });

    if (error) {
      console.error("Resend magic link error:", error);
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error("Resend returned no email data.");
=======
>>>>>>> theirs
    }

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    await resend.emails.send({
      from: provider.from ?? env.EMAIL_FROM,
      to:
        process.env.NODE_ENV === "development"
          ? "delivered@resend.dev"
          : identifier,
      subject: `Your verification code for ${siteConfig.name}`,
      react: MagicLinkEmail({
        firstName: user.name,
        verificationCode,
        siteName: siteConfig.name,
      }),
      headers: {
        "X-Entity-Ref-ID": new Date().getTime() + "",
      },
    });
  };
