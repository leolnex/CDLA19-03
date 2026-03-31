import type { Metadata } from "next";
import AcercaDeClientPage from "./acerca-de-client-page";

export const metadata: Metadata = {
  title: "About | CodeDesignLA",
  description:
    "Learn more about CodeDesignLA, our approach, values and the way we build websites, branding and digital solutions for modern businesses.",
};

export default function AcercaDePage() {
  return <AcercaDeClientPage />;
}
