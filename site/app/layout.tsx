import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import localFont from "next/font/local";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const satoshi = localFont({
  src: [
    { path: "./fonts/Satoshi-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/Satoshi-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Stardance Utils",
  description:
    "Themes, inline devlog tools, shop improvements, and typography control for Stardance.",
  metadataBase: new URL("https://stardanceutils.vercel.app"),
  icons: {
    icon: "/5.png",
    shortcut: "/5.png",
    apple: "/5.png",
  },
  openGraph: {
    title: "Stardance Utils",
    description:
      "Themes, inline devlog tools, shop improvements, and typography control for Stardance.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stardance Utils",
    description: "Themes, inline devlog tools, shop improvements, and typography control for Stardance.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#07070d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        GeistMono.variable,
        "font-sans",
        geist.variable,
        satoshi.variable,
      )}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
