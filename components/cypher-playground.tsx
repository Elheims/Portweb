"use client"

import { useState } from "react"
import { Lock, Unlock, KeyRound, RefreshCcw, ScrollText, Grid3X3, ArrowRight } from "lucide-react"

// --- OTP LOGIC ---
const generateOTPKey = (length: number) => {
  let result = ''
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

const otpEncrypt = (plaintext: string, key: string) => {
  let result = ''
  let keyIdx = 0
  const pt = plaintext.toUpperCase()
  const k = key.toUpperCase()
  for (let char of pt) {
    if (/[A-Z]/.test(char)) {
      if (keyIdx >= k.length) throw new Error("Kunci terlalu pendek!")
      const p = char.charCodeAt(0) - 65
      const kVal = k.charCodeAt(keyIdx) - 65
      result += String.fromCharCode(((p + kVal) % 26) + 65)
      keyIdx++
    } else {
      result += char
    }
  }
  return { cipher: result, usedKey: key }
}

const otpDecrypt = (ciphertext: string, key: string) => {
  let result = ''
  let keyIdx = 0
  const ct = ciphertext.toUpperCase()
  const k = key.toUpperCase()
  for (let char of ct) {
    if (/[A-Z]/.test(char)) {
      if (keyIdx >= k.length) throw new Error("Kunci tidak cocok!")
      const c = char.charCodeAt(0) - 65
      const kVal = k.charCodeAt(keyIdx) - 65
      let val = c - kVal
      if (val < 0) val += 26
      result += String.fromCharCode((val % 26) + 65)
      keyIdx++
    } else {
      result += char
    }
  }
  return result
}


// --- TRANSPOSITION LOGIC ---
const transEncrypt = (plaintext: string, key: string) => {
  const text = plaintext.replace(/\s+/g, '').toUpperCase()
  const k = key.toUpperCase()
  if (!k) throw new Error("Kata Kunci kosong!")
  
  const numCols = k.length
  const numRows = Math.ceil(text.length / numCols)
  const padded = text.padEnd(numRows * numCols, 'X')
  
  const grid = []
  for (let i = 0; i < numRows; i++) {
    grid.push(padded.slice(i * numCols, (i + 1) * numCols).split(''))
  }
  
  const colOrder = Array.from({ length: numCols }, (_, i) => i)
    .sort((a, b) => k.charCodeAt(a) - k.charCodeAt(b))
    
  let ciphertext = ''
  for (let col of colOrder) {
    for (let row of grid) {
      ciphertext += row[col]
    }
  }
  
  // also return grid visual for UI
  return { cipher: ciphertext, grid, colOrder }
}

const transDecrypt = (ciphertext: string, key: string) => {
  const k = key.toUpperCase()
  const ct = ciphertext.toUpperCase()
  if (!k) throw new Error("Kata Kunci kosong!")
  
  const numCols = k.length
  const numRows = Math.ceil(ct.length / numCols)
  const totalCells = numRows * numCols
  const extraCells = totalCells - ct.length
  
  const colOrder = Array.from({ length: numCols }, (_, i) => i)
    .sort((a, b) => k.charCodeAt(a) - k.charCodeAt(b))
    
  const colLengths: { col: number, len: number }[] = []
  for (let i = 0; i < colOrder.length; i++) {
    const col = colOrder[i]
    if (i >= (numCols - extraCells)) {
      colLengths.push({ col, len: numRows - 1 })
    } else {
      colLengths.push({ col, len: numRows })
    }
  }
  
  const columns: Record<number, string[]> = {}
  let idx = 0
  for (let cLen of colLengths) {
    columns[cLen.col] = ct.slice(idx, idx + cLen.len).split('')
    idx += cLen.len
  }
  
  let plaintext = ''
  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      if (r < (columns[c]?.length || 0)) {
        plaintext += columns[c][r]
      }
    }
  }
  return plaintext
}


export function CypherPlayground() {
  const [method, setMethod] = useState<"otp" | "trans">("otp")
  const [mode, setMode] = useState<"enc" | "dec">("enc")
  
  const [text, setText] = useState("")
  const [key, setKey] = useState("")
  const [autoKey, setAutoKey] = useState(false)
  
  const [result, setResult] = useState("")
  const [resultKey, setResultKey] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [visualGrid, setVisualGrid] = useState<{grid: string[][], order: number[]}>({grid: [], order: []})

  const handleProcess = () => {
    setErrorMsg("")
    setResult("")
    setResultKey("")
    setVisualGrid({grid: [], order: []})
    
    try {
      if (method === "otp") {
        if (mode === "enc") {
          let currentKey = key
          const alphaLen = text.split('').filter(c => /[a-zA-Z]/.test(c)).length
          if (autoKey) {
            currentKey = generateOTPKey(alphaLen)
            setKey(currentKey)
          } else if (currentKey.length < alphaLen) {
            throw new Error(`Kunci Manual terlalu pendek! Butuh minimal ${alphaLen} huruf.`)
          }
          const { cipher, usedKey } = otpEncrypt(text, currentKey)
          setResult(cipher)
          setResultKey(usedKey)
        } else {
          const plain = otpDecrypt(text, key)
          setResult(plain)
        }
      } else {
        // Transposisi
        if (mode === "enc") {
          const { cipher, grid, colOrder } = transEncrypt(text, key)
          setResult(cipher)
          setVisualGrid({ grid, order: colOrder })
        } else {
          const plain = transDecrypt(text, key)
          setResult(plain)
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-10">
      
      {/* HEADER TABS */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <button 
          onClick={() => setMethod("otp")}
          className={`flex-1 py-4 px-6 border-2 border-[var(--theme-fg)] font-black uppercase tracking-tighter text-xl transition-all ${method === "otp" ? "bg-[var(--theme-fg)] text-[var(--theme-bg)] shadow-[4px_4px_0px_0px_var(--theme-accent)] translate-y-[-4px]" : "bg-[var(--theme-bg)] text-[var(--theme-fg)] hover:opacity-80"}`}
          style={{ fontFamily: 'var(--font-archivo-black)' }}
        >
          <KeyRound className="inline-block mr-2" /> ONE-TIME PADS
        </button>
        <button 
          onClick={() => setMethod("trans")}
          className={`flex-1 py-4 px-6 border-2 border-[var(--theme-fg)] font-black uppercase tracking-tighter text-xl transition-all ${method === "trans" ? "bg-[var(--theme-fg)] text-[var(--theme-bg)] shadow-[4px_4px_0px_0px_var(--theme-accent)] translate-y-[-4px]" : "bg-[var(--theme-bg)] text-[var(--theme-fg)] hover:opacity-80"}`}
          style={{ fontFamily: 'var(--font-archivo-black)' }}
        >
          <Grid3X3 className="inline-block mr-2" /> CHIPHER TRANSPOSISI
        </button>
      </div>

      <div className="border-4 border-[var(--theme-fg)] bg-[var(--theme-bg)] p-6 shadow-[8px_8px_0px_0px_var(--theme-fg)]">
        
        {/* MODE SELECTOR */}
        <div className="flex gap-4 mb-6 border-b-2 border-black pb-6">
          <button 
            onClick={() => {setMode("enc"); setResult(""); setErrorMsg("")}}
            className={`flex-1 py-2 border-2 border-[var(--theme-fg)] font-bold flex items-center justify-center gap-2 ${mode === "enc" ? "bg-[var(--theme-fg)] text-[var(--theme-bg)]" : "bg-[var(--theme-bg)] text-[var(--theme-fg)] hover:opacity-80"}`}
          >
            <Lock size={18} /> ENKRIPSI
          </button>
          <button 
            onClick={() => {setMode("dec"); setResult(""); setErrorMsg("")}}
            className={`flex-1 py-2 border-2 border-[var(--theme-fg)] font-bold flex items-center justify-center gap-2 ${mode === "dec" ? "bg-[var(--theme-fg)] text-[var(--theme-bg)]" : "bg-[var(--theme-bg)] text-[var(--theme-fg)] hover:opacity-80"}`}
          >
            <Unlock size={18} /> DEKRIPSI
          </button>
        </div>

        {/* INPUTS */}
        <div className="space-y-6">
          <div>
            <label className="block font-black uppercase mb-2">
              {mode === "enc" ? "Plaintext (Pesan Asli)" : "Ciphertext (Pesan Sandi)"}
            </label>
            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value.toUpperCase())}
              className="w-full border-2 border-[var(--theme-fg)] p-4 font-mono uppercase bg-transparent focus:bg-[var(--theme-bg)] focus:outline-none focus:ring-4 focus:ring-[var(--theme-accent)]/50"
              rows={3}
              placeholder="MASUKKAN TEKS DI SINI..."
            />
          </div>

          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="block font-black uppercase">
                {method === "otp" ? "Kunci OTP (Huruf Acak)" : "Kata Kunci (Keyword)"}
              </label>
              {method === "otp" && mode === "enc" && (
                <label className={`flex items-center gap-2 text-sm font-bold border-2 border-[var(--theme-fg)] px-2 py-1 cursor-pointer transition-colors ${autoKey ? 'bg-[var(--theme-fg)] text-[var(--theme-bg)]' : 'bg-transparent hover:bg-black/10'}`}>
                  <input type="checkbox" checked={autoKey} onChange={(e) => setAutoKey(e.target.checked)} className="accent-black w-4 h-4" />
                  Auto-Generate Kunci
                </label>
              )}
            </div>
            <input 
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value.toUpperCase().replace(/\s/g, ''))}
              disabled={autoKey}
              className={`w-full border-2 border-[var(--theme-fg)] p-4 font-mono uppercase focus:outline-none focus:ring-4 focus:ring-[var(--theme-accent)]/50 ${autoKey ? 'bg-[var(--theme-fg)] text-[var(--theme-bg)] cursor-not-allowed opacity-50' : 'bg-transparent'}`}
              placeholder={method === "otp" ? "KUNCI..." : "KATA KUNCI.."}
            />
            {method === "otp" && mode === "enc" && !autoKey && (
               <p className="text-xs font-mono mt-2 text-gray-500">*Minimal sepanjang huruf alphabet di dalam plaintext Anda.</p>
            )}
          </div>

          <button 
            onClick={handleProcess}
            className="w-full bg-[var(--theme-fg)] text-[var(--theme-accent)] font-black uppercase py-4 border-2 border-[var(--theme-fg)] hover:bg-[var(--theme-accent)] hover:text-[var(--theme-fg)] transition-colors flex items-center justify-center gap-2 text-lg shadow-[4px_4px_0px_0px_var(--theme-fg)] active:translate-y-[4px] active:shadow-none"
          >
            <RefreshCcw size={20} /> EKSEKUSI PROSES
          </button>
        </div>

        {/* ERROR */}
        {errorMsg && (
          <div className="mt-6 border-2 border-red-600 bg-red-100 text-red-700 font-bold p-4 uppercase flex items-center gap-2">
            <span>[!] ERROR:</span> {errorMsg}
          </div>
        )}

        {/* OUTPUT */}
        {result && (
          <div className="mt-8 border-t-4 border-black pt-8">
            <h3 className="text-2xl font-black uppercase mb-4 flex items-center gap-2">
              <ScrollText /> Hasil {mode === "enc" ? "Enkripsi" : "Dekripsi"}
            </h3>
            
            <div className="bg-[var(--theme-bg)] border-2 border-[var(--theme-fg)] p-6 font-mono text-sm sm:text-base shadow-[6px_6px_0px_0px_var(--theme-accent)] relative overflow-hidden">
               {/* decorative backdrop */}
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                 <Lock size={120} />
              </div>

              <div className="space-y-4 relative z-10">
                <div className="flex flex-col sm:flex-row gap-2 border-b border-[var(--theme-fg)]/30 pb-2">
                  <span className="opacity-50 w-32 border-r border-[var(--theme-fg)]/30 shrink-0">INPUT:</span>
                  <span className="opacity-70 break-all">{text}</span>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 border-b border-[var(--theme-fg)]/30 pb-2">
                  <span className="opacity-50 w-32 border-r border-[var(--theme-fg)]/30 shrink-0">KUNCI:</span>
                  <span className="text-yellow-400 break-all">{resultKey || key}</span>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <span className="text-[var(--theme-accent)] w-32 border-r border-[var(--theme-fg)]/30 shrink-0 font-bold">OUTPUT:</span>
                  <span className="text-[var(--theme-accent)] font-bold text-lg break-all">{result}</span>
                </div>
              </div>
            </div>

            {/* Visualisasi Grid untuk Transposisi (Opsional HANYA UNTUK ENKRIPSI) */}
            {visualGrid.grid.length > 0 && method === "trans" && mode === "enc" && (
              <div className="mt-8">
                <h4 className="font-bold uppercase mb-4 text-sm bg-[var(--theme-fg)] text-[var(--theme-bg)] inline-block px-3 py-1">System View: Transposition Matrix</h4>
                <div className="overflow-x-auto border-2 border-[var(--theme-fg)] bg-[var(--theme-bg)] p-6 shadow-[4px_4px_0px_0px_var(--theme-fg)]">
                  <table className="min-w-full font-mono text-center border-collapse">
                    <thead>
                      <tr>
                        {key.split('').map((k, i) => (
                          <th key={i} className="border-2 border-[var(--theme-fg)]/40 bg-[var(--theme-bg)] p-2 w-10 h-10 text-[var(--theme-fg)]">
                            {k}
                            <div className="text-[10px] opacity-50 mt-1 font-sans">Idx:{visualGrid.order.indexOf(i)+1}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {visualGrid.grid.map((row, rIdx) => (
                        <tr key={rIdx}>
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="border-2 border-[var(--theme-fg)] p-2 font-bold opacity-80">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  <div className="mt-4 text-sm font-mono flex items-center gap-2 border-l-4 border-[var(--theme-accent)] bg-[var(--theme-fg)]/5 p-3">
                    <strong className="uppercase">Index Baca:</strong> 
                    {visualGrid.order.map((colIdx, i) => (
                      <span key={i} className="bg-black text-white px-2 py-0.5 rounded">
                        Klm {colIdx + 1} ({key[colIdx]})
                        {i < visualGrid.order.length - 1 && <ArrowRight size={12} className="inline mx-1 text-gray-500"/>}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  )
}
