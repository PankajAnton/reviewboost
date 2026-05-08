import type { Metadata } from "next";
import { ContactView } from "@/components/ContactView";

export const metadata: Metadata = {
  title: "Contact Us — ReviewBoost",
  description:
    "Contact ReviewBoost support, billing, and legal teams. We read every message.",
};

export default function ContactPage() {
  return <ContactView />;
}
