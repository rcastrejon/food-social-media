import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"

import "~/globals.css"

import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin"
import { extractRouterConfig } from "uploadthing/server"

import { ourFileRouter } from "~/app/api/uploadthing/core"
import { Toaster } from "~/components/ui/sonner"
import Providers from "~/lib/providers"
import { cn } from "~/lib/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
})

export const metadata: Metadata = {
  title: "Recetarium",
  description: "Recetas de cocina fáciles de preparar, nutritivas y baratas.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body
        className={cn(
          "bg-background font-sans antialiased",
          inter.variable,
          playfair.variable,
        )}
      >
        <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
        <Providers>
          {children}
          <Toaster closeButton richColors />
        </Providers>
      </body>
    </html>
  )
}
