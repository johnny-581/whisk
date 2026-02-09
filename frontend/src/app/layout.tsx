import type { Metadata } from "next";
import { Reddit_Sans } from "next/font/google";
import "./globals.css";


const redditSans = Reddit_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-reddit-sans",
});

export const metadata: Metadata = {
    title: "whisk",
  };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Added bg-background here to pull the emerald color from globals.css */}
      <body className={`${redditSans.variable} ${redditSans.className} bg-background antialiased`}>
        {children}
      </body>
    </html>
  );
}