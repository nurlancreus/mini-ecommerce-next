import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Mini E-Commerce",
  description: "Mini e-commerce by webdev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={
          cn("bg-background min-h-screen font-sans antialiased", inter.variable)
        }
      >
        {children}
      </body>
    </html>
  );
}
