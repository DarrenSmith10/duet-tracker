import Link from "next/link";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/characters", label: "Characters" },
  { href: "/weapons", label: "Weapons" },
  { href: "/materials", label: "Materials" },
  { href: "/forging", label: "Weapon Forging" },
  { href: "/demon-wedges", label: "Demon Wedges" },
  { href: "/forge-queue", label: "Forge Queue" },
  {
    href: "https://dna-demon-wedge-calculator.vercel.app/demon-wedge",
    label: "Demon Calculator",
    external: true,
  },
  { href: "/settings", label: "Save Management" },
  { href: "/daily-notes", label: "Daily Notes" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-zinc-900 p-4">
      <h1 className="mb-6 text-2xl font-bold text-white">DNA Tracker</h1>

      <nav className="space-y-2">
        {links.map((link) =>
          link.external ? (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg px-3 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              {link.label}
            </a>
          ) : (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-lg px-3 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              {link.label}
            </Link>
          )
        )}
      </nav>
    </aside>
  );
}
