import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WalrOS Explorer",
  description:
    "A decentralized knowledge graph explorer for the WalrOS protocol — built on Sui and Walrus.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className="bg-background text-on-surface h-screen overflow-hidden flex flex-col font-body-md antialiased">
        {children}
      </body>
    </html>
  );
}
