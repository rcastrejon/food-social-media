"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"

const config = [
  {
    title: "Inicio",
    icon: "i-[mingcute--home-4-line]",
    iconSolid: "i-[mingcute--home-4-fill]",
    href: "/",
  },
  {
    title: "Buscar",
    icon: "i-[mingcute--search-line]",
    iconSolid: "i-[mingcute--search-fill]",
    href: "/search",
  },
  {
    title: "Perfil",
    icon: "i-[mingcute--user-2-line]",
    iconSolid: "i-[mingcute--user-2-fill]",
    href: "/profile",
  },
  {
    title: "Nueva receta",
    icon: "i-[mingcute--edit-line]",
    iconSolid: "i-[mingcute--edit-fill]",
    href: "/new",
  },
]

export function Navbar() {
  const pathName = usePathname()
  return (
    <nav className="grid grid-cols-4">
      {config.map((item) => (
        <div className="grid h-header" key={item.title}>
          <Button
            className="mx-0.5 my-1 h-auto hover:bg-black/5"
            variant="ghost"
            asChild
          >
            <Link href={item.href} aria-label={item.title}>
              <span
                className={cn(
                  "h-6 w-6",
                  pathName === item.href ? item.iconSolid : item.icon,
                )}
              />
            </Link>
          </Button>
        </div>
      ))}
    </nav>
  )
}

export function SignInButton() {
  const pathName = usePathname()
  return (
    <Button size="sm">
      <Link href={`/sign-in?redirect-to=${pathName}`}>Iniciar sesión</Link>
    </Button>
  )
}
