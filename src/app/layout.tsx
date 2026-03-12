import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProActive – Your Contextual Opportunity Feed",
  description:
    "A proactive list of what's worth doing right now, powered by your interests and context.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
