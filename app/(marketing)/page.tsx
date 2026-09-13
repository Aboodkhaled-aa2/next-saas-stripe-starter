import { infos, features } from "@/config/landing";
import { BentoGrid } from "@/components/sections/bentogrid";
import { Features } from "@/components/sections/features";
import Header from "@/components/layout/header";

export default async function IndexPage() {
  return (
    <>
      <Header />
      <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
        <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
          <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
            Smart Cleaning Desk
          </h1>
          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            Manage your cleaning business appointments, client requests, and daily operations effortlessly.
          </p>
        </div>
      </section>
      <BentoGrid />
      <Features />
    </>
  );
}
