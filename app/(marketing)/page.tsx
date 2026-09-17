import HeroSection from '@/next-saas-stripe-starter/components/landing/HeroSection';
import PricingSection from '@/next-saas-stripe-starter/components/landing/PricingSection';

export default function Page() {
  return (
    <main className="min-h-screen bg-black">
      <HeroSection />
      <PricingSection />
    </main>
  );
}
