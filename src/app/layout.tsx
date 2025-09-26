import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ThemeTransition } from "@/components/theme/ThemeTransition";
import NavbarClient from "@/components/navbar/NavbarClient";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RetinaAI — Prediksi Diabetic Retinopathy",
  description:
    "Aplikasi modern untuk prediksi Diabetic Retinopathy dengan autentikasi Admin/Pasien dan Google Login.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <ThemeTransition>
            {/* Navbar global */}
            <NavbarClient />
            <main className="min-h-[calc(100dvh-4rem)]">{children}</main>
          </ThemeTransition>
        </ThemeProvider>
      </body>
    </html>
  );
}
