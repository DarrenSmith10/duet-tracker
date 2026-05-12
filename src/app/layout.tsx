// src/app/layout.tsx

import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import AutoRealtimeSync from "@/components/AutoRealtimeSync";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-white">
        <AutoRealtimeSync />
        <MobileNav />
        <div className="flex min-h-screen">
          
          <div className="hidden md:block">
            <Sidebar />
            <main className="min-h-screen bg-zinc-950 p-6 pb-24 text-white"></main>
          </div>
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}