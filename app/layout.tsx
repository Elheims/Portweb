import type React from "react"
import type { Metadata, Viewport } from "next"
import { Archivo_Black, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-archivo-black",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
})

export const metadata: Metadata = {
  title: "ferla.id - Computer Engineering Undergraduate",
  description:
    "Portfolio of Ferla, a Computer Engineering Undergraduate. Projects, achievements, and technical profile.",
  openGraph: {
    title: "ferla.id - Computer Engineering Undergraduate",
    description:
      "Portfolio of Ferla, a Computer Engineering Undergraduate.",
    url: "https://ferla.id",
    siteName: "ferla.id",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ferla.id - Computer Engineering Undergraduate",
    description:
      "Portfolio of Ferla, a Computer Engineering Undergraduate.",
  },
}

export const viewport: Viewport = {
  themeColor: "#000000",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${archivoBlack.variable} ${jetbrainsMono.variable}`}>
      <body className="font-mono antialiased">{children}</body>
    </html>
  )
}
