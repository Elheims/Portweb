import { CypherPlayground } from "@/components/cypher-playground"
import { BlockCypherPlayground } from "@/components/block-cypher"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function KriptoPage() {
  return (
    <div className="min-h-screen text-[var(--theme-fg)]">
      <div className="container mx-auto px-4 py-8">
        
        <div className="mb-8 flex items-center justify-between border-b-4 border-black pb-4">
          <Link 
            href="/" 
            className="flex items-center gap-2 font-bold uppercase hover:bg-[var(--theme-accent)] transition-colors border-2 border-transparent hover:border-black p-2"
          >
            <ArrowLeft size={20} /> Kembali ke Beranda
          </Link>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter" style={{ fontFamily: 'var(--font-archivo-black)' }}>
            Crypto / Playground
          </h1>
        </div>

        <section className="mb-12 max-w-4xl mx-auto">
          <div className="border-l-8 border-[var(--theme-accent)] bg-[var(--theme-bg)] p-6 border-y-2 border-r-2 border-[var(--theme-fg)] shadow-[4px_4px_0px_0px_var(--theme-fg)]">
            <h2 className="text-2xl font-black uppercase mb-2">Keamanan Sistem</h2>
            <p className="font-mono text-sm sm:text-base text-[var(--theme-fg)] opacity-80">
              Implementasi algoritma <strong>One Time Pads (OTP)</strong> dan <strong>Cipher Transposisional (Columnar)</strong> 
              yang sebelumnya berbasis Python CLI, direplika sepenuhnya ke dalam antarmuka web modern menggunakan teknologi Client-Side Rendering (CSR) React.
            </p>
          </div>
        </section>

        <CypherPlayground />

        <div className="mt-20">
          <section className="mb-12 max-w-4xl mx-auto">
            <div className="border-l-8 border-[var(--theme-accent)] bg-[var(--theme-bg)] p-6 border-y-2 border-r-2 border-[var(--theme-fg)] shadow-[4px_4px_0px_0px_var(--theme-fg)]">
              <h2 className="text-2xl font-black uppercase mb-2">Modern Block Cipher</h2>
              <p className="font-mono text-sm sm:text-base text-[var(--theme-fg)] opacity-80">
                Implementasi spesifik <strong>Symmetric Block Cipher</strong> dibuat murni dengan algoritma iteratif dari nol (16-byte Block).
                Mode yang disediakan meliputi <strong>ECB (Electronic Codebook)</strong> dan <strong>CBC (Cipher Block Chaining)</strong>. Uniknya, metode ini bisa langsung dipakai mengenkripsi data gambar untuk mendemonstrasikan hasil pola di luar <em>lossless compression</em>.
              </p>
            </div>
          </section>
          
          <BlockCypherPlayground />
        </div>

      </div>
    </div>
  )
}
