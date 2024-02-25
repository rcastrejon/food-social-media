import { redirect } from "next/navigation"

import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { lucia } from "~/server/auth"
import { destroySession } from "~/server/auth/sessions"
import { validateRequest } from "~/server/auth/validate-request"
import { Navbar, SignInButton } from "./navbar"

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = await validateRequest()

  return (
    <div>
      <header className="sticky top-0 z-40 grid h-strip grid-cols-1 items-center border-b bg-background/85 backdrop-blur-xl md:h-header md:grid-cols-[1fr,_max-content,_1fr]">
        <div className="hidden md:block" />
        <div className="hidden w-screen max-w-lg md:block">
          <Navbar />
        </div>
        <div className="ml-auto mr-3.5">
          <HeaderRightSlot isAuthenticated={user !== null} />
        </div>
      </header>
      <main className="mb-header md:mb-0">{children}</main>
      <div className="fixed bottom-0 z-40 h-header w-screen border-t bg-background/85 backdrop-blur-xl md:hidden">
        <Navbar />
      </div>
    </div>
  )
}

function HeaderRightSlot({ isAuthenticated }: { isAuthenticated: boolean }) {
  async function logout() {
    "use server"

    const { session } = await validateRequest()
    if (!session) {
      redirect("/")
    }

    await lucia.invalidateSession(session.id)
    await destroySession({
      sessionId: session.id,
      redirectTo: "/",
    })
  }

  if (isAuthenticated) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="h-12 w-12" variant="ghost" size="icon">
            <span className="i-[lucide--align-right] h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <form action={logout}>
            <DropdownMenuItem asChild>
              <button className="w-full" type="submit">
                Cerrar sesión
              </button>
            </DropdownMenuItem>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
  return <SignInButton />
}
