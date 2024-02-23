"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { valibotResolver } from "@hookform/resolvers/valibot"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import type { SignInInput } from "~/lib/validators/auth"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import { SignInSchema } from "~/lib/validators/auth"
import { SubmitButton } from "../../../components/submit-button"
import { signIn } from "../actions"

export default function Page() {
  const searchParams = useSearchParams()

  return (
    <main className="mx-auto w-full max-w-96 lg:w-96">
      <div className="space-y-1.5">
        <h1 className="font-serif text-2xl font-semibold leading-none tracking-tight">
          Iniciar sesión
        </h1>
        <p className="text-sm text-muted-foreground">
          No tienes cuenta?{" "}
          <Link
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            href={`/sign-up?${searchParams.toString()}`}
          >
            Regístrate
          </Link>
        </p>
      </div>
      <div className="mt-6">
        <SignInForm redirectTo={searchParams.get("redirect-to") ?? undefined} />
      </div>
    </main>
  )
}

function SignInForm({ redirectTo }: { redirectTo: string | undefined }) {
  const form = useForm<SignInInput>({
    resolver: valibotResolver(SignInSchema),
    defaultValues: {
      username: "",
      password: "",
      redirectTo,
    },
  })
  const { isPending, mutate } = useMutation({
    mutationFn: signIn,
    onError: () => {
      toast.error("Ocurrió un error.")
    },
    onSuccess: (_data) => {
      // the server automatically redirects the user.
      toast.info("Redirigiendo...")
    },
  })

  const onSubmit = form.handleSubmit((values: SignInInput) => mutate(values))

  return (
    <Form {...form}>
      <form className="grid gap-4" onSubmit={onSubmit}>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de usuario</FormLabel>
              <FormControl>
                <Input placeholder="john_doe" maxLength={15} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <SubmitButton isSubmitting={isPending}>Iniciar sesión</SubmitButton>
      </form>
    </Form>
  )
}
