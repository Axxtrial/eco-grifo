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

export const metadata: Metadata = {
  title: "EcoGrifo - Smart Water Monitoring",
  description: "App de monitoreo inteligente de grifos domésticos IoT",
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
