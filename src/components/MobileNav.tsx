"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  {
    href: "/",
    label: "Home",
    icon: "🏠",
  },
  {
    href: "/forge-queue",
    label: "Forge",
    icon: "⚒️",
  },
  {
    href: "/daily-notes",
    label: "Notes",
    icon: "📝",
  },
  {
    href: "/materials",
    label: "Materials",
    icon: "📦",
  },
  {
    href: "/settings",
    label: "Menu",
    icon: "⚙️",
  },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur md:hidden">
      <div className="grid grid-cols-5">
        {links.map((link) => {
          const active = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center gap-1 py-3 text-xs transition ${
                active
                  ? "text-white"
                  : "text-zinc-500"
              }`}
            >
              <span className="text-xl">
                {link.icon}
              </span>

              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}