"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useDebounceCallback } from "usehooks-ts"

import { Input } from "~/components/ui/input"

export function SearchBar() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const handleSearch = useDebounceCallback((query: string) => {
    const params = new URLSearchParams(searchParams)
    if (query) {
      params.set("query", query)
    } else {
      params.delete("query")
    }
    router.replace(`${pathname}?${params.toString()}`)
  }, 300)

  return (
    <Input
      placeholder="Buscar receta"
      onChange={(e) => {
        handleSearch(e.target.value)
      }}
      defaultValue={searchParams.get("query")?.toString()}
    />
  )
}
