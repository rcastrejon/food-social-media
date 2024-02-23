import Image from "next/image"
import { redirect } from "next/navigation"

import { validateRequest } from "~/server/auth/validate-request"
import cover from "./sandwich-cover.jpeg"

export default async function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user } = await validateRequest()
  if (user) {
    return redirect("/")
  }

  return (
    <div className="flex min-h-screen flex-row-reverse">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20">
        {children}
      </div>
      <div className="relative hidden w-0 flex-1 lg:block">
        <Image
          className="inset-0 h-full w-full object-cover"
          src={cover}
          alt="Un sándwich en una tabla de cortar con lechuga, tocino y rodajas de tomate."
          placeholder="blur"
          sizes="(min-width: 1024px) 100vw, 0px"
          fill
        />
      </div>
    </div>
  )
}
