import type { Metadata } from "next";
import { AboutView } from "@/components/AboutView";

export const metadata: Metadata = {
  title: "About — ReviewBoost",
  description:
    "Built for busy restaurant owners in India. Smart review filtering and QR feedback.",
};

export default function AboutPage() {
  return <AboutView />;
}
