import HeroSection from '@/components/landing/HeroSection';
import PricingSection from '@/components/landing/PricingSection';

export default function Page() {
  return (
    <main className="min-h-screen bg-black">
      <HeroSection />
      <PricingSection />
    </main>
  );
}
