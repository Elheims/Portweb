"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"

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

  const handleToggle = () => {
    const val = warmth === 100 ? 0 : 100
    setWarmth(val)
    document.documentElement.style.setProperty("--warmth", `${val}%`)
    localStorage.setItem("warmthLevel", val.toString())
  }

  if (!mounted) return <div className="h-10 w-32" />

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-2 border-2 border-black px-4 py-2 uppercase font-bold text-sm shadow-[2px_2px_0px_0px_var(--theme-fg)] transition-all ${
        warmth === 100 
          ? "bg-[var(--theme-bg)] text-[var(--theme-fg)]" 
          : "bg-white text-black hover:bg-black hover:text-white"
      }`}
      aria-label="Atur Mode Biru"
    >
      {warmth === 100 ? <Moon size={16} /> : <Sun size={16} />}
      {warmth === 100 ? "NIGHT" : "DAY"}
    </button>
  )
}
