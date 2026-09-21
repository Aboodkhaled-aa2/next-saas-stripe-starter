import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

import { Icons } from "../components/shared/icons";

type VerificationEmailProps = {
  firstName: string;
  verificationCode: string;
  siteName: string;
};

export const MagicLinkEmail = ({
  firstName = "",
  verificationCode,
  siteName,
}: VerificationEmailProps) => (
  <Html>
    <Head />

    <Preview>
      Your verification code for {siteName} is {verificationCode}
    </Preview>

    <Tailwind>
      <Body className="bg-white font-sans">
        <Container className="mx-auto py-5 pb-12">
          <Icons.logo className="m-auto block size-10" />

          <Text className="text-base">
            Hi {firstName},
          </Text>

          <Text className="text-base">
            Welcome to {siteName}! Use the verification code below to verify
            your email address and activate your account.
          </Text>

          <Section className="my-8 text-center">
            <Text className="text-3xl font-bold tracking-[0.4em] text-zinc-900">
              {verificationCode}
            </Text>
          </Section>

          <Text className="text-base">
            This code expires in 10 minutes.
          </Text>

          <Text className="text-base">
            If you did not create an account, you can safely ignore this email.
          </Text>

          <Hr className="my-4 border-t-2 border-gray-300" />

          <Text className="text-sm text-gray-600">
            123 Code Street, Suite 404, Devtown, CA 98765
          </Text>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);
