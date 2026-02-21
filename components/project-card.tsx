"use client"

import { ArrowUpRight } from "lucide-react"
import type { Project } from "@/lib/portfolio-data"

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="border-2 border-foreground bg-background flex flex-col h-full">
      {/* Title bar */}
      <div className="border-b-2 border-foreground px-5 py-4 flex items-start justify-between gap-4">
        <h3 className="font-sans text-lg md:text-xl uppercase leading-tight text-foreground">
          {project.title}
        </h3>
        {project.url && (
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 border-2 border-foreground p-1.5 bg-background text-foreground hover:bg-foreground hover:text-background"
            style={{ boxShadow: "3px 3px 0px var(--foreground)" }}
            aria-label={`Open ${project.title}`}
            onMouseDown={(e) => {
              const target = e.currentTarget as HTMLAnchorElement
              target.style.boxShadow = "none"
              target.style.transform = "translate(3px, 3px)"
            }}
            onMouseUp={(e) => {
              const target = e.currentTarget as HTMLAnchorElement
              target.style.boxShadow = "3px 3px 0px var(--foreground)"
              target.style.transform = "translate(0, 0)"
            }}
            onMouseLeave={(e) => {
              const target = e.currentTarget as HTMLAnchorElement
              target.style.boxShadow = "3px 3px 0px var(--foreground)"
              target.style.transform = "translate(0, 0)"
            }}
          >
            <ArrowUpRight className="w-4 h-4" />
          </a>
        )}
      </div>

      {/* Body */}
      <div className="px-5 py-4 flex flex-col flex-1">
        <p className="font-mono text-sm text-foreground leading-relaxed mb-5">
          {project.description}
        </p>

        {/* Tech stack badges */}
        <div className="mt-auto flex flex-wrap gap-2 pt-4 border-t-2 border-foreground">
          {project.techStack.map((tech) => (
            <span
              key={tech}
              className="font-mono text-xs px-2 py-1 border border-foreground bg-background text-foreground uppercase tracking-wider"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
