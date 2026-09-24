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

type PaymentConfirmationEmailProps = {
  customerName: string;
  planName: string;
  amount: string;
  paymentDate: string;
  paymentStatus: string;
  invoiceNumber?: string | null;
  invoiceUrl?: string | null;
  siteName: string;
};

export const PaymentConfirmationEmail = ({
  customerName,
  planName,
  amount,
  paymentDate,
  paymentStatus,
  invoiceNumber,
  invoiceUrl,
  siteName,
}: PaymentConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>
      Payment confirmation for {siteName} — {amount}
    </Preview>

    <Tailwind>
      <Body className="bg-white font-sans">
        <Container className="mx-auto py-8 pb-12">
          <Text className="text-2xl font-bold text-zinc-900">
            Payment confirmed
          </Text>

          <Text className="text-base text-zinc-700">
            Hi {customerName}, your payment was successfully received.
          </Text>

          <Section className="my-8 rounded-xl border border-zinc-200 bg-zinc-50 p-6">
            <Text className="text-sm text-zinc-500">Payment details</Text>

            <Text className="text-base text-zinc-900">
              <strong>Customer:</strong> {customerName}
            </Text>

            <Text className="text-base text-zinc-900">
              <strong>Plan:</strong> {planName}
            </Text>

            <Text className="text-base text-zinc-900">
              <strong>Amount:</strong> {amount}
            </Text>

            <Text className="text-base text-zinc-900">
              <strong>Payment date:</strong> {paymentDate}
            </Text>

            <Text className="text-base text-zinc-900">
              <strong>Status:</strong> {paymentStatus}
            </Text>

            {invoiceNumber ? (
              <Text className="text-base text-zinc-900">
                <strong>Invoice:</strong> {invoiceNumber}
              </Text>
            ) : null}
          </Section>

          {invoiceUrl ? (
            <Text className="text-base">
              <a
                href={invoiceUrl}
                className="font-semibold text-zinc-900 underline"
              >
                View invoice
              </a>
            </Text>
          ) : null}

          <Text className="text-base text-zinc-700">
            Thank you for choosing {siteName}.
          </Text>

          <Hr className="my-6 border-t border-zinc-200" />

          <Text className="text-sm text-zinc-500">
            This is an automated payment confirmation from {siteName}.
          </Text>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);
