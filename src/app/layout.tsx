import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Metadata } from "next";
import { Navbar } from "@/components/ui/navbar";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Enhanced metadata for better SEO
export const metadata: Metadata = {
  title: "tresswap - swap em all",
  description:
    "Swap hairstyles quickly and easily with our advanced AI tools. Transform your look instantly with tresswap.",
  keywords: [
    "hairstyle",
    "AI hairstyle",
    "virtual hairstyle",
    "hair swap",
    "tresswap",
  ],
  authors: [{ name: "0oAstro" }],
  creator: "tresswap",
  publisher: "tresswap",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://tresswap.vercel.app"), // Replace with your actual domain
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "tresswap - swap em all",
    description:
      "Swap hairstyles quickly and easily with our advanced AI tools.",
    url: "https://tresswap.vercel.app", // Replace with your actual domain
    siteName: "tresswap",
    images: [
      {
        url: "/tresswap-montrox.jpg",
        width: 800,
        height: 600,
        alt: "tresswap logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "tresswap - swap em all",
    description:
      "Swap hairstyles quickly and easily with our advanced AI tools.",
    creator: "@0oAstro", // Replace with your actual Twitter handle
    images: ["/tresswap-montrox.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  verification: {
    google: "oT0PVzs3H5_PT865MSGzom8Qxde3smsToRL247tAIv4",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-[#010104] text-foreground`}
      >
        <SpeedInsights />
        <Analytics />
        <Navbar />
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
