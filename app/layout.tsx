import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", display: "swap" });

export const metadata: Metadata = {
  title: "Sensory Engine | Rounak's World",
  description: "A living digital universe built around Rounak and the people who matter most.",
  keywords: ["Rounak", "personal", "relationships", "memories", "sensory engine"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${inter.className} antialiased bg-black`}>
        {/* Persistent star field across all pages */}
        <div id="stars-container" aria-hidden="true">
          <div className="stars-layer" />
          <div className="stars-layer stars-layer-2" />
        </div>
        {children}
      </body>
    </html>
  );
}
