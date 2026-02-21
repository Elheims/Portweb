import Link from "next/link"

const projects = [
  {
    title: "RISC-V Processor Design",
    description: "A custom 32-bit RISC-V pipelined processor architecture designed from scratch. Outperforms standard educational cores in branch prediction.",
    specs: ["Verilog", "FPGA", "Logisim"],
    status: "FUNCTIONAL",
    link: "#"
  },
  {
    title: "RTOS Kernel Implementation",
    description: "Lightweight real-time operating system with preemptive scheduling and priority inheritance. Tested on STM32 microcontrollers.",
    specs: ["C/C++", "Assembly", "STM32"],
    status: "STABLE",
    link: "#"
  },
  {
    title: "Autonomous Drone Controller",
    description: "PID-based flight controller with sensor fusion for MPU6050 telemetry data processing in real-time.",
    specs: ["Rust", "Embedded", "I2C/SPI"],
    status: "PROTOTYPE",
    link: "#"
  }
]

export function ProjectsGrid() {
  return (
    <section id="projects" className="py-20 px-4 border-b-2 border-black bg-white">
      <div className="container max-w-6xl mx-auto space-y-12">
        <h2 className="text-5xl font-black uppercase tracking-tighter inline-block border-b-4 border-black pb-2" style={{ fontFamily: 'var(--font-archivo-black)' }}>
          Schematics: Projects
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 font-mono">
          {projects.map((project, index) => (
            <div key={index} className="border-2 border-black flex flex-col sm:flex-row bg-white hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-shadow">
              
              {/* Main Content Area */}
              <div className="flex-1 p-6 border-b-2 sm:border-b-0 sm:border-r-2 border-black flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold uppercase" style={{ fontFamily: 'var(--font-archivo-black)' }}>
                    {project.title}
                  </h3>
                  <p className="text-lg leading-relaxed">
                    {project.description}
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t-2 border-black border-dashed flex items-center justify-between">
                  <span className="bg-black text-white px-3 py-1 text-sm font-bold uppercase">Status: [{project.status}]</span>
                  <Link href={project.link} className="font-bold underline hover:bg-black hover:text-white px-2 py-1 transition-colors uppercase">
                    View Source ~{'>'}
                  </Link>
                </div>
              </div>

              {/* Technical Specs Sidebar */}
              <div className="w-full sm:w-48 bg-gray-100 p-6 flex flex-col gap-4">
                <h4 className="font-bold border-b-2 border-black pb-2 uppercase text-sm">Tech Specs</h4>
                <ul className="space-y-3">
                  {project.specs.map((spec, sIndex) => (
                    <li key={sIndex} className="flex items-center gap-2 text-sm font-bold break-all">
                      <div className="w-2 h-2 bg-black flex-shrink-0"></div>
                      {spec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
