
import type { Metadata } from "next";
import {Inter, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientComponent from "@/clientcomponet/ClientComponent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter", // Give it a CSS variable name
});

export const metadata: Metadata = {
  title: {
    default: "ParaLearn - Modern Result Management for African Schools",
    template: "%s | ParaLearn",
  },
  description:
    "Simplify results, assessments, and reporting. ParaLearn RMS helps African schools move from paperwork to a unified digital system.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-white">
      <body
        className={`${inter.variable} antialiased`}
      >
        <ClientComponent>
           {children}
        </ClientComponent>
      </body>
    </html>
  );
}
