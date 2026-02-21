import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-black text-white py-12 px-4 font-mono font-bold">
      <div className="container max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <p className="text-2xl tracking-tighter uppercase" style={{ fontFamily: 'var(--font-archivo-black)' }}>
            ferla.id
          </p>
          <p className="mt-2 text-gray-400 text-sm">
            © {new Date().getFullYear()} - SYSTEM HALTED.
          </p>
        </div>
        
        <div className="flex gap-4">
          <Link href="https://github.com" target="_blank" className="border-2 border-white px-4 py-2 hover:bg-white hover:text-black transition-colors uppercase text-sm">
            GitHub
          </Link>
          <Link href="https://linkedin.com" target="_blank" className="border-2 border-white px-4 py-2 hover:bg-white hover:text-black transition-colors uppercase text-sm">
            LinkedIn
          </Link>
          <Link href="mailto:info@ferla.id" className="border-2 border-white px-4 py-2 hover:bg-white hover:text-black transition-colors uppercase text-sm">
            Email
          </Link>
        </div>
      </div>
    </footer>
  )
}
