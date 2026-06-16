import type { Metadata } from "next";
import { Space_Grotesk, Big_Shoulders_Display, Playfair_Display, Caveat } from "next/font/google";
import "./globals.css";
import DevPanel from "@/components/ui/DevPanel";
import { GlobalNavigation } from "@/components/layout/GlobalNavigation";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const bigShoulders = Big_Shoulders_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-handwritten",
  display: "swap",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Nova Unplugged 2026 | IIM Bangalore Annual Fest",
  description:
    "Nova Unplugged is the annual college fest of IIM Bangalore — June 2026. Register now for cultural, technical, and sports events. Gamified entry, QR-based access, and 1000+ participants.",
  keywords: ["IIM Bangalore", "college fest", "Nova Unplugged", "IIMB", "events 2026"],
  openGraph: {
    title: "Nova Unplugged 2026 | IIM Bangalore",
    description: "The annual fest of IIM Bangalore. June 2026.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${bigShoulders.variable} ${playfair.variable} ${caveat.variable}`}>
      <body className="bg-nova-bg text-nova-text font-body antialiased">
        <GlobalNavigation />
        {children}
        <DevPanel />
      </body>
    </html>
  );
}
