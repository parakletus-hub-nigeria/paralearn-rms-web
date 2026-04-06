
import type { Metadata } from "next";
import {Inter, Geist, Geist_Mono, Outfit, Manrope } from "next/font/google";
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

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
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
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${inter.variable} ${outfit.variable} ${manrope.variable} antialiased`}
      >
        <ClientComponent>
           {children}
        </ClientComponent>
      </body>
    </html>
  );
}
