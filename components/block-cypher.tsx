"use client"

import { useState, useRef, ChangeEvent } from "react"
import { Lock, Unlock, KeyRound, RefreshCcw, ScrollText, Image as ImageIcon, Type, Download } from "lucide-react"
import { encryptECB, decryptECB, encryptCBC, decryptCBC, stringToBytes, bytesToString, bytesToHex, hexToBytes, BLOCK_SIZE } from "@/lib/block-cipher"

export function BlockCypherPlayground() {
  const [method, setMethod] = useState<"ecb" | "cbc">("ecb")
  const [mode, setMode] = useState<"enc" | "dec">("enc")
  const [inputType, setInputType] = useState<"text" | "image">("text")

  const [text, setText] = useState("")
  const [keyStr, setKeyStr] = useState("")
  const [ivStr, setIvStr] = useState("")
  
  const [resultText, setResultText] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const canvasOriginalRef = useRef<HTMLCanvasElement>(null)
  const canvasProcessedRef = useRef<HTMLCanvasElement>(null)

  const resetOutput = () => {
    setResultText("")
    setErrorMsg("")
  }

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      setImageSrc(event.target?.result as string)
      resetOutput()
      // Clear canvases early
      if (canvasOriginalRef.current) {
        const ctx = canvasOriginalRef.current.getContext("2d");
        ctx?.clearRect(0,0, canvasOriginalRef.current.width, canvasOriginalRef.current.height);
      }
      if (canvasProcessedRef.current) {
        const ctx = canvasProcessedRef.current.getContext("2d");
        ctx?.clearRect(0,0, canvasProcessedRef.current.width, canvasProcessedRef.current.height);
      }
    }
    reader.readAsDataURL(file)
  }

  const handleProcess = () => {
    resetOutput()

    if (inputType === "text") {
      try {
        if (!text) throw new Error("Input teks tidak boleh kosong!")
        if (!keyStr) throw new Error("Kunci tidak boleh kosong!")
        if (method === "cbc" && !ivStr) throw new Error("IV (Initialization Vector) tidak boleh kosong pada mode CBC!")

        if (mode === "enc") {
          const inputBytes = stringToBytes(text)
          const cipherBytes = method === "ecb" 
              ? encryptECB(inputBytes, keyStr, true)
              : encryptCBC(inputBytes, keyStr, ivStr, true)
          setResultText(bytesToHex(cipherBytes).toUpperCase())
        } else {
          // Decrypt assumes input is Hex
          const inputBytes = hexToBytes(text)
          if(inputBytes.length === 0 && text.length > 0) throw new Error("Ciphertext (Hex) tidak valid!")
          
          const plainBytes = method === "ecb"
              ? decryptECB(inputBytes, keyStr, true)
              : decryptCBC(inputBytes, keyStr, ivStr, true)
          
          // Verify if it can decode UTF-8 cleanly
          try {
            setResultText(bytesToString(plainBytes))
          } catch(decError) {
            // Result is probably raw bytes not fitting utf-8 if the key was wrong.
            // But TextDecoder doesn't throw often, it replaces unknown chars. Let's just set it.
           setResultText(bytesToString(plainBytes))
          }
        }
      } catch(e:any) {
        setErrorMsg(e.message)
      }
    } else {
      // Image Process
      if (!imageSrc) { setErrorMsg("Pilih gambar terlebih dahulu!"); return; }
      if (!keyStr) { setErrorMsg("Kunci tidak boleh kosong!"); return; }
      if (method === "cbc" && !ivStr) { setErrorMsg("IV tidak boleh kosong pada mode CBC!"); return; }

      const img = new Image();
      img.onload = () => {
        const cvsOrig = canvasOriginalRef.current;
        const cvsProc = canvasProcessedRef.current;
        if (!cvsOrig || !cvsProc) return;

        const ctxOrig = cvsOrig.getContext("2d");
        const ctxProc = cvsProc.getContext("2d");
        if (!ctxOrig || !ctxProc) return;

        cvsOrig.width = img.width;
        cvsOrig.height = img.height;
        cvsProc.width = img.width;
        cvsProc.height = img.height;

        // Draw original
        ctxOrig.drawImage(img, 0, 0);

        // Process pixels
         try {
            const imageData = ctxOrig.getImageData(0, 0, img.width, img.height);
            const data = imageData.data;
      
            const totalPixels = img.width * img.height;
            const rgbBytes = new Uint8Array(totalPixels * 3);
            for(let i=0; i<totalPixels; i++) {
              rgbBytes[i*3] = data[i*4];
              rgbBytes[i*3+1] = data[i*4+1];
              rgbBytes[i*3+2] = data[i*4+2];
            }
  
            let processedRgb: Uint8Array;
            if (method === "ecb") {
              processedRgb = mode === "enc" 
                ? encryptECB(rgbBytes, keyStr, false) 
                : decryptECB(rgbBytes, keyStr, false);
            } else {
              processedRgb = mode === "enc" 
                ? encryptCBC(rgbBytes, keyStr, ivStr, false) 
                : decryptCBC(rgbBytes, keyStr, ivStr, false);
            }
            
            for(let i=0; i<totalPixels; i++) {
              data[i*4] = processedRgb[i*3];
              data[i*4+1] = processedRgb[i*3+1];
              data[i*4+2] = processedRgb[i*3+2];
            }
            
            ctxProc.putImageData(imageData, 0, 0);
          } catch(e: any) {
             setErrorMsg(e.message)
          }
      };
      img.src = imageSrc;
    }
  }

  const handleDownloadImage = () => {
    if (!canvasProcessedRef.current) return;
    const link = document.createElement("a");
    link.download = `cipher_${method}_${mode}.png`;
    link.href = canvasProcessedRef.current.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-10 mt-16 border-t-8 border-[var(--theme-fg)] pt-16">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-black uppercase tracking-tighter" style={{ fontFamily: 'var(--font-archivo-black)' }}>BLOCK ENCRYPTION</h2>
        <p className="mt-2 font-mono text-sm opacity-80 uppercase">Electronic Codebook (ECB) vs Cipher Block Chaining (CBC)</p>
      </div>
      
      {/* METHOD SELECTION */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <button
          onClick={() => { setMethod("ecb"); resetOutput(); }}
          className={`py-3 px-4 border-2 border-[var(--theme-fg)] font-black uppercase tracking-tighter text-lg transition-all ${method === "ecb" ? "bg-[var(--theme-fg)] text-[var(--theme-bg)] shadow-[4px_4px_0px_0px_var(--theme-accent)] translate-y-[-2px]" : "bg-[var(--theme-bg)] text-[var(--theme-fg)] hover:opacity-80"}`}
          style={{ fontFamily: 'var(--font-archivo-black)' }}
        >
          MODE 1: ECB
        </button>
        <button
          onClick={() => { setMethod("cbc"); resetOutput(); }}
          className={`py-3 px-4 border-2 border-[var(--theme-fg)] font-black uppercase tracking-tighter text-lg transition-all ${method === "cbc" ? "bg-[var(--theme-fg)] text-[var(--theme-bg)] shadow-[4px_4px_0px_0px_var(--theme-accent)] translate-y-[-2px]" : "bg-[var(--theme-bg)] text-[var(--theme-fg)] hover:opacity-80"}`}
          style={{ fontFamily: 'var(--font-archivo-black)' }}
        >
          MODE 2: CBC
        </button>
      </div>

      <div className="border-4 border-[var(--theme-fg)] bg-[var(--theme-bg)] p-6 md:p-8 shadow-[8px_8px_0px_0px_var(--theme-fg)]">
        
        {/* ACTION SELECTOR */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 border-b-2 border-[var(--theme-fg)]/30 pb-6 justify-between items-center">
           <div className="flex gap-2 w-full md:w-auto">
             <button 
                onClick={() => { setMode("enc"); resetOutput() }}
                className={`flex-1 py-2 px-6 border-2 border-[var(--theme-fg)] font-bold flex items-center justify-center gap-2 ${mode === "enc" ? "bg-[var(--theme-fg)] text-[var(--theme-bg)]" : "bg-[var(--theme-bg)] text-[var(--theme-fg)] hover:opacity-80"}`}
              >
                <Lock size={18} /> ENKRIPSI
              </button>
              <button 
                onClick={() => { setMode("dec"); resetOutput() }}
                className={`flex-1 py-2 px-6 border-2 border-[var(--theme-fg)] font-bold flex items-center justify-center gap-2 ${mode === "dec" ? "bg-[var(--theme-fg)] text-[var(--theme-bg)]" : "bg-[var(--theme-bg)] text-[var(--theme-fg)] hover:opacity-80"}`}
              >
                <Unlock size={18} /> DEKRIPSI
              </button>
           </div>
           
           <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0 bg-[var(--theme-fg)]/10 p-1 border-2 border-[var(--theme-fg)]">
              <button 
                 onClick={() => { setInputType("text"); resetOutput(); }}
                 className={`flex items-center gap-2 px-4 py-1 font-bold uppercase text-sm ${inputType === "text" ? "bg-[var(--theme-fg)] text-[var(--theme-bg)]" : "text-[var(--theme-fg)] hover:opacity-80"}`}
              >
                <Type size={16}/> Text
              </button>
              <button 
                 onClick={() => { setInputType("image"); resetOutput(); }}
                 className={`flex items-center gap-2 px-4 py-1 font-bold uppercase text-sm ${inputType === "image" ? "bg-[var(--theme-fg)] text-[var(--theme-bg)]" : "text-[var(--theme-fg)] hover:opacity-80"}`}
              >
                <ImageIcon size={16}/> Image
              </button>
           </div>
        </div>

        {/* INPUTS MAIN */}
        <div className="space-y-6">
          
          {inputType === "text" ? (
             <div>
               <label className="block font-black uppercase mb-2">
                 {mode === "enc" ? "Masukan Plaintext (Teks Tulis)" : "Masukan Ciphertext (Hex String)"}
               </label>
               <textarea 
                 value={text}
                 onChange={(e) => setText(e.target.value.trimStart())}
                 className="w-full border-2 border-[var(--theme-fg)] p-4 font-mono bg-transparent focus:outline-none focus:ring-4 focus:ring-[var(--theme-accent)]/50"
                 rows={4}
                 placeholder={mode === "enc" ? "HELLO WORLD..." : "6B1A3F..."}
               />
             </div>
          ) : (
            <div className="border-2 border-[var(--theme-fg)] border-dashed p-8 bg-[var(--theme-fg)]/5 flex flex-col items-center justify-center min-h-[150px] relative">
               <input 
                  type="file" 
                  accept="image/png, image/jpeg" 
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
               />
               <ImageIcon size={48} className="opacity-50 mb-4" />
               <p className="font-bold uppercase text-center">KLIK ATAU DROP GAMBAR DI SINI</p>
               <p className="font-mono text-sm opacity-60">Hanya PNG/JPG</p>
               {imageSrc && <p className="mt-4 bg-[var(--theme-fg)] text-[var(--theme-bg)] px-3 py-1 text-xs font-bold font-mono">1 Berkas Tersimpan</p>}
            </div>
          )}

          {/* KEYS INFO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[var(--theme-fg)]/5 p-6 border-2 border-[var(--theme-fg)]">
             <div>
                <label className="block font-black uppercase mb-2 text-sm">Secret Key (Pad 16 Byte)</label>
                <input 
                  type="text"
                  value={keyStr}
                  onChange={(e) => setKeyStr(e.target.value)}
                  className="w-full border-2 border-[var(--theme-fg)] p-3 font-mono bg-transparent focus:outline-none focus:ring-4 focus:ring-[var(--theme-accent)]/50"
                  placeholder="KUNCIRAHASIA..."
                />
             </div>
             <div>
                <label className="block font-black uppercase mb-2 text-sm">Init. Vector {method === "ecb" ? "(TIDAK DIGUNAKAN)" : ""}</label>
                <input 
                  type="text"
                  value={ivStr}
                  onChange={(e) => setIvStr(e.target.value)}
                  disabled={method === "ecb"}
                  className={`w-full border-2 border-[var(--theme-fg)] p-3 font-mono focus:outline-none focus:ring-4 focus:ring-[var(--theme-accent)]/50 ${method === "ecb" ? "bg-[var(--theme-fg)] text-[var(--theme-bg)] opacity-50 cursor-not-allowed" : "bg-transparent"}`}
                  placeholder="VEKTORINISIASI..."
                />
             </div>
          </div>

          <button 
            onClick={handleProcess}
            className="w-full bg-[var(--theme-fg)] text-[var(--theme-accent)] font-black uppercase py-4 border-2 border-[var(--theme-fg)] hover:bg-[var(--theme-accent)] hover:text-[var(--theme-fg)] transition-colors flex items-center justify-center gap-3 text-xl shadow-[4px_4px_0px_0px_var(--theme-fg)] active:translate-y-[4px] active:shadow-none"
          >
            <RefreshCcw size={24} /> PROSES {inputType} SEKARANG
          </button>
        </div>

        {/* ERROR */}
        {errorMsg && (
          <div className="mt-6 border-2 border-red-500 bg-red-500/10 text-red-400 font-bold p-4 uppercase flex items-center gap-2">
            <span>[!] GAGAL:</span> {errorMsg}
          </div>
        )}

        {/* OUTPUT: TEXT */}
        {inputType === "text" && resultText && (
          <div className="mt-8 border-t-4 border-[var(--theme-fg)]/30 pt-8">
             <h3 className="text-2xl font-black uppercase mb-4 flex items-center gap-2">
              <ScrollText /> Hasil {mode === "enc" ? "Enkripsi (Hex Output)" : "Dekripsi (String Asli)"}
            </h3>
            <div className="bg-[var(--theme-bg)] border-2 border-[var(--theme-fg)] p-6 font-mono text-sm sm:text-base shadow-[6px_6px_0px_0px_var(--theme-accent)] relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                 <ScrollText size={120} />
               </div>
               <div className="space-y-4 relative z-10">
                 <div className="flex flex-col sm:flex-row gap-2 border-b border-[var(--theme-fg)]/30 pb-2">
                   <span className="opacity-50 w-32 border-r border-[var(--theme-fg)]/30 shrink-0">TAGS:</span>
                   <div className="flex gap-2 flex-wrap">
                     <span className="bg-[var(--theme-fg)]/10 text-[var(--theme-fg)] px-2 py-0.5 text-xs border border-[var(--theme-fg)]/30">BLOCK_16_BYTES</span>
                     <span className="bg-[var(--theme-fg)]/10 text-[var(--theme-fg)] px-2 py-0.5 text-xs border border-[var(--theme-fg)]/30">PKCS#7</span>
                   </div>
                 </div>
                 <div className="flex flex-col sm:flex-row gap-2 pt-2">
                   <span className="text-[var(--theme-accent)] w-32 border-r border-[var(--theme-fg)]/30 shrink-0 font-bold">OUTPUT:</span>
                   <span className="text-[var(--theme-accent)] font-bold break-all">{resultText}</span>
                 </div>
               </div>
            </div>
          </div>
        )}

        {/* OUTPUT: IMAGE VISUALIZATION */}
        <div className={`mt-8 border-t-4 border-[var(--theme-fg)]/30 pt-8 ${inputType === "image" && imageSrc ? "block" : "hidden"}`}>
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black uppercase flex items-center gap-2">
                 <ImageIcon /> Visualisasi Blok
              </h3>
              <button onClick={handleDownloadImage} className="border-2 border-[var(--theme-fg)] px-4 py-2 font-bold uppercase text-sm hover:bg-[var(--theme-fg)] hover:text-[var(--theme-bg)] flex items-center gap-2 bg-[var(--theme-bg)] text-[var(--theme-fg)] transition-colors">
                <Download size={16}/> Unduh Hasil
              </button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                 <p className="font-bold uppercase border-b-2 border-[var(--theme-fg)] pb-2 mb-4">Input (.PNG / .JPG)</p>
                 <div className="border-2 border-[var(--theme-fg)] bg-[var(--theme-fg)]/5 min-h-[200px] flex items-center justify-center overflow-hidden">
                    <canvas ref={canvasOriginalRef} className="max-w-full max-h-[400px]" />
                 </div>
              </div>
              <div>
                 <p className="font-bold uppercase border-b-2 border-[var(--theme-fg)] pb-2 mb-4 bg-[var(--theme-fg)] text-[var(--theme-bg)] px-2">Output ({method.toUpperCase()})</p>
                 <div className="border-2 border-[var(--theme-fg)] bg-[var(--theme-fg)]/5 min-h-[200px] flex items-center justify-center overflow-hidden relative group">
                    <canvas ref={canvasProcessedRef} className="max-w-full max-h-[400px]" />
                    <div className="absolute inset-0 bg-[var(--theme-fg)]/60 items-center justify-center hidden group-hover:flex">
                       <p className="text-[var(--theme-bg)] font-black text-lg border-2 border-[var(--theme-bg)] px-4 py-2 opacity-50 pointer-events-none">RESULT RENDERED</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  )
}
