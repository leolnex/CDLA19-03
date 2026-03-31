import type { Metadata } from "next";
import ContactoClientPage from "./contacto-client-page";

export const metadata: Metadata = {
  title: "Contact | Start Your Project",
  description:
    "Get in touch with CodeDesignLA to discuss your website, branding or digital presence project and request a custom quote.",
};

export default function ContactoPage() {
  return <ContactoClientPage />;
}
