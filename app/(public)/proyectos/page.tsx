import type { Metadata } from "next";
import ProyectosClientPage from "./proyectos-client-page";

export const metadata: Metadata = {
  title: "Projects | Web Design & Branding Portfolio",
  description:
    "Browse selected web design, branding and digital projects created by CodeDesignLA for modern businesses and growing brands.",
};

export default function ProyectosPage() {
  return <ProyectosClientPage />;
}
