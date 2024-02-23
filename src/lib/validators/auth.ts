import type { Input } from "valibot"
import {
  custom,
  forward,
  maxLength,
  minLength,
  object,
  optional,
  regex,
  string,
} from "valibot"

export const SignUpSchema = object(
  {
    username: string([
      minLength(1, "Elige un nombre de usuario."),
      regex(/^[a-zA-Z0-9_]+$/, "Nombre de usuario inválido."),
      minLength(3, "Nombre de usuario demasiado corto."),
      maxLength(15, "Nombre de usuario demasiado largo."),
    ]),
    password: string([
      minLength(1, "Elige una contraseña."),
      minLength(8, "Contraseña demasiado corta."),
    ]),
    passwordConfirm: string(),
    redirectTo: optional(string()),
  },
  [
    forward(
      custom(
        (input) => input.password === input.passwordConfirm,
        "Las contraseñas no coinciden.",
      ),
      ["passwordConfirm"],
    ),
  ],
)

export type SignUpInput = Input<typeof SignUpSchema>

export const SignInSchema = object({
  username: string([minLength(1, "Ingresa tu nombre de usuario.")]),
  password: string([minLength(1, "Ingresa tu contraseña.")]),
  redirectTo: optional(string()),
})

export type SignInInput = Input<typeof SignInSchema>
