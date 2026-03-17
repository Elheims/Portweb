"use client"

import * as React from "react"
import { Sun } from "lucide-react"

export function ThemeToggle() {
  const [warmth, setWarmth] = React.useState(0)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("warmthLevel")
    if (saved) {
      const w = parseInt(saved)
      setWarmth(w)
      document.documentElement.style.setProperty("--warmth", `${w}%`)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value)
    setWarmth(val)
    document.documentElement.style.setProperty("--warmth", `${val}%`)
    localStorage.setItem("warmthLevel", val.toString())
  }

  if (!mounted) return <div className="h-10 w-32" />

  return (
    <div className="flex items-center gap-2 border-2 border-black bg-white px-2 py-1 shadow-[2px_2px_0px_0px_var(--theme-fg)]">
      <Sun size={16} className="text-black" />
      <span className="text-[10px] font-bold uppercase text-black w-8">{warmth}%</span>
      <input
        type="range"
        min="0"
        max="100"
        value={warmth}
        onChange={handleChange}
        className="w-20 md:w-24 accent-black cursor-pointer"
        aria-label="Atur tingkat filter kuning"
      />
    </div>
  )
}
