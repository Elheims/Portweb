export function AchievementsList() {
  const logs = [
    { date: "2026-2", type: "CERT", title: "Machine Learning By ASAH", status: "VERIFIED" },  
    { date: "2026-1", type: "Capstone", title: "AI Learning Insight", status: "VERIFIED" },
    { date: "2000-00", type: "******", title: "******", status: "******" },
    { date: "2000-00", type: "******", title: "******", status: "******" }
  ]

  return (
    <section id="achievements" className="py-20 px-4 border-b-2 border-black bg-[var(--theme-bg)]">
      <div className="container max-w-4xl mx-auto space-y-12">
        <h2 className="text-5xl font-black uppercase tracking-tighter inline-block border-b-4 border-black pb-2" style={{ fontFamily: 'var(--font-archivo-black)' }}>
          System Logs: Achievements
        </h2>

        <div className="border-2 border-black bg-black text-[#00ff00] font-mono p-6 sm:p-8 shadow-[8px_8px_0px_0px_var(--theme-fg)] text-sm sm:text-base overflow-x-auto">
          <div className="space-y-4 min-w-[500px]">
            {logs.map((log, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-2 sm:gap-4 hover:bg-[#003300] transition-colors p-2 -mx-2">
                <span className="opacity-70 whitespace-nowrap">[{log.date}]</span>
                <span className="font-bold text-white whitespace-nowrap">{'>'} {log.type}:</span>
                <span className="flex-1 text-white">{log.title}</span>
                <span className="whitespace-nowrap">STATUS=[<span className="text-[#00ff00]">{log.status}</span>]</span>
              </div>
            ))}
            <div className="mt-8 animate-pulse text-white">
              END OF LOG _
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
