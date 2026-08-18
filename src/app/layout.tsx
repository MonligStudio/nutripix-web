import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { site } from "@/lib/content";

const outfit = localFont({
  variable: "--font-outfit",
  display: "swap",
  src: [
    { path: "../fonts/Outfit-Light.ttf", weight: "300", style: "normal" },
    { path: "../fonts/Outfit-Regular.ttf", weight: "400", style: "normal" },
    { path: "../fonts/Outfit-Medium.ttf", weight: "500", style: "normal" },
    { path: "../fonts/Outfit-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../fonts/Outfit-Bold.ttf", weight: "700", style: "normal" },
    { path: "../fonts/Outfit-ExtraBold.ttf", weight: "800", style: "normal" },
    { path: "../fonts/Outfit-Black.ttf", weight: "900", style: "normal" },
  ],
});

const jakarta = localFont({
  variable: "--font-jakarta",
  display: "swap",
  src: [
    { path: "../fonts/PlusJakartaSans-Light.ttf", weight: "300", style: "normal" },
    { path: "../fonts/PlusJakartaSans-Regular.ttf", weight: "400", style: "normal" },
    { path: "../fonts/PlusJakartaSans-Medium.ttf", weight: "500", style: "normal" },
    { path: "../fonts/PlusJakartaSans-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../fonts/PlusJakartaSans-Bold.ttf", weight: "700", style: "normal" },
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  keywords: [
    "kalori sayacı",
    "beslenme takibi",
    "yapay zeka kalori",
    "fotoğraftan kalori",
    "makro takibi",
    "barkod kalori",
    "diyet uygulaması",
    "NutriPix",
  ],
  openGraph: {
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    url: site.url,
    siteName: site.name,
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  applicationName: site.name,
};

export const viewport: Viewport = {
  themeColor: "#0d1117",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={`${outfit.variable} ${jakarta.variable}`}>
      <body className="bg-ink text-fg antialiased">{children}</body>
    </html>
  );
}
