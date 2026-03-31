import type { Metadata } from "next";
import ServiciosClientPage from "./contacto-client-page";

export const metadata: Metadata = {
  title: "Web Design Services & Branding Solutions",
  description:
    "Explore web design, landing pages, branding and digital presence services created to help businesses look professional and grow online.",
};

export default function ServiciosPage() {
  return <ServiciosClientPage />;
}
