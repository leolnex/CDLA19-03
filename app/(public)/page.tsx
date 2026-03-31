import { HeroSection } from "@/components/home/hero-section";
import { StatsSection } from "@/components/home/stats-section";
import { ProcessSection } from "@/components/home/process-section";
import { FeaturedProjects } from "@/components/home/featured-projects";
import { CTASection } from "@/components/home/cta-section";
import type { Metadata } from "next";
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <ProcessSection />
      <FeaturedProjects />
      <CTASection />
    </>
  );
}
