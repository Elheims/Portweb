import Link from "next/link";

export function Header() {
  return (
    <header className="border-b-2 border-black bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between font-mono">
        <Link
          href="/"
          className="text-xl font-bold uppercase tracking-tighter"
          style={{ fontFamily: "var(--font-archivo-black)" }}
        >
          ferla.id
        </Link>
        <nav className="flex items-center gap-6 text-sm font-bold uppercase">
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
        </nav>
      </div>
    </header>
  );
}
