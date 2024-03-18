import type { ClassValue } from "clsx"
import { clsx } from "clsx"
import { generateId } from "lucia"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const prefixes = {
  user: "user",
  recipe: "recipe",
  media: "media",
  test: "test",
} as const

export function newId(prefix: keyof typeof prefixes): string {
  return [prefixes[prefix], generateId(15)].join("_")
}
