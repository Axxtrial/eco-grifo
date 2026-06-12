import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AppProvider } from "@/lib/context";
import ProtectedLayout from "@/components/ProtectedLayout";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

import type { Viewport } from "next";

export const metadata: Metadata = {
  title: "EcoGrifo - App",
  description: "App de monitoreo inteligente de grifos domésticos IoT",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "EcoGrifo",
  },
};

export const viewport: Viewport = {
  themeColor: "#080710",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#080710]`}
      >
        <AppProvider>
          <ProtectedLayout>{children}</ProtectedLayout>
        </AppProvider>
      </body>
    </html>
  );
}
