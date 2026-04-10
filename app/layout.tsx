import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ConditionalChrome } from "@/components/conditional-chrome";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Harajatlarni nazorat qilish",
  description: "Oylik harajatlar va tushumlarni kuzatish, statistikalar va ovozli kiritish.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ConditionalChrome>{children}</ConditionalChrome>
      </body>
    </html>
  );
}
