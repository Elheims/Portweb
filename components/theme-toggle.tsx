"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-10 h-10" />
  }

  const isWarm = resolvedTheme === "dark" // "dark" class now acts as "warm"

  return (
    <button
      onClick={() => setTheme(isWarm ? "light" : "dark")}
      className={`p-2 border-2 border-black transition-colors flex items-center justify-center font-bold text-xs uppercase gap-2 ${isWarm ? 'bg-black text-[var(--theme-bg)]' : 'bg-white text-black hover:bg-black hover:text-white'}`}
      aria-label="Toggle eye-comfort mode"
    >
      {isWarm ? "Warm On" : "Eye Comfort"}
    </button>
  )
}
