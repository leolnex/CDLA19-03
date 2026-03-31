import { HeroSection } from "@/components/home/hero-section";
import { StatsSection } from "@/components/home/stats-section";
import { ProcessSection } from "@/components/home/process-section";
import { FeaturedProjects } from "@/components/home/featured-projects";
import { CTASection } from "@/components/home/cta-section";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Web Design, Branding & Digital Presence",
  description:
    "CodeDesignLA helps modern businesses grow with professional web design, branding, landing pages and digital solutions.",
};
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
