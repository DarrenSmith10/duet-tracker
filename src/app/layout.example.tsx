import type { Metadata, Viewport } from "next";
import "./globals.css";

import Sidebar from "@/components/Sidebar";
import ServiceWorkerRegister from "./ServiceWorkerRegister";



export const metadata: Metadata = {
  title: "My DNA Companion Tracker",
  description:
    "A Duet Night Abyss companion tracker for forging, materials, Demon Wedges, daily notes, and progress.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "DNA Companion",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#18181b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-white">
        <ServiceWorkerRegister />

        <div className="flex min-h-screen">
          <Sidebar />

          <main className="flex-1">
            {children}
          </main>
        </div>
        
      </body>
    </html>
  );
}
