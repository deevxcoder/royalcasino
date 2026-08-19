import type { Metadata } from "next";
import "./globals.css";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await db.siteSetting.findUnique({ where: { id: "default" } });
    const siteName = settings?.siteName || "NEXX CASINO";
    const subtitle = settings?.siteSubtitle || "Casino Royale";

    return {
      title: `${siteName} | ${subtitle}`,
      description: `Play 5000+ top casino slots, Aviator, Crash games, and live dealers at ${siteName}.`,
    };
  } catch (e) {
    return {
      title: "ROYAL GGR CASINO | Casino Royale",
      description: "Premier GGR Gaming Platform",
    };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let themeColor = "gold";
  try {
    const settings = await db.siteSetting.findUnique({ where: { id: "default" } });
    if (settings?.themeColor) themeColor = settings.themeColor;
  } catch (e) {}

  return (
    <html lang="en" className="dark" data-theme={themeColor} suppressHydrationWarning>
      <body className="bg-[#080b11] text-gray-100 min-h-screen selection:bg-amber-500 selection:text-black" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
