import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ScoutBase",
  description: "Premises compliance for volunteer-run community buildings",
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
