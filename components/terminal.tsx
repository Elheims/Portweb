"use client"

const LINES = [
  { prompt: true, text: "whoami" },
  { prompt: false, text: "ferla -- computer engineering undergrad" },
  { prompt: true, text: "cat /etc/status" },
  { prompt: false, text: "STATUS: BUILDING THINGS" },
  { prompt: false, text: "FOCUS : EMBEDDED SYSTEMS / IOT / LOW-LEVEL" },
  { prompt: false, text: "STACK : C, RUST, PYTHON, VHDL" },
  { prompt: true, text: "uptime" },
  { prompt: false, text: "4 semesters, 0 downtime" },
]

export function Terminal() {
  return (
    <div className="border-2 border-foreground bg-background w-full" aria-label="Terminal bio">
      {/* Title bar */}
      <div className="flex items-center gap-2 border-b-2 border-foreground px-4 py-2 bg-foreground">
        <span className="font-mono text-xs font-bold text-background uppercase tracking-widest">
          ferla@portfolio:~$
        </span>
      </div>

      {/* Terminal body */}
      <div className="p-4 font-mono text-xs md:text-sm leading-relaxed">
        {LINES.map((line, i) => (
          <div key={i} className="flex gap-2">
            {line.prompt ? (
              <>
                <span className="text-foreground font-bold select-none">{">"}</span>
                <span className="text-foreground">{line.text}</span>
              </>
            ) : (
              <span className="text-muted-foreground pl-4">{line.text}</span>
            )}
          </div>
        ))}
        {/* Blinking cursor */}
        <div className="flex gap-2 mt-1">
          <span className="text-foreground font-bold select-none">{">"}</span>
          <span className="cursor-blink text-foreground">_</span>
        </div>
      </div>
    </div>
  )
}
