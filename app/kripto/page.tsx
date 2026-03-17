import { CypherPlayground } from "@/components/cypher-playground"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function KriptoPage() {
  return (
    <div className="min-h-screen bg-[#f4f4f0] text-black">
      <div className="container mx-auto px-4 py-8">
        
        <div className="mb-8 flex items-center justify-between border-b-4 border-black pb-4">
          <Link 
            href="/" 
            className="flex items-center gap-2 font-bold uppercase hover:bg-[#00ff00] transition-colors border-2 border-transparent hover:border-black p-2"
          >
            <ArrowLeft size={20} /> Kembali ke Beranda
          </Link>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter" style={{ fontFamily: 'var(--font-archivo-black)' }}>
            Crypto / Playground
          </h1>
        </div>

        <section className="mb-12 max-w-4xl mx-auto">
          <div className="border-l-8 border-[#00ff00] bg-white p-6 border-y-2 border-r-2 border-black shadow-[4px_4px_0px_0px_var(--theme-fg)]">
            <h2 className="text-2xl font-black uppercase mb-2">Keamanan Sistem</h2>
            <p className="font-mono text-sm sm:text-base text-gray-700">
              Implementasi algoritma <strong>One Time Pads (OTP)</strong> dan <strong>Cipher Transposisional (Columnar)</strong> 
              yang sebelumnya berbasis Python CLI, direplika sepenuhnya ke dalam antarmuka web modern menggunakan teknologi Client-Side Rendering (CSR) React.
            </p>
          </div>
        </section>

        <CypherPlayground />

      </div>
    </div>
  )
}
