import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  return (
    <header className="border-b-2 border-black bg-[var(--theme-bg)] sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between font-mono">
        <Link
          href="/"
          className="text-xl font-bold uppercase tracking-tighter"
          style={{ fontFamily: "var(--font-archivo-black)" }}
        >
          ferla.id
        </Link>
        <div className="flex items-center gap-6">
          <ThemeToggle />
          <nav className="hidden md:flex items-center gap-6 text-sm font-bold uppercase">
          <Link
            href="/kripto"
            className="hover:bg-[var(--theme-accent)] hover:text-[var(--theme-bg)] px-2 py-1 flex items-center gap-2 transition-colors border-2 border-transparent hover:border-[var(--theme-fg)]"
          >
            ↳ Crypto Tools
          </Link>
          <Link
            href="#about"
            className="hover:bg-black hover:text-white px-2 py-1 transition-colors border-2 border-transparent hover:border-black"
          >
            About
          </Link>
          <Link
            href="#projects"
            className="hover:bg-black hover:text-white px-2 py-1 transition-colors border-2 border-transparent hover:border-black"
          >
            Projects
          </Link>
          <Link
            href="#achievements"
            className="hover:bg-black hover:text-white px-2 py-1 transition-colors border-2 border-transparent hover:border-black"
          >
            Achievements
          </Link>
          <a
            href="https://panel.ferla.id"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2 py-1 border-2 border-[var(--theme-accent)] text-[var(--theme-accent)] hover:bg-[var(--theme-accent)] hover:text-[var(--theme-bg)] transition-colors"
          >
            Panel <ExternalLink size={12} />
          </a>
        </nav>
        </div>
      </div>
    </header>
  );
}
