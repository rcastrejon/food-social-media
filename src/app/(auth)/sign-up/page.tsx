"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { valibotResolver } from "@hookform/resolvers/valibot"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import type { SignUpInput } from "~/lib/validators/auth"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import { SignUpSchema } from "~/lib/validators/auth"
import { SubmitButton } from "../../../components/submit-button"
import { signUp } from "../actions"

export default function Page() {
  const searchParams = useSearchParams()

  return (
    <main className="mx-auto w-full max-w-96 lg:w-96">
      <div className="space-y-1.5">
        <h1 className="font-serif text-2xl font-semibold leading-none tracking-tight">
          Crea una cuenta nueva
        </h1>
        <p className="text-sm text-muted-foreground">
          Ya tienes cuenta?{" "}
          <Link
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            href={`/sign-in?${searchParams.toString()}`}
          >
            Inicia sesión
          </Link>
        </p>
      </div>
      <div className="mt-6">
        <SignUpForm redirectTo={searchParams.get("redirect-to") ?? undefined} />
      </div>
    </main>
  )
}

function SignUpForm({ redirectTo }: { redirectTo: string | undefined }) {
  const form = useForm<SignUpInput>({
    resolver: valibotResolver(SignUpSchema),
    defaultValues: {
      username: "",
      password: "",
      passwordConfirm: "",
      redirectTo,
    },
  })
  const { isPending, mutate } = useMutation({
    mutationFn: signUp,
    onError: () => {
      toast.error("Ocurrió un error.")
    },
    onSuccess: (data) => {
      if (data.status === 400) {
        toast.error(data.message)
        return
      }
      // account has been created, the server automatically redirects the user.
      toast.info("Registro exitoso. Redirigiendo...")
    },
  })

  const onSubmit = form.handleSubmit((values: SignUpInput) => mutate(values))

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
                <Input
                  placeholder="john_doe"
                  maxLength={15}
                  required
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Este nombre será visible para otros usuarios. Solo puede
                contener letras, números y guiones bajos.
              </FormDescription>
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
                <Input
                  type="password"
                  placeholder="••••••••"
                  required
                  {...field}
                />
              </FormControl>
              <FormDescription>
                La contraseña debe tener al menos 8 caracteres.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="passwordConfirm"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar contraseña</FormLabel>
              <FormControl>
                <Input type="password" required {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <SubmitButton isSubmitting={isPending}>Registrarte</SubmitButton>
      </form>
    </Form>
  )
}
