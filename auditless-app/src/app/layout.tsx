import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PDPA Compliance Platform",
  description: "Malaysia-first PDPA assessment and compliance operations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
