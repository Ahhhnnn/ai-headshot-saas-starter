import { Hero } from "@/components/homepage/hero";
import { SocialProofUnified } from "@/components/homepage/social-proof-testimonials";
import { Features } from "@/components/homepage/features";
import { SamplesSection } from "@/components/homepage/samples";
import { LandingPricing } from "@/components/homepage/landing-pricing";
import { FAQSection } from "@/components/homepage/faq";
import { CallToAction } from "@/components/homepage/call-to-action";

export default function HomePage() {
  return (
    <>
      <Hero />
      <SocialProofUnified />
      <Features />
      <SamplesSection />
      <LandingPricing />
      <FAQSection />
      <CallToAction />
    </>
  );
}
