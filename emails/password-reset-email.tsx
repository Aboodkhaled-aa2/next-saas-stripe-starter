import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

type PasswordResetEmailProps = {
  firstName: string;
  resetUrl: string;
  siteName: string;
};

export const PasswordResetEmail = ({
  firstName,
  resetUrl,
  siteName,
}: PasswordResetEmailProps) => (
  <Html>
    <Head />
    <Preview>Reset your {siteName} password</Preview>

    <Tailwind>
      <Body className="bg-white font-sans">
        <Container className="mx-auto py-8 pb-12">
          <Text className="text-2xl font-bold text-zinc-900">
            Reset your password
          </Text>

          <Text className="text-base text-zinc-700">
            Hi {firstName}, we received a request to reset your password.
          </Text>

          <Section className="my-8 text-center">
            <a
              href={resetUrl}
              className="inline-block rounded-lg bg-zinc-900 px-6 py-3 font-semibold text-white"
            >
              Reset Password
            </a>
          </Section>

          <Text className="text-sm text-zinc-500">
            This link expires in 30 minutes. If you did not request a password
            reset, you can safely ignore this email.
          </Text>

          <Text className="text-sm text-zinc-500">
            If the button does not work, copy and paste this URL into your
            browser: {resetUrl}
          </Text>

          <Text className="mt-8 text-sm text-zinc-500">
            This is an automated email from {siteName}.
          </Text>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export default PasswordResetEmail;
