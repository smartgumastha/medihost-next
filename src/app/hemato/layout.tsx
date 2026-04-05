import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hemato — Book Lab Tests at Home",
  description: "Book lab tests from NABL-certified labs near you. Compare prices. Home sample collection. Reports on WhatsApp.",
  icons: {
    icon: "/hemato-favicon.svg",
  },
};

export default function HematoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
