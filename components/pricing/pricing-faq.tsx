import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { HeaderSection } from "../shared/header-section";

const pricingFaqData = [
  {
    id: "item-1",
    question: "Is there a free trial?",
    answer:
      "No. Smart Cleaning Desk is a paid-only platform. Choose the plan that fits your cleaning business and activate it through secure checkout.",
  },
  {
    id: "item-2",
    question: "What happens after I subscribe?",
    answer:
      "After payment is verified, your subscription becomes active. You can then complete your business setup and configure your AI employee.",
  },
  {
    id: "item-3",
    question: "What are Voice AI minutes?",
    answer:
      "Voice AI minutes are the monthly calling minutes included with Business and Pro plans. Starter focuses on AI customer messaging.",
  },
  {
    id: "item-4",
    question: "Can I upgrade my plan?",
    answer:
      "Yes. You can upgrade when your business needs more automation, voice usage, calling features, or advanced controls.",
  },
  {
    id: "item-5",
    question: "Is the annual plan available?",
    answer:
      "Annual billing can be offered as an additional billing option when the corresponding Stripe prices are enabled. The current pricing experience focuses on monthly plans.",
  },
];

export function PricingFaq() {
  return (
    <section className="container max-w-4xl py-2">
      <HeaderSection
        label="FAQ"
        title="Frequently Asked Questions"
        subtitle="Quick answers about plans, Voice AI, billing, and getting started."
      />

      <Accordion type="single" collapsible className="my-12 w-full">
        {pricingFaqData.map((faqItem) => (
          <AccordionItem key={faqItem.id} value={faqItem.id}>
            <AccordionTrigger>{faqItem.question}</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground sm:text-[15px]">
              {faqItem.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
