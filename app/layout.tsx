import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BrawlField — Premium Brawl Stars Strategy & Tools Platform",
  description: "Take your Brawl Stars gameplay to the next level with dynamic meta tier lists, interactive stats, professional guides, and high-performance team builders.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-dark-bg text-gray-100 selection:bg-brawl-purple selection:text-white">
        {/* Navbar */}
        <Navbar />

        {/* Dynamic page contents wrapped in flex-1 */}
        <div className="flex flex-1 w-full">
          {children}
        </div>

        {/* Footer */}
        <Footer />
      </body>
    </html>
  );
}
