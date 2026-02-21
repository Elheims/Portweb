export function HeroSection() {
  return (
    <section id="about" className="py-20 px-4 min-h-[80vh] flex flex-col justify-center items-center border-b-2 border-black bg-white">
      <div className="container max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-4">
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter" style={{ fontFamily: 'var(--font-archivo-black)' }}>
            ferla.id
          </h1>
          <p className="text-xl md:text-2xl font-mono border-2 border-black inline-block px-4 py-2 bg-black text-white">
            Computer Engineering Undergraduate
          </p>
        </div>

        {/* Terminal Style Bio Window */}
        <div className="border-2 border-black bg-black text-white font-mono shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="border-b-2 border-white flex items-center px-4 py-2 gap-2 bg-black">
            <div className="w-3 h-3 rounded-full bg-white"></div>
            <div className="w-3 h-3 rounded-full bg-white border border-white bg-transparent"></div>
            <div className="w-3 h-3 rounded-full bg-white border border-white bg-transparent"></div>
            <span className="ml-2 text-sm">ferla@system:~</span>
          </div>
          <div className="p-6 space-y-4">
            <p><span className="text-green-400">$</span> whoami</p>
            <p className="pl-4 leading-relaxed">
              I'm Ferla, a passionate Computer Engineering undergraduate specialized in 
              hardware-software interfaces, embedded systems, and rigorous system design. 
              Currently exploring FPGA development, RTOS architectures, and high-performance computing.
            </p>
            <p><span className="text-green-400">$</span> cat skills.txt</p>
            <p className="pl-4">
              [SYSTEMS]: C/C++, Rust, Assembly (ARM, x86)<br />
              [HARDWARE]: Verilog, VHDL, FPGA, PCB Design<br />
              [TOOLS]: Linux, Git, Make, Bash, Docker
            </p>
            <p className="animate-pulse"><span className="text-green-400">$</span> _</p>
          </div>
        </div>
      </div>
    </section>
  )
}
