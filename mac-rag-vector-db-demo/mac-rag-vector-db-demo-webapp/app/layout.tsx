import "@/styles/globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/toaster";

import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "MuleSoft - Anypoint Platform",
  description:
    "MuleSoft provides exceptional business agility to companies by connecting applications, data, and devices, both on-premises and in the cloud with an API-led approach.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="flex flex-col items-center bg-white-300">
          <Navbar />
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
