import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
// import * as Sentry from "@sentry/nextjs";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

// Sentry.init({
//   dsn: process.env.SENTRY_DSN,
//   tracesSampleRate: 1.0,
// });

export const metadata: Metadata = {
  title: "My Personal Site",
  description: "Sensory Engine Personal Site",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceGrotesk.variable} antialiased`}>
        <div id="stars-container">
          <div className="star"></div>
          <div className="star-2"></div>
        </div>
        {children}
      </body>
    </html>
  );
}
