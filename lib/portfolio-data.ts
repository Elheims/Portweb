export interface Project {
  id: string
  title: string
  description: string
  techStack: string[]
  url?: string
}

export interface Achievement {
  id: string
  date: string
  title: string
  detail: string
}

export const PROJECTS: Project[] = [
  {
    id: "proj-1",
    title: "EMBEDDED RTOS SCHEDULER",
    description:
      "Custom real-time operating system scheduler for ARM Cortex-M4. Supports priority-based preemptive multitasking with O(1) context switching.",
    techStack: ["C", "ARM", "RTOS", "GDB"],
    url: "#",
  },
  {
    id: "proj-2",
    title: "FPGA SIGNAL PROCESSOR",
    description:
      "Hardware-accelerated DSP pipeline on Xilinx FPGA. Implements FFT, FIR filtering, and real-time audio analysis at 48 kHz sample rate.",
    techStack: ["VHDL", "Vivado", "FPGA", "DSP"],
    url: "#",
  },
  {
    id: "proj-3",
    title: "IOT SENSOR MESH NETWORK",
    description:
      "Low-power wireless mesh network for environmental monitoring. 50+ nodes communicating via custom LoRa protocol with edge ML inference.",
    techStack: ["Python", "LoRa", "MQTT", "TensorFlow Lite"],
    url: "#",
  },
  {
    id: "proj-4",
    title: "COMPILER FOR MINI-LANG",
    description:
      "End-to-end compiler from lexing to x86-64 code generation. Supports type inference, closures, and basic garbage collection.",
    techStack: ["Rust", "LLVM", "x86-64", "Assembly"],
    url: "#",
  },
]

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "ach-1",
    date: "2025-11-12",
    title: "1ST PLACE // NATIONAL EMBEDDED SYSTEMS COMPETITION",
    detail: "Built an autonomous drone navigation system under 72h.",
  },
  {
    id: "ach-2",
    date: "2025-08-03",
    title: "AWS CERTIFIED SOLUTIONS ARCHITECT - ASSOCIATE",
    detail: "Cloud infrastructure design and deployment certification.",
  },
  {
    id: "ach-3",
    date: "2025-05-20",
    title: "FINALIST // GEMASTIK XVI - DATA MINING",
    detail: "National IT competition by the Indonesian Ministry of Education.",
  },
  {
    id: "ach-4",
    date: "2024-12-01",
    title: "BEST PAPER // IEEE STUDENT CONFERENCE",
    detail: "Research on low-power edge computing for IoT networks.",
  },
  {
    id: "ach-5",
    date: "2024-09-15",
    title: "3RD PLACE // ICPC REGIONAL QUALIFIER",
    detail: "Competitive programming regional round, team of three.",
  },
  {
    id: "ach-6",
    date: "2024-03-10",
    title: "CISCO CCNA CERTIFICATION",
    detail: "Network fundamentals, switching, routing, and security.",
  },
]
